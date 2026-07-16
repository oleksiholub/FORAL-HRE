function requiredEnv(name, { optional = false, fallback = undefined } = {}) {
  const value = process.env[name];
  if (value == null || value === "") {
    if (optional) return fallback;
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(env = process.env) {
  const port = Number(env.PORT ?? env.PLAYWRIGHT_MCP_PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT/PLAYWRIGHT_MCP_PORT: ${env.PORT ?? env.PLAYWRIGHT_MCP_PORT}`);
  }

  const apiKey = env.PLAYWRIGHT_MCP_API_KEY ?? "";
  const requireAuth = env.PLAYWRIGHT_MCP_REQUIRE_AUTH !== "false";

  if (requireAuth && !apiKey) {
    throw new Error(
      "PLAYWRIGHT_MCP_API_KEY is required unless PLAYWRIGHT_MCP_REQUIRE_AUTH=false"
    );
  }

  return {
    port,
    host: env.HOST ?? "0.0.0.0",
    apiKey,
    requireAuth,
    serviceName: env.PLAYWRIGHT_MCP_SERVICE_NAME ?? "foral-hre-playwright-mcp",
    headless: env.PLAYWRIGHT_HEADLESS !== "false",
    browserChannel: env.PLAYWRIGHT_BROWSER ?? "chromium"
  };
}
