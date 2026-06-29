FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    noto-fonts \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-dejavu

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install && cd ..

# Copy application code
COPY . .

# Build frontend
RUN npm run build:frontend

# Expose port
EXPOSE 3000

# Set Puppeteer to use installed chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
