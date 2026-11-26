# Bước 1: build web React thành file tĩnh (HTML/CSS/JS)
FROM node:22-alpine AS web
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Bước 2: build server Go thành một file chạy duy nhất
FROM golang:1.26-alpine AS api
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 go build -o server .

# Bước 3: image cuối cùng, chỉ chứa file chạy Go và web đã build
FROM alpine:3.22
WORKDIR /app
COPY --from=api /app/server ./server
COPY --from=web /app/dist ./web
ENV GIN_MODE=release
EXPOSE 8080
CMD ["./server"]
