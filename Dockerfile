# Use official Node.js image
FROM node:20.16.0-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and lock file for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Next.js application
RUN npm run build

# Expose frontend port
EXPOSE 3000
