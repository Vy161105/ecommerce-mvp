
FROM node:22-alpine AS build
WORKDIR /app

COPY services/order-service/package*.json ./services/order-service/
WORKDIR /app/services/order-service
RUN npm install

COPY services/order-service/tsconfig.json ./
COPY services/order-service/src ./src
COPY proto /app/proto

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY services/order-service/package*.json ./services/order-service/
WORKDIR /app/services/order-service
RUN npm install --omit=dev

COPY --from=build /app/services/order-service/dist ./dist
COPY --from=build /app/proto /app/proto

EXPOSE 3003

CMD ["node", "dist/main.js"]
