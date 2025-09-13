-- Real-time Analytics Dashboard Database Initialization
-- This script sets up the initial database structure and extensions

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create database if not exists (this is handled by Docker, but keeping for reference)
-- CREATE DATABASE analytics_db;

-- Connect to the database
\c analytics_db;

-- Enable TimescaleDB extension for time-series data (if available)
-- CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create schemas
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS auth;

-- Set search path
SET search_path TO analytics, auth, public;

-- Initial setup complete
SELECT 'Database initialization completed successfully' as status;
