FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies early so Docker caches this layer
# Only re-runs if package.json or package-lock.json changes
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Run Next.js in dev mode (with hot reload)
CMD ["npm", "run", "dev"]