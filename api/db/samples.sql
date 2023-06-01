-- ENGINE = InnoDB CHARSET=utf8 COLLATE utf8_bin;
CREATE DATABASE dakshina CHARSET=utf8 COLLATE utf8_bin;

--------------------------------------------------------

CREATE TABLE `paises` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `paises` (`nombre`) 
VALUES ('MEXICO'),
('EU'),
('ARGENTINA');

--------------------------------------------------------

CREATE TABLE `financiadores` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  `id_pais` INT UNSIGNED NOT NULL DEFAULT 1,
  `representante_legal` VARCHAR(80) NOT NULL,
  `pagina_web` VARCHAR(100) NOT NULL DEFAULT '',
  `i_tipo` TINYINT UNSIGNED NOT NULL COMMENT '1.aliado, 2.independiente',
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_pais`) REFERENCES paises(id));

INSERT INTO `financiadores` (`nombre`, `id_pais`, `representante_legal`, `pagina_web`, `i_tipo`, `dt_registro`) 
VALUES ('FONDO SEMILLAS', 1, 'Juancho Melendez', 'www.fonsosemillas.com', 1, '1685385164'),
('FINANCIA2', 1, 'Felipe Mireles', 'www.financiados.com', 2, '1685385164');


CREATE TABLE `financiador_enlace` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido_paterno` VARCHAR(50) NOT NULL,
  `apellido_materno` VARCHAR(50) NOT NULL,
  `email` VARCHAR(30) NOT NULL UNIQUE,
  `telefono` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_financiador`) REFERENCES financiadores(id));

INSERT INTO `financiador_enlace` (`id_financiador`, `nombre`, `apellido_paterno`, `apellido_materno`, `email`, `telefono`) 
VALUES (1, 'Jaime', 'Rodriguez', 'López', 'jaime@gmail.com', '8116542379'),
(2, 'Jorge', 'Mireles', 'del Campo', 'mirelillos@gmail.com', '4438765467');

CREATE TABLE `financiador_notas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `mensaje` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_financiador`) REFERENCES financiadores(id),
  FOREIGN KEY (`id_usuario`) REFERENCES usuarios(id));

INSERT INTO `financiador_notas` (`id_financiador`, `id_usuario`, `mensaje`, `dt_registro`) 
VALUES (1, 1, 'Este es un financiador muy agradable', '1685385164'),
(2, 2, 'Este financiador es confiable', '1685385164');

------------------------------------------------------

CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `roles` (`nombre`) 
VALUES ('SUPER USUARIO'),
('ADMINISTRADOR'),
('COPARTE');

---------------------------------------------------------

CREATE TABLE `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido_paterno` VARCHAR(50) NOT NULL,
  `apellido_materno` VARCHAR(50) NOT NULL,
  `email` VARCHAR(30) NOT NULL UNIQUE,
  `telefono` VARCHAR(10) NOT NULL,
  `password` VARCHAR(10) NOT NULL,
  `id_rol` INT UNSIGNED NOT NULL DEFAULT 3,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`), UNIQUE (`email`),
  FOREIGN KEY (`id_rol`) REFERENCES roles(id));

INSERT INTO `usuarios` (`nombre`, `apellido_paterno`, `apellido_materno`, `email`, `telefono`, `password`, `id_rol`, `dt_registro`) 
VALUES ('Omar', 'Maldonado', 'Villanueva', 'omar.maldo.vi@gmail.com', '7221223344', '123', 2, '1685385164'),
('Isabel', 'Flores', 'Alarcon', 'iflores@dakshina.org.mx', '7223445566', '123', 1, '1685385164'),
('Gabriel', 'Mendez', 'Alarcon', 'gabome@gmail.com', '7224556677', '123', 3, '1685385164');

CREATE TABLE `usuario_copartes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_usuario` INT UNSIGNED NOT NULL,
  `id_coparte` INT UNSIGNED NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_usuario`) REFERENCES usuarios(id),
  FOREIGN KEY (`id_coparte`) REFERENCES copartes(id));

INSERT INTO `usuario_copartes` (`id_usuario`,`id_coparte`) 
VALUES (1, 1),
(1, 2),
(3, 1);

-------------------------------------------------------

CREATE TABLE `copartes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_alt` VARCHAR(20) NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `i_estatus` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1.activa, 2.finalizada',
  `i_estatus_legal` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1.constituida, 2.no constituida',
  `representante_legal` VARCHAR(80) NOT NULL,
  `id_enlace` INT UNSIGNED NOT NULL COMMENT 'id administrador registrado',
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_enlace`) REFERENCES usuarios(id));

INSERT INTO `copartes` (`id_alt`,`nombre`, `i_estatus`, `i_estatus_legal`, `representante_legal`, `id_enlace`, `dt_registro`) 
VALUES ('001', 'Espirales', 1, 1, 'Felipe Montealvirez Torres', 2, '1685385164'),
('003', 'Animatronics', 1, 2, 'Joaquin Pereira Mora', 3, '1685385164'),
('008', 'Espirales', 1, 1, 'Ana Torres Ramos', 2, '1685385164');

CREATE TABLE `coparte_enlace` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_coparte` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido_paterno` VARCHAR(50) NOT NULL,
  `apellido_materno` VARCHAR(50) NOT NULL,
  `email` VARCHAR(30) NOT NULL UNIQUE,
  `telefono` VARCHAR(10) NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_coparte`) REFERENCES copartes(id));

INSERT INTO `coparte_enlace` (`id_coparte`,`nombre`, `apellido_paterno`, `apellido_materno`, `email`, `telefono`) 
VALUES (1, 'Juan', 'Escutia', 'Barrera', 'juanete324@gmail.com', '6547896543'),
(2, 'teresa', 'Ruiz', 'Cortinez', 'terminales65@gmail.com', '7654328765');

-----------------------------------------------------------


CREATE TABLE `solicitudes_presupuestos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipoGasto` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `proveedor` VARCHAR(50) NOT NULL,
  `clabe` VARCHAR(18) NOT NULL,
  `banco` VARCHAR(50) NOT NULL,
  `titular` VARCHAR(50) NOT NULL,
  `rfc` VARCHAR(20) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `email2` VARCHAR(50) NOT NULL DEFAULT '',
  `partida` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `descripcion` VARCHAR(300) NOT NULL,
  `importe` FLOAT UNSIGNED NOT NULL DEFAULT 0,
  `comprobante` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));


INSERT INTO `solicitudes_presupuestos` (`tipoGasto`, `proveedor`, `banco`, `clabe`, `titular`, `rfc`, `email`, `partida`, `descripcion`, `importe`, `comprobante`)
VALUES (1, 'Yo que se', 'Azteca', '453454122323232323', 'felipe Calderón', 'CALDE123', 'felipillo@gmail.com', 1, 'Esto es una descripcion', '1234.23', 1 ),
(2, 'Proveedor 2', 'Banamex', '129873674637283746', 'Juanillo Juaneles', 'JUANLES229876', 'juanelillo@gmail.com', 2, 'Esto es una descripcion mas', '123423', 2 )


-- INTERMEDIAS

financiador_enlace