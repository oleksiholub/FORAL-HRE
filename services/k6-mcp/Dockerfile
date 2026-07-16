FROM grafana/k6:1.0.0 AS k6bin
FROM python:3.12-slim

WORKDIR /app
COPY --from=k6bin /usr/bin/k6 /usr/local/bin/k6

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    HOST=0.0.0.0 \
    K6_BIN=/usr/local/bin/k6 \
    K6_MCP_REQUIRE_AUTH=true \
    K6_MCP_MAX_DURATION_SECONDS=60 \
    K6_MCP_MAX_VUS=20 \
    K6_MCP_WORK_DIR=/tmp/k6-mcp

RUN pip install --no-cache-dir \
      "fastapi>=0.115,<1.0" \
      "uvicorn[standard]>=0.34,<1.0" \
      "httpx>=0.28,<1.0"

COPY services/k6-mcp/app ./app

RUN useradd --create-home --uid 10001 appuser \
 && mkdir -p /tmp/k6-mcp \
 && chown -R appuser:appuser /app /tmp/k6-mcp
USER appuser

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]