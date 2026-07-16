import express from "express";
import { createConnection } from "@playwright/mcp";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { loadConfig } from "./config.js";
import { createAuthMiddleware } from "./auth.js";

const config = loadConfig();
const app = express();

// Capture raw body for MCP POSTs where needed; JSON for ordinary routes.
app.use(
  express.json({
    limit: "2mb",
    type: ["application/json", "application/*+json"]
  })
);

const auth = createAuthMiddleware({
  expectedApiKey: config.apiKey,
  requireAuth: config.requireAuth
});

/** @type {Map<string, { transport: SSEServerTransport, connection: Awaited<ReturnType<typeof createConnection>> }>} */
const sseSessions = new Map();

async function createPlaywrightConnection() {
  // Official Playwright MCP connection factory.
  // headless + no-sandbox are required for typical Cloud Run containers.
  return createConnection({
    browser: {
      browserName: config.browserChannel,
      launchOptions: {
        headless: config.headless,
        args: ["--no-sandbox", "--disable-dev-shm-usage"]
      }
    }
  });
}

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    service: config.serviceName,
    status: "ok",
    authRequired: config.requireAuth,
    transports: ["sse", "streamable-http"],
    endpoints: {
      healthz: "/healthz",
      sse: "/sse",
      messages: "/messages",
      mcp: "/mcp"
    }
  });
});

// SSE transport (common remote MCP pattern)
app.get("/sse", auth, async (req, res) => {
  let connection;
  try {
    connection = await createPlaywrightConnection();
    const transport = new SSEServerTransport("/messages", res);
    sseSessions.set(transport.sessionId, { transport, connection });

    res.on("close", async () => {
      sseSessions.delete(transport.sessionId);
      try {
        await connection.close?.();
      } catch {
        // best-effort cleanup
      }
    });

    await connection.connect(transport);
  } catch (error) {
    console.error("SSE connect failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "sse_connect_failed",
        message: error instanceof Error ? error.message : String(error)
      });
    }
    try {
      await connection?.close?.();
    } catch {
      // ignore
    }
  }
});

app.post("/messages", auth, async (req, res) => {
  const sessionId = String(req.query.sessionId ?? "");
  const session = sseSessions.get(sessionId);

  if (!session) {
    res.status(400).json({
      error: "unknown_session",
      message: "No active SSE transport for sessionId"
    });
    return;
  }

  try {
    await session.transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error("SSE message handling failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "message_handling_failed",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
});

// Streamable HTTP transport (preferred by some clients using /mcp)
app.post("/mcp", auth, async (req, res) => {
  let connection;
  try {
    connection = await createPlaywrightConnection();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    res.on("close", async () => {
      try {
        await connection.close?.();
        await transport.close?.();
      } catch {
        // best-effort
      }
    });

    await connection.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Streamable HTTP handling failed", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "mcp_http_failed",
        message: error instanceof Error ? error.message : String(error)
      });
    }
    try {
      await connection?.close?.();
    } catch {
      // ignore
    }
  }
});

// Explicit deny for unauthenticated probe of protected roots
app.get("/", (_req, res) => {
  res.status(200).json({
    service: config.serviceName,
    message: "Playwright MCP gateway. Use /healthz or authenticated /sse|/mcp."
  });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error", err);
  res.status(500).json({
    error: "internal_error",
    message: err instanceof Error ? err.message : String(err)
  });
});

const server = app.listen(config.port, config.host, () => {
  console.log(
    JSON.stringify({
      service: config.serviceName,
      status: "listening",
      host: config.host,
      port: config.port,
      authRequired: config.requireAuth
    })
  );
});

function shutdown(signal) {
  console.log(JSON.stringify({ service: config.serviceName, signal, status: "shutting_down" }));
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));