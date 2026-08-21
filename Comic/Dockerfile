# ──────────────────────────────────────────────────────────────────────────────
# ComicReaderSite backend — Jakarta servlet WAR on Tomcat 10.1 (JDK 17)
# Build context: ./Comic  (docker build -f Comic/Dockerfile ./Comic)
#
# Runtime env vars (required — see .env.example):
#   DB_URL, DB_USER, DB_PASSWORD, SMTP_USERNAME, SMTP_APP_PASSWORD,
#   AZURE_BLOB_CONNECTION_STRING
# Optional: AZURE_BLOB_CONTAINER, ALLOWED_ORIGINS, APP_BASE_URL, BACKEND_BASE_URL
#
# These are supplied AT RUNTIME by the platform, never baked into the image —
# see Comic/DEPLOYMENT.md. Image layers are readable by anyone with pull access
# (`docker history`), so build-args are the wrong channel for credentials.
#
# NOTE: keep this file LF-only. A CRLF line ending on the CMD line makes the
# trailing \r part of the instruction, so the JSON exec-form array fails to
# parse and Docker silently falls back to shell form.
# ──────────────────────────────────────────────────────────────────────────────

# Stage 1: build the WAR with Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: run on Tomcat 10.1 (Jakarta EE) with JDK 17
FROM tomcat:10.1-jdk17-temurin
WORKDIR /usr/local/tomcat

# Disable the shutdown port (container hardening) and clear default webapps
RUN sed -i 's/port="8005"/port="-1"/' conf/server.xml
RUN rm -rf webapps/*
COPY --from=build /build/target/Comic.war webapps/Comic.war

# persistence.xml resolves ${DB_URL}/${DB_USER}/${DB_PASSWORD} as JVM system
# properties. catalina.sh sources bin/setenv.sh before launching the JVM, so
# that is where the container env vars get mapped into JAVA_OPTS. Single quotes
# keep the expansion at container start, not at image build time.
RUN printf '%s\n' \
      '#!/bin/sh' \
      'JAVA_OPTS="$JAVA_OPTS -DDB_URL=$DB_URL -DDB_USER=$DB_USER -DDB_PASSWORD=$DB_PASSWORD"' \
      'export JAVA_OPTS' \
      > "$CATALINA_HOME/bin/setenv.sh" \
 && chmod +x "$CATALINA_HOME/bin/setenv.sh"

EXPOSE 8080

# Image default: catalina.sh execs the JVM, so java is PID 1 and receives
# SIGTERM directly for a graceful shutdown.
CMD ["catalina.sh", "run"]
