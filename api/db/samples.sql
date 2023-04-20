CREATE TABLE `usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido_paterno` VARCHAR(45) NOT NULL,
  `apellido_materno` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `email2` VARCHAR(45) NOT NULL DEFAULT '',
  `password` VARCHAR(10) NOT NULL,
  `i_rol` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `usuarios` (`nombre`, `apellido_paterno`, `apellido_materno`, `email`, `password`, `i_rol`) 
VALUES ('Omar', 'Maldonado', 'Villanueva', 'omar.maldo.vi@gmail.com', '123', 2 ),
('Isabel', 'Flores', 'Alarcon', 'iflores@dakshina.org.mx', '123', 1 ),
('Gabriel', 'Mendez', 'Alarcon', 'gabome@gmail.com', '123', 3 );


CREATE TABLE `copartes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `vc_id` VARCHAR(45) NOT NULL,
  `i_tipo` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));


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