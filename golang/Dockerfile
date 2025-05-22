FROM golang:1.20-alpine AS build

WORKDIR /app
COPY . .
RUN go mod download && CGO_ENABLED=0 go build -o fizzbuzz .

FROM gcr.io/distroless/base-debian11:debug
COPY --from=build /app/fizzbuzz /fizzbuzz
COPY --from=build /app/templates /templates

ENTRYPOINT ["/fizzbuzz"]
