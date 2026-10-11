FROM node:18-bookworm
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]