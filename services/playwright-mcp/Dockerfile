FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

ENV NODE_ENV=production \
    PLAYWRIGHT_MCP_PORT=8080 \
    PORT=8080 \
    HOST=0.0.0.0 \
    PLAYWRIGHT_HEADLESS=true \
    PLAYWRIGHT_BROWSER=chromium \
    PLAYWRIGHT_MCP_REQUIRE_AUTH=true

COPY package.json ./
RUN npm install --omit=dev

RUN npm install -g localtunnel

COPY src ./src
COPY services/playwright-mcp/start.sh ./start.sh
RUN chmod +x ./start.sh

USER pwuser

EXPOSE 8080

CMD ["./start.sh"]