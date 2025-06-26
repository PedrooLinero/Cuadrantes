-- Script SQL para crear las tablas de centros y restricciones en MySQL con normativa española

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
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla intermedia para la relación muchos-a-muchos
CREATE TABLE IF NOT EXISTS centros_restricciones (
    id_centro INT NOT NULL,
    id_restriccion INT NOT NULL,
    PRIMARY KEY (id_centro, id_restriccion),
    FOREIGN KEY (id_centro) REFERENCES centros(id) ON DELETE CASCADE,
    FOREIGN KEY (id_restriccion) REFERENCES restricciones(id) ON DELETE CASCADE
);

-- Insertar restricciones según normativa española (Estatuto de los Trabajadores)
INSERT INTO restricciones (codigo, descripcion) VALUES
-- Jornada y descansos
('MAX40H', 'Máximo 40 horas semanales (promedio en 4 meses) - Art. 34.1 ET'),
('MAX9HD', 'Máximo 9 horas diarias (salvo convenio) - Art. 34.1 ET'),
('DESC12H', 'Mínimo 12 horas entre jornadas - Art. 34.3 ET'),
('DESC15M', 'Descanso mínimo 15 minutos al superar 6 horas diarias - Art. 34.4 ET'),
('DESC1.5D', 'Descanso semanal: 1 día y medio ininterrumpidos (domingo + medio sábado/lunes) - Art. 37 ET'),

-- Horas extras y nocturnas
('HEX80A', 'Máximo 80 horas extras anuales - Art. 35.5 ET'),
('NOCH8H', 'Jornada máxima 8 horas en trabajo nocturno (22:00-6:00) - Art. 36 ET'),
('NOCH<18', 'Prohibido trabajo nocturno para menores de 18 años - Art. 6 ET'),

-- Festivos y turnos
('FEST14D', '14 días festivos anuales (8 nacionales/autonómicos + 6 locales) - Art. 37.2 ET'),
('TURNOROT', 'Rotación turnos: máximo 2 semanas consecutivas en nocturno (salvo voluntariedad)'),

-- Grupos protegidos
('MENOR22-6', 'Prohibido trabajar entre 22:00 y 6:00 para menores de 18 años - Art. 6.4 ET'),
('EMB_DESC', 'Derecho a adaptación de horario para embarazadas/lactantes - Art. 26.1 ET'),

-- Sectoriales/ejemplos adicionales
('RESTDOM', 'Descanso obligatorio domingos (salvo sectores exceptuados)'),
('MAX6DC', 'Máximo 6 días consecutivos de trabajo'),
('TEL_DESC', 'Derecho a desconexión digital en teletrabajo - Ley 10/2021');

-- Insertar centros de ejemplo
INSERT INTO centros (nombre_centro) VALUES
('COVAP (Ejemplo agroalimentario)'),
('Hospital Regional (Ejemplo salud)'),
('Fábrica Automoción XYZ');

-- Asociar restricciones a centros (ejemplos realistas)
INSERT INTO centros_restricciones (id_centro, id_restriccion) VALUES
-- COVAP (sector agroalimentario)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 12), -- Jornada estándar + descansos
(1, 13), -- Restricción dominical
-- Hospital (salud)
(2, 1), (2, 3), (2, 7), (2, 8), (2, 9), (2, 10), -- Turnos nocturnos y festivos
-- Fábrica (manufactura)
(3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 11); -- Jornada + horas extras

-- Consulta para verificar
SELECT 
    c.id,
    c.nombre_centro AS 'Centro',
    GROUP_CONCAT(r.codigo SEPARATOR ', ') AS 'Códigos de restricción',
    COUNT(r.id) AS 'Total restricciones'
FROM centros c
LEFT JOIN centros_restricciones cr ON c.id = cr.id_centro
LEFT JOIN restricciones r ON cr.id_restriccion = r.id
GROUP BY c.id;