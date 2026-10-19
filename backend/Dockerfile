FROM python:3.12-slim

# Install SWI-Prolog and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    swi-prolog \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Initialize SQLite database
RUN python -c "import db; db.init_db()"

ENV PORT=5000
EXPOSE 5000

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} --workers 2 --timeout 120 app:app"]
