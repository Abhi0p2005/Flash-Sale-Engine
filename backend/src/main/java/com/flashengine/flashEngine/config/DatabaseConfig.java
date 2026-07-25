package com.flashengine.flashEngine.config;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String host = env("PGHOST", "flashengine-db");
        String port = env("PGPORT", env("DATABASE_PORT", "5432"));
        String database = env("PGDATABASE", "flashengine");
        String user = env("PGUSER", env("DATABASE_USERNAME", "postgres"));
        String password = env("PGPASSWORD", env("DATABASE_PASSWORD", "Abhi@1289"));

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database + "?sslmode=require";

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
