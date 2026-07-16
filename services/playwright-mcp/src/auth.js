/**
 * Extract API key from headers.
 * Accepts:
 * - X-API-Key: <token>
 * - Authorization: Bearer <token>
 * - Authorization: <token>  (fallback for simple clients)
 */
export function extractApiKey(headers = {}) {
  const xApiKey = headers["x-api-key"];
  if (typeof xApiKey === "string" && xApiKey.trim()) {
    return xApiKey.trim();
  }

  const authorization = headers.authorization;
  if (typeof authorization !== "string" || !authorization.trim()) {
    return null;
  }

  const value = authorization.trim();
  const bearer = value.match(/^Bearer\s+(.+)$/i);
  if (bearer?.[1]) {
    return bearer[1].trim();
  }

  return value;
}

export function isAuthorized({ headers, expectedApiKey, requireAuth }) {
  if (!requireAuth) {
    return { ok: true, reason: "auth_disabled" };
  }

  if (!expectedApiKey) {
    return { ok: false, reason: "server_misconfigured" };
  }

  const provided = extractApiKey(headers);
  if (!provided) {
    return { ok: false, reason: "missing_api_key" };
  }

  // Constant-time-ish compare for bootstrap (not a crypto module dependency).
  if (provided.length !== expectedApiKey.length) {
    return { ok: false, reason: "invalid_api_key" };
  }

  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expectedApiKey.charCodeAt(i);
  }

  if (mismatch !== 0) {
    return { ok: false, reason: "invalid_api_key" };
  }

  return { ok: true, reason: "ok" };
}

export function createAuthMiddleware({ expectedApiKey, requireAuth }) {
  return function authMiddleware(req, res, next) {
    const result = isAuthorized({
      headers: req.headers,
      expectedApiKey,
      requireAuth
    });

    if (result.ok) {
      return next();
    }

    const status = result.reason === "server_misconfigured" ? 500 : 401;
    res.status(status).json({
      error: "unauthorized",
      reason: result.reason
    });
  };
}
