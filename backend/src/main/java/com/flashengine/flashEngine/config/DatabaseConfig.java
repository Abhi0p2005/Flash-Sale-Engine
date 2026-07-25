package com.flashengine.flashEngine.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String port = env("DATABASE_PORT", "5432");
        String user = env("DATABASE_USERNAME", "postgres");
        String password = env("DATABASE_PASSWORD", "Abhi@1289");

        String dbUrl = env("DATABASE_URL", "postgresql://localhost:5432/flashengine");
        String database = dbUrl.replaceFirst(".*/([^?]+).*", "$1");

        String jdbcUrl = "jdbc:postgresql://flashengine-db:" + port + "/" + database + "?sslmode=require";

        return DataSourceBuilder.create()
            .url(jdbcUrl)
            .driverClassName("org.postgresql.Driver")
            .username(user)
            .password(password)
            .build();
    }

    private static String env(String key, String fallback) {
        String val = System.getenv(key);
        return val != null ? val : fallback;
    }
}
