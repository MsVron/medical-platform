CREATE DATABASE IF NOT EXISTS plateforme_medicale;
USE plateforme_medicale;

-- Table des utilisateurs (authentification commune)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('admin', 'medecin', 'patient', 'institution') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer l'utilisateur admin par défaut
INSERT INTO users (username, password, email, role)
VALUES ('admin', '$2b$10$8Rg2IbdfEkvQ3AgfsVpZkOQbK16TDoWdmJ78baLcmHVvGIK2XMD6K', 'admin@medical.com', 'admin');
-- Note: Le mot de passe 'admin' est hashé avec bcrypt