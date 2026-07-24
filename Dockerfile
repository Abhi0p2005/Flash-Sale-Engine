FROM maven:3-eclipse-temurin-26-noble AS build
WORKDIR /app
COPY backend/ .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:26-jre-noble
WORKDIR /app

# Install Python and BeautifulSoup dependencies inside the Ubuntu runtime layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-requests \
    python3-bs4 \
    && rm -rf /var/lib/apt/lists/*

# Create a symlink so 'python' command maps to 'python3' seamlessly
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy the compiled JAR artifact
COPY --from=build /app/target/*.jar app.jar

# Copy your Python scraper script so Java can locate it at /app/scraper.py
COPY scraper.py .

EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]