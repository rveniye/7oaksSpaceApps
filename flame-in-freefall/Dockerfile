FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server ./server
COPY context ./context
COPY data ./data
COPY dist ./dist
ENV HOST=0.0.0.0
ENV PORT=8080
USER node
CMD ["node", "server/index.js"]
