# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files for workspaces
COPY ../../package.json ../../package-lock.json* ../../pnpm-workspace.yaml* ./

# Copy api folder
COPY . .

# Install dependencies
RUN npm install

RUN npm install --save-dev @types/express @types/bcrypt @types/node

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy built files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/images ./images

# Install production deps
RUN npm install --omit=dev

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]

