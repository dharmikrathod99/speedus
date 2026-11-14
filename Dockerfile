# ========================================================
# SPEED US - Multi-Stage Production Dockerfile
# Stage 1: Build the Client Frontend (Vite + Three.js)
# Stage 2: Serve API & Client from Lightweight Node Server
# ========================================================

# Stage 1: Client Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy client package files and install dependencies
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm install

# Copy client source code and build production bundle
COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy server package files and install production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets from builder stage
COPY --from=builder /app/client/dist /app/client/dist

# Expose server port
EXPOSE 3001

# Start the full-stack server
CMD ["node", "index.js"]

