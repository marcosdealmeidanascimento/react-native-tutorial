# Expo dev server for testing on a phone with Expo Go. Source edits reach the container through
# `docker compose watch` (sync), because bind mounts from Windows don't emit file-change events.
FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 8081
CMD ["npx", "expo", "start", "--lan"]
