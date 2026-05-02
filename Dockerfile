# Stage 1: Build the application using the Maven Wrapper
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy the Maven wrapper and project configuration
COPY .mvn .mvn
COPY mvnw pom.xml ./

# Ensure the wrapper has execution permissions
RUN chmod +x mvnw

# Download dependencies (uses the version in maven-wrapper.properties)
RUN ./mvnw dependency:go-offline -B

# Copy the source code and build the WAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -e

# Stage 2: Deploy to Tomcat
FROM tomcat:10.1-jdk17
# Remove default Tomcat applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy the compiled WAR file and rename it to ROOT.war
COPY --from=build /app/target/event-flow.war /usr/local/tomcat/webapps/ROOT.war

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]
