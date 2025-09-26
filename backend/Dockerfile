FROM python:3.11-slim
WORKDIR /app

# --- Cache Buster ---
# This line forces the Docker cache to be invalidated for subsequent layers.
ARG CACHE_BUSTER=1
# ---

COPY requirements.txt /app/requirements.txt
RUN apt-get update && apt-get clean && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
RUN echo "--- Contents of db.py ---" && cat /app/app/db.py && echo "--- End of db.py ---"
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]