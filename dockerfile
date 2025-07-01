FROM node:23-alpine AS frontend-build

WORKDIR /app
COPY Frontend ./Frontend
WORKDIR /app/Frontend
RUN npm install  && npm run build


FROM node:23-alpine AS backend

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

COPY Backend ./Backend
COPY app.js ./Backend/src/app.js
WORKDIR /app/Backend

RUN npm ci --only=production && rm -rf ~/.npm

WORKDIR /app
COPY --from=frontend-build /app/Frontend/build /app/Backend/build

EXPOSE 9000

CMD ["sh", "-c", "cd Backend/src && node index.js"]
