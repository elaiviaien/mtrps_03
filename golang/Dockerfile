FROM golang:1.20-alpine AS build

WORKDIR /app
COPY . .

# Завантажуємо залежності і збираємо двійковий файл
RUN go mod download \
 && go build -o server .

CMD ["./server"]
