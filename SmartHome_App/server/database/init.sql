CREATE DATABASE IF NOT EXISTS btliot;
USE btliot;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS sensordata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  temp FLOAT,
  humi FLOAT,
  light INT,
  motion BOOLEAN,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_type VARCHAR(50), -- 'manual', 'auto', 'voice'
  device VARCHAR(50),
  action VARCHAR(50),
  username VARCHAR(50), -- NULL for auto
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS device_status (
  device_id VARCHAR(50) PRIMARY KEY,
  status ENUM('online', 'offline'),
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default User (admin/admin)
INSERT IGNORE INTO users (username, password, role) VALUES ('admin', '$2b$10$X1wmbwI5k9vS01tT1CM/TO2oK5aPRE1AD1PisvdsZAZRt5xnWmTnC', 'admin');
