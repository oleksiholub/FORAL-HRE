from fastapi import FastAPI

app = FastAPI(
    title="FORAL HRE k6 MCP Gateway",
    version="0.1.0",
)


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {
        "service": "foral-hre-k6-mcp",
        "status": "bootstrap-only",
        "message": "Runtime implementation begins in A.3",
    }
