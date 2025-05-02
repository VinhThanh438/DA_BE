FROM postgres:15.6

RUN apt-get update && \
    apt-get install -y postgresql-contrib && \
    rm -rf /var/lib/apt/lists/*

COPY .script/linux/setup-postgres.sh /docker-entrypoint-initdb.d/setup-postgres.sh

RUN chmod +x /docker-entrypoint-initdb.d/setup-postgres.sh