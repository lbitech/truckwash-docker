# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY drizzle.config.ts ./
COPY vite.config.ts ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/drizzle.config.ts ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=5001
ENV DATABASE_URL=postgresql://truckwash_user:password@uktruck:europe-west2:truckwash-pg:5432/truckwash
ENV SESSION_SECRET=your_session_secret_here
ENV SESSION_SECURE=false

# Expose port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
