import test from "node:test";
import assert from "node:assert/strict";

test("bootstrap contract declares Node runtime", () => {
  assert.equal(process.versions.node.split(".")[0] >= "22", true);
});
