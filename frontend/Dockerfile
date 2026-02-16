FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

# Install deps
RUN npm install

COPY . .

RUN npm run build

# Production stage using Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Frontend port
EXPOSE 5173

# Start nginx 
CMD ["nginx", "-g", "daemon off;"]
