# ──────────────────────────────────────────────────────────────────────────────
# ComicReaderSite backend — Jakarta servlet WAR on Tomcat 10.1 (JDK 17)
# Build context: ./Comic  (docker build -f Comic/Dockerfile ./Comic)
#
# Runtime env vars (required — see .env.example):
#   DB_URL, DB_USER, DB_PASSWORD, SMTP_USERNAME, SMTP_APP_PASSWORD,
#   AZURE_BLOB_CONNECTION_STRING
# Optional: AZURE_BLOB_CONTAINER, ALLOWED_ORIGINS, APP_BASE_URL, BACKEND_BASE_URL
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

EXPOSE 8080

# persistence.xml reads ${DB_URL}/${DB_USER}/${DB_PASSWORD} as JVM system
# properties, so map the container env vars into JAVA_OPTS at startup.
CMD ["sh", "-c", "export JAVA_OPTS=\"$JAVA_OPTS -DDB_URL=$DB_URL -DDB_USER=$DB_USER -DDB_PASSWORD=$DB_PASSWORD\" && catalina.sh run"]
