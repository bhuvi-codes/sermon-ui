### STAGE 1: Build UI ###
FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Build Sermon ###
FROM golang:1.13-alpine AS sermon
RUN apk update && apk add alpine-sdk git && rm -rf /var/cache/apk/*
RUN mkdir -p /app
WORKDIR /app
RUN git clone https://github.com/avp-cloud/sermon.git
WORKDIR /app/sermon
RUN go mod download
RUN go build ./

### STAGE 3: Final build ###
FROM nginx:1.17.1-alpine
COPY --from=sermon /app/sermon /
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/sermon-ui /usr/share/nginx/html
COPY entrypoint.sh /

ENV PORT "8081"
ENTRYPOINT ["./entrypoint.sh"]