-- V1__init.sql
-- This file acts as the baseline for Flyway.
-- Since we are migrating an existing production database that relied on Hibernate's ddl-auto=update,
-- we use spring.flyway.baseline-on-migrate=true to mark the existing DB schema as V1.
-- Future schema changes should be added as V2__description.sql, V3__description.sql, etc.

SELECT 1;
