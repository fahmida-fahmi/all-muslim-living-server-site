# Use Node.js LTS
FROM node:20-alpine
# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Expose port
EXPOSE 4000

# Run app
CMD ["npm", "run", "start:prod"]
