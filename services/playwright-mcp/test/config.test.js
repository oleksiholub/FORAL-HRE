import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loadConfig accepts valid port and api key", () => {
  const cfg = loadConfig({
    PORT: "8080",
    PLAYWRIGHT_MCP_API_KEY: "test-key-123",
    PLAYWRIGHT_MCP_REQUIRE_AUTH: "true"
  });

  assert.equal(cfg.port, 8080);
  assert.equal(cfg.apiKey, "test-key-123");
  assert.equal(cfg.requireAuth, true);
});

test("loadConfig fails without api key when auth required", () => {
  assert.throws(
    () =>
      loadConfig({
        PORT: "8080",
        PLAYWRIGHT_MCP_REQUIRE_AUTH: "true"
      }),
    /PLAYWRIGHT_MCP_API_KEY/
  );
});

test("loadConfig allows missing key when auth disabled", () => {
  const cfg = loadConfig({
    PORT: "8080",
    PLAYWRIGHT_MCP_REQUIRE_AUTH: "false"
  });
  assert.equal(cfg.requireAuth, false);
});
