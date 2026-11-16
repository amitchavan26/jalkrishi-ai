# Use an official Gradle image with JDK 21 pre-installed
FROM gradle:9.0-jdk21 AS build
WORKDIR /app
# Copy the entire project context
COPY . .
# Run gradle directly (no wrapper download needed)
RUN gradle bootJar -x test --no-daemon && rm -f build/libs/*-plain.jar
FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]