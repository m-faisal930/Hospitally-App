# # Step 1: Base image
# FROM node:18-alpine

# # Step 2: Set working directory
# WORKDIR /app

# # Step 3: Copy package files
# COPY package*.json ./

# # Step 4: Install dependencies
# RUN npm install

# # Step 5: Copy application code
# COPY . .

# # Step 6: Expose backend port
# EXPOSE 5000

# # Step 7: Start server
# CMD ["node", "server.js"]


















# Use official Node image as base
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Command to run your app
CMD ["npm", "start"]