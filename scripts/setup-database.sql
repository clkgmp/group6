-- Create database
CREATE DATABASE IF NOT EXISTS movie_db;
USE movie_db;

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  status ENUM('watched', 'unwatched') NOT NULL DEFAULT 'unwatched',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO movies (title, year, status) VALUES
('The Matrix', 1999, 'watched'),
('Inception', 2010, 'unwatched'),
('The Dark Knight', 2008, 'watched'),
('Interstellar', 2014, 'unwatched'),
('Pulp Fiction', 1994, 'watched');
