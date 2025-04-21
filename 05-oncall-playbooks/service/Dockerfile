FROM node:20.18.1-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js ./
USER node
ENV HOST=0.0.0.0 PORT=8080 FAULT_MODE=normal
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s CMD node -e "fetch('http://127.0.0.1:8080/health/ready').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
