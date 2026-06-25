FROM maven:3-eclipse-temurin-26-noble AS build
WORKDIR /app
COPY . . 
RUN mvn clean package -DskipTests

FROM eclipse-temurin:26-jre-noble
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]