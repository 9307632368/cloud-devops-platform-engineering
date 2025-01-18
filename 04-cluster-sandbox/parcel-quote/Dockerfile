# A late-2024 toolchain for the learning lab, not for current production use.
FROM node:20.18-alpine3.20
WORKDIR /usr/src/app
COPY --chown=node:node package.json app.js config.js pricing.js server.js ./
USER node
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
