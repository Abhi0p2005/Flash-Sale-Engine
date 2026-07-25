package com.flashengine.flashEngine.config;

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
        log.info("DATABASE_PORT={}", env.getOrDefault("DATABASE_PORT", "NOT SET"));

        String host = "flashengine-db";
        String port = env.getOrDefault("PGPORT", env.getOrDefault("DATABASE_PORT", "5432"));
        String database = env.getOrDefault("PGDATABASE", "flashengine");
        String user = env.getOrDefault("PGUSER", env.getOrDefault("DATABASE_USERNAME", "postgres"));
        String password = env.getOrDefault("PGPASSWORD", env.getOrDefault("DATABASE_PASSWORD", "Abhi@1289"));

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
