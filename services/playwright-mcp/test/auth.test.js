import test from "node:test";
import assert from "node:assert/strict";
import { extractApiKey, isAuthorized } from "../src/auth.js";

test("extractApiKey reads X-API-Key", () => {
  assert.equal(extractApiKey({ "x-api-key": "abc" }), "abc");
});

test("extractApiKey reads Bearer token", () => {
  assert.equal(extractApiKey({ authorization: "Bearer secret" }), "secret");
});

test("isAuthorized rejects missing key", () => {
  const result = isAuthorized({
    headers: {},
    expectedApiKey: "secret",
    requireAuth: true
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "missing_api_key");
});

test("isAuthorized accepts matching key", () => {
  const result = isAuthorized({
    headers: { "x-api-key": "secret" },
    expectedApiKey: "secret",
    requireAuth: true
  });
  assert.equal(result.ok, true);
});

test("isAuthorized rejects wrong key", () => {
  const result = isAuthorized({
    headers: { "x-api-key": "wrong" },
    expectedApiKey: "secret",
    requireAuth: true
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "invalid_api_key");
});
