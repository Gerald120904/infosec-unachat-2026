FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DEPLOYMENT_ENVIRONMENT=local
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js index.html ./
COPY libs ./libs
COPY telemetry.js logger.js sentry.js ./
COPY docker-entrypoint.sh ./
RUN chmod 755 ./docker-entrypoint.sh
EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "require('http').get('http://127.0.0.1:'+process.env.PORT, r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["./docker-entrypoint.sh"]
