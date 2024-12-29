# 2024 lab target. Update this base image before production deployment.
FROM node:20.18.1-alpine AS builder
WORKDIR /work
COPY package*.json ./
COPY src/ src/
COPY data/ data/
COPY scripts/ scripts/
RUN npm run build && npm run verify

FROM node:20.18.1-alpine
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=builder --chown=node:node /work/dist/ ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=4s --start-period=5s \
    CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.mjs"]
