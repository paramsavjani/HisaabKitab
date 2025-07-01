FROM node:23-alpine AS frontend-build

WORKDIR /app
COPY Frontend ./Frontend
WORKDIR /app/Frontend
RUN npm install  && npm run build


FROM node:23-alpine AS backend

ENV DEBIAN_FRONTEND=noninteractive

# Create app directory
WORKDIR /app

# Copy Backend
COPY Backend ./Backend
COPY app.js ./Backend/src/app.js
COPY Backend/.env ./Backend/.env
WORKDIR /app/Backend

RUN npm ci --only=production && rm -rf ~/.npm

WORKDIR /app
COPY --from=frontend-build /app/Frontend/build /app/Backend/build
COPY Backend/src/utils/hisaab--kitab-firebase-adminsdk-k7ftp-c8981318fa.json /app/Backend/src/utils/
# Expose ports
EXPOSE 9000

# Command to start the apps
CMD ["sh", "-c", "cd Backend/src && node index.js"]
