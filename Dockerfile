FROM node:23-alpine AS frontend-build

WORKDIR /app
COPY frontend ./frontend
WORKDIR /app/frontend
ENV REACT_APP_BACKEND_URL=https://hisaabkitab.paramsavjani.in
RUN npm install  && npm run build


FROM node:23-alpine AS backend

# ENV DEBIAN_fRONTEND=noninteractive

WORKDIR /app

COPY backend ./backend
COPY app.js ./backend/src/app.js
WORKDIR /app/backend

RUN npm ci --only=production && rm -rf ~/.npm

WORKDIR /app
COPY --from=frontend-build /app/frontend/build /app/backend/build

EXPOSE 9000

CMD ["sh", "-c", "cd backend/src && node index.js"]
