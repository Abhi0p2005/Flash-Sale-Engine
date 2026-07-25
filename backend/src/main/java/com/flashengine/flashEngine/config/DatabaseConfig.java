package com.flashengine.flashEngine.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    public DataSource dataSource() {
        Map<String, String> env = System.getenv();

        log.info("=== DATABASE ENV VARS ===");
        log.info("PGHOST={}", env.getOrDefault("PGHOST", "NOT SET"));
        log.info("PGPORT={}", env.getOrDefault("PGPORT", "NOT SET"));
        log.info("PGDATABASE={}", env.getOrDefault("PGDATABASE", "NOT SET"));
        log.info("PGUSER={}", env.getOrDefault("PGUSER", "NOT SET"));
        log.info("PGPASSWORD={}", env.containsKey("PGPASSWORD") ? "SET" : "NOT SET");
        log.info("DATABASE_URL={}", env.getOrDefault("DATABASE_URL", "NOT SET"));

        String databaseUrl = env.get("DATABASE_URL");
        String host, port, database, user, password;

        if (databaseUrl != null && !databaseUrl.isBlank()) {
            try {
                URI uri = new URI(databaseUrl);
                host = uri.getHost();
                port = String.valueOf(uri.getPort() > 0 ? uri.getPort() : 5432);
                database = uri.getPath().replace("/", "");
                String userInfo = uri.getUserInfo();
                if (userInfo != null) {
                    String[] parts = userInfo.split(":");
                    user = parts[0];
                    password = parts.length > 1 ? parts[1] : "";
                } else {
                    user = "";
                    password = "";
                }
                log.info("Parsed database connection from DATABASE_URL");
            } catch (URISyntaxException e) {
                log.error("Failed to parse DATABASE_URL, falling back to individual env vars", e);
                host = "flashengine-db";
                port = env.getOrDefault("PGPORT", env.getOrDefault("DATABASE_PORT", "5432"));
                database = env.getOrDefault("PGDATABASE", "flashengine");
                user = env.getOrDefault("PGUSER", env.getOrDefault("DATABASE_USERNAME", "postgres"));
                password = env.getOrDefault("PGPASSWORD", env.getOrDefault("DATABASE_PASSWORD", "Abhi@1289"));
            }
        } else {
            host = "flashengine-db";
            port = env.getOrDefault("PGPORT", env.getOrDefault("DATABASE_PORT", "5432"));
            database = env.getOrDefault("PGDATABASE", "flashengine");
            user = env.getOrDefault("PGUSER", env.getOrDefault("DATABASE_USERNAME", "postgres"));
            password = env.getOrDefault("PGPASSWORD", env.getOrDefault("DATABASE_PASSWORD", "Abhi@1289"));
        }

        log.info("Using host={} port={} database={} user={}", host, port, database, user);

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?sslmode=require";
        log.info("Constructed JDBC URL: {}", jdbcUrl.replaceAll(":[^:@]+@", ":****@"));

        return DataSourceBuilder.create()
            .url(jdbcUrl)
            .driverClassName("org.postgresql.Driver")
            .username(user)
            .password(password)
            .build();
    }
}
