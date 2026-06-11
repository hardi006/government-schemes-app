# Stage 1: Build the React frontend
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the final running application container
FROM node:20-bookworm-slim
WORKDIR /app

# Install Python 3 and venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --only=production

# Set up Python virtual environment in backend
RUN python3 -m venv .venv
COPY backend/requirements.txt ./
RUN .venv/bin/pip install -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend assets to backend/public (for Express static serving)
COPY --from=frontend-builder /app/frontend/dist ./public

# Cloud Run defaults to PORT 8080
EXPOSE 8080
ENV PORT=8080

# Command to run the application
CMD ["node", "server.js"]
```
