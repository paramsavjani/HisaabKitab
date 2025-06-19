# ------------------------------#
# Frontend Build (Multi-Stage)  #
# ------------------------------#
FROM node:23-alpine AS frontend-build

WORKDIR /app
COPY Frontend ./Frontend
WORKDIR /app/Frontend
RUN npm install  && npm run build

# ------------------------------#
# Backend + Python App         #
# ------------------------------#
FROM node:23-alpine AS backend

ENV DEBIAN_FRONTEND=noninteractive


# Create app directory
WORKDIR /app

# Copy Backend
COPY Backend ./Backend
WORKDIR /app/Backend

RUN npm ci --only=production && rm -rf ~/.npm

# ------------------------------#
# Final Setup                   #
# ------------------------------#
WORKDIR /app
COPY --from=frontend-build /app/Frontend/build /app/Backend/build

# Expose ports
EXPOSE 1000

# Command to start the apps
CMD ["sh", "-c", "cd Backend && node src/index.js"]
