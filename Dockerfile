FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY . .
RUN chmod +x prova/gradlew
CMD ["java", "-jar", "prova/build/libs/prova-0.0.1-SNAPSHOT.jar"]

