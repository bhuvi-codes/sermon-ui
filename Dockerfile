### STAGE 1: Build ###
FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Get sermon binary ##
FROM avpc/sermon:latest AS sermon

### STAGE 3: Run ###
FROM nginx:1.17.1-alpine
COPY --from=sermon /sermon /
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist/sermon-ui /usr/share/nginx/html

ENV PORT "8081"
CMD ["nginx;","./sermon"]