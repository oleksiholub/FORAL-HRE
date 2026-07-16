import pytest

from app.config import load_settings


def test_load_settings_ok():
    s = load_settings(
        {
            "PORT": "8080",
            "K6_MCP_API_KEY": "k",
            "K6_MCP_REQUIRE_AUTH": "true",
        }
    )
    assert s.port == 8080
    assert s.api_key == "k"
    assert s.require_auth is True


def test_missing_key_raises():
    with pytest.raises(ValueError, match="K6_MCP_API_KEY"):
        load_settings({"PORT": "8080", "K6_MCP_REQUIRE_AUTH": "true"})
