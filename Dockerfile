# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first for better layer caching
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Deploy to Tomcat
FROM tomcat:10.1-jdk17
# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the compiled WAR file from the build stage and rename it to ROOT.war
# so it serves at the root path (/) instead of /event-flow
COPY --from=build /app/target/event-flow.war /usr/local/tomcat/webapps/ROOT.war

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
