CREATE DATABASE IF NOT EXISTS dar_al_oumouma CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dar_al_oumouma;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('infirmier', 'medecin') NOT NULL,
    centre VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    sexe ENUM('F', 'M') DEFAULT 'F',
    zone VARCHAR(255),
    village VARCHAR(255),
    antecedents TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dossiers_medicaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT UNIQUE NOT NULL,
    grossesses_precedentes JSON DEFAULT ('[]'),
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consultations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dossier_id INT NOT NULL,
    infirmier_id INT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    transcript JSON DEFAULT ('[]'),
    compte_rendu TEXT,
    ordonnance JSON DEFAULT ('[]'),
    urgency_level ENUM('green', 'orange', 'red') DEFAULT 'green',
    red_flags JSON DEFAULT ('[]'),
    imaging_files JSON DEFAULT ('[]'),
    imaging_analysis TEXT,
    status ENUM('pending', 'validated', 'modified', 'rejected') DEFAULT 'pending',
    validated_by INT,
    validated_at DATETIME,
    validation_notes TEXT,
    FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
    FOREIGN KEY (infirmier_id) REFERENCES users(id),
    FOREIGN KEY (validated_by) REFERENCES users(id)
);
