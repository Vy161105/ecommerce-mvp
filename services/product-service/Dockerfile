
FROM node:22-alpine AS build
WORKDIR /app

COPY services/product-service/package*.json ./services/product-service/
WORKDIR /app/services/product-service
RUN npm install

COPY services/product-service/tsconfig.json ./
COPY services/product-service/src ./src
COPY proto /app/proto

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY services/product-service/package*.json ./services/product-service/
WORKDIR /app/services/product-service
RUN npm install --omit=dev

COPY --from=build /app/services/product-service/dist ./dist
COPY --from=build /app/proto /app/proto

EXPOSE 3002
EXPOSE 50051

CMD ["node", "dist/main.js"]
