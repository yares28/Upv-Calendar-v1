FROM node:16 as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom nginx config
COPY docker-nginx.conf /etc/nginx/conf.d/default.conf

# Create an entrypoint script directly
RUN echo '#!/bin/sh' > /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Replace environment variables in index.html and nginx config' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|\${API_URL}|$API_URL|g" /usr/share/nginx/html/index.html' >> /docker-entrypoint.sh && \
    echo 'sed -i "s|\${BACKEND_URL}|$API_URL|g" /etc/nginx/conf.d/default.conf' >> /docker-entrypoint.sh && \
    echo '' >> /docker-entrypoint.sh && \
    echo '# Execute passed command' >> /docker-entrypoint.sh && \
    echo 'exec "$@"' >> /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=build /app/dist/upv-exam-calendar /usr/share/nginx/html

# Set API URL environment variable with default value
ENV API_URL=http://backend:8080
ENV BACKEND_URL=http://backend:8080

# Add bash for shell script
RUN apk add --no-cache bash

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 