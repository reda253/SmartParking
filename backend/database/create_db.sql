-- ================================================
--  SMART PARKING INTELLIGENT
--  Fichier : create_db.sql
--  Description : Création complète de la base de données
-- ================================================

CREATE DATABASE IF NOT EXISTS smart_parking;
USE smart_parking;

-- ================================================
-- TABLE 1 : utilisateurs
-- Stocke les infos des clients du parking
-- ================================================
CREATE TABLE utilisateurs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nom        VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    telephone  VARCHAR(20)
);

-- ================================================
-- TABLE 2 : places
-- Représente chaque emplacement physique du parking
-- ================================================
CREATE TABLE places (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    numero  INT NOT NULL,
    type    ENUM('standard', 'handicape', 'vip') DEFAULT 'standard',
    statut  ENUM('libre', 'occupe', 'reserve') DEFAULT 'libre'
);

-- ================================================
-- TABLE 3 : tarifs
-- Stocke le prix par heure selon le type de place
-- ================================================
CREATE TABLE tarifs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type_place  ENUM('standard', 'handicape', 'vip') NOT NULL,
    prix_heure  DECIMAL(5,2) NOT NULL
);

-- ================================================
-- TABLE 4 : reservations
-- Stocke chaque réservation faite par un utilisateur
-- ================================================
CREATE TABLE reservations (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    place_id         INT NOT NULL,
    utilisateur_id   INT NOT NULL,
    debut            DATETIME NOT NULL,
    fin              DATETIME NOT NULL,
    statut           ENUM('active', 'terminee', 'annulee') DEFAULT 'active',
    montant          DECIMAL(6,2),
    FOREIGN KEY (place_id)       REFERENCES places(id),
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id)
);

-- ================================================
-- TABLE 5 : transactions
-- Stocke chaque paiement lié à une réservation
-- ================================================
CREATE TABLE transactions (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    reservation_id   INT NOT NULL,
    montant          DECIMAL(6,2) NOT NULL,
    date_paiement    DATETIME DEFAULT NOW(),
    statut_paiement  ENUM('paye', 'en_attente') DEFAULT 'en_attente',
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

-- ================================================
-- TABLE 6 : barrieres
-- Représente les barrières d'entrée et de sortie
-- ================================================
CREATE TABLE barrieres (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    type             ENUM('entree', 'sortie') NOT NULL,
    statut           ENUM('ouverte', 'fermee') DEFAULT 'fermee',
    derniere_action  DATETIME DEFAULT NOW()
);

-- ================================================
-- TABLE 7 : alertes
-- Stocke les alertes de surcharge ou incidents
-- ================================================
CREATE TABLE alertes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    barriere_id  INT,
    message      VARCHAR(255) NOT NULL,
    date_alerte  DATETIME DEFAULT NOW(),
    vue          BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (barriere_id) REFERENCES barrieres(id)
);

-- ================================================
-- DONNÉES DE TEST
-- ================================================

-- Utilisateurs
INSERT INTO utilisateurs (nom, email, telephone) VALUES
('Youssef Benali',  'Youssef@email.com',  '0612345678'),
('Sara Idrissi',  'sara@email.com',   '0623456789'),
('Karim Tazi',    'karim@email.com',  '0634567890');

-- Places
INSERT INTO places (numero, type, statut) VALUES
(1, 'standard',  'libre'),
(2, 'standard',  'libre'),
(3, 'standard',  'libre'),
(4, 'handicape', 'libre'),
(5, 'vip',       'libre');

-- Tarifs
INSERT INTO tarifs (type_place, prix_heure) VALUES
('standard',  10.00),
('handicape',  5.00),
('vip',       20.00);

-- Barrières
INSERT INTO barrieres (type, statut) VALUES
('entree', 'fermee'),
('sortie', 'fermee');

