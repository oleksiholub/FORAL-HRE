from app.auth import extract_api_key, is_authorized


def test_extract_x_api_key():
    assert extract_api_key({"x-api-key": "abc"}) == "abc"


def test_extract_bearer():
    assert extract_api_key({"authorization": "Bearer secret"}) == "secret"


def test_missing_key_rejected():
    ok, reason = is_authorized(headers={}, expected_api_key="secret", require_auth=True)
    assert ok is False
    assert reason == "missing_api_key"


def test_valid_key_accepted():
    ok, reason = is_authorized(
        headers={"x-api-key": "secret"},
        expected_api_key="secret",
        require_auth=True,
    )
    assert ok is True
    assert reason == "ok"
