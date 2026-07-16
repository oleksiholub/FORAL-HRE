const port = Number(process.env.PLAYWRIGHT_MCP_PORT ?? 8080);

const server = Bun?.serve
  ? Bun.serve({
      port,
      fetch() {
        return new Response("Not implemented", { status: 501 });
      }
    })
  : null;

if (!server) {
  console.log(
    JSON.stringify({
      service: "foral-hre-playwright-mcp",
      status: "bootstrap-only",
      message: "Runtime implementation begins in A.2"
    })
  );
}
