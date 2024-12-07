# Node 20.18.1 was published in November 2024.
# First stage runs the tests before creating the runtime image.
FROM node:20.18.1-alpine3.20 AS verification
WORKDIR /work
COPY package.json ./
COPY src/ ./src/
COPY test/ ./test/
RUN node --test

FROM node:20.18.1-alpine3.20 AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=verification --chown=node:node /work/package.json ./
COPY --from=verification --chown=node:node /work/src/ ./src/
USER node
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('node:http').get('http://127.0.0.1:8080/health/ready', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
STOPSIGNAL SIGTERM
CMD ["node", "src/server.js"]
