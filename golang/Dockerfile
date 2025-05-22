FROM golang:1.20-alpine AS build

WORKDIR /app
COPY . .
RUN go mod download && go build -o server .

FROM scratch
COPY --from=build /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
