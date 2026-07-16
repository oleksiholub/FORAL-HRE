import os

os.environ.setdefault("K6_MCP_API_KEY", "test-key")
os.environ.setdefault("K6_MCP_REQUIRE_AUTH", "true")
os.environ.setdefault("PORT", "8080")

from fastapi.testclient import TestClient
from app.main import app


def test_healthz_public():
    client = TestClient(app)
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"