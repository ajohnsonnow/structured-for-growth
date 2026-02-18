FROM mcr.microsoft.com/devcontainers/javascript-node:20

# System packages for sql.js, sharp, canvas, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-pip \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Python tooling (for scripts/ and docs generation)
RUN pip3 install --break-system-packages black ruff mypy

# Global Node tools
RUN npm install -g npm@latest

# Working directory
WORKDIR /workspaces/structured-for-growth

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest
COPY . .

EXPOSE 3000 5173
