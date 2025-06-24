-- Script SQL para crear las tablas de centros y restricciones en MySQL

-- Crear la base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS centros_trabajo;
USE centros_trabajo;

-- Crear la tabla para restricciones
CREATE TABLE IF NOT EXISTS restricciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla para centros
CREATE TABLE IF NOT EXISTS centros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_centro VARCHAR(255) NOT NULL,
    id_restriccion INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_restriccion) REFERENCES restricciones(id) ON DELETE SET NULL
);

-- Insertar algunas restricciones de ejemplo con códigos cortos y descripciones en español
INSERT INTO restricciones (codigo, descripcion) VALUES
('MIN2', 'Mínimo 2 trabajadores por turno'),
('MAX8H', 'Máximo 8 horas por día'),
('MAX10X', 'Máximo 10 horas extras por semana');

-- Insertar algunos centros de ejemplo (relacionados con restricciones)
INSERT INTO centros (nombre_centro, id_restriccion) VALUES
('COVAP', 1),
('FÁBRICA XYZ', 2);

-- Confirmar la creación
SELECT c.id, c.nombre_centro, r.codigo, r.descripcion
FROM centros c
LEFT JOIN restricciones r ON c.id_restriccion = r.id;