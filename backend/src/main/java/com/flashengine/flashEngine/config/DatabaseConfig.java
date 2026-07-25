package com.flashengine.flashEngine.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String dbUrl = env("DATABASE_URL", "postgresql://localhost:5432/flashengine");
        String dbPort = env("DATABASE_PORT", "5432");

        if (!dbUrl.contains(":" + dbPort + "/") && dbUrl.matches(".*@[^:]+/.*")) {
            dbUrl = dbUrl.replaceFirst("(@[^:/]+)(/)", "$1:" + dbPort + "$2");
        }

        String jdbcUrl = "jdbc:" + dbUrl;
        if (!jdbcUrl.contains("sslmode")) {
            jdbcUrl += (dbUrl.contains("?") ? "&" : "?") + "sslmode=require";
        }

        return DataSourceBuilder.create()
            .url(jdbcUrl)
            .driverClassName("org.postgresql.Driver")
            .username(env("DATABASE_USERNAME", "postgres"))
            .password(env("DATABASE_PASSWORD", "Abhi@1289"))
            .build();
    }

    private static String env(String key, String fallback) {
        String val = System.getenv(key);
        return val != null ? val : fallback;
    }
}
