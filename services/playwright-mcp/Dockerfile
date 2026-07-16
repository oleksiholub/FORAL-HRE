# Official Playwright image includes browser dependencies.
# Pin major version at deploy time if needed.
FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

ENV NODE_ENV=production \
    PLAYWRIGHT_MCP_PORT=8080 \
    PORT=8080 \
    HOST=0.0.0.0 \
    PLAYWRIGHT_HEADLESS=true \
    PLAYWRIGHT_BROWSER=chromium \
    PLAYWRIGHT_MCP_REQUIRE_AUTH=true

# Install only this service deps (workspace-friendly copy)
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

# Non-root is preferred; Playwright image user may vary by tag.
# If permission issues appear on Cloud Run, drop USER and re-test.
USER pwuser

EXPOSE 8080

CMD ["node", "src/index.js"]