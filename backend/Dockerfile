FROM python:3.11-slim
WORKDIR /app

# --- Cache Buster ---
# This line forces the Docker cache to be invalidated for all subsequent layers.
# This is critical to ensure the latest code is actually deployed.
ARG CACHE_BUSTER=1

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]