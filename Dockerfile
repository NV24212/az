# Base image with Python
FROM python:3.11-slim

# Install Nginx
RUN apt-get update && apt-get install -y nginx && apt-get clean

# Set working directory
WORKDIR /app

# Install Python dependencies
# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the rest of the application code
COPY . /app

# Copy Nginx configuration
# The previous fix to this file makes it a reverse proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy and make the startup script executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 80 for Nginx
EXPOSE 80

# Run the startup script
CMD ["/app/start.sh"]
