DROP DATABASE IF EXISTS alphaworm; -- Delete previous mygamedb 
CREATE DATABASE alphaworm; -- Create the database
USE alphaworm; -- Use the db we just created

-- Create the table to store the user data
CREATE TABLE userdata (
        username VARCHAR(12) PRIMARY KEY NOT NULL,
        password_hash VARCHAR(40) NOT NULL,
        highscore INT DEFAULT 0,
        registered TIMESTAMP DEFAULT NOW()
        );

