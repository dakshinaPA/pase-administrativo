CREATE TABLE `usuarios` (
  `id_usuario` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `apellido_paterno` VARCHAR(45) NOT NULL,
  `apellido_materno` VARCHAR(45) NOT NULL,
  `email` VARCHAR(45) NOT NULL,
  `email2` VARCHAR(45) NOT NULL,
  `password` VARCHAR(10) NOT NULL,
  `interno` TINYINT NOT NULL DEFAULT 1,
  `id_rol` TINYINT NOT NULL DEFAULT 3,
  `login` TINYINT NOT NULL DEFAULT 0,
  `b_activo` TINYINT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`));

INSERT INTO `usuarios` (`nombre`, `apellido_paterno`, `apellido_materno`, `email`, `email2`, `password`, `interno`, `id_rol`) 
VALUES ('Omar', 'Maldonado', 'Villanueva', 'omar.maldo.vi@gmail.com', '', '123', 1, 2 ),
('Isabel', 'Flores', 'Alarcon', 'iflores@dakshina.org.mx', '', '123', 1, 1 ),
('Gabriel', 'Mendez', 'Alarcon', 'gabome@gmail.com', '', '123', 2, 3 );


CREATE TABLE `copartes` (
  `id_coparte` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `id` VARCHAR(45) NOT NULL,
  `id_tipo` TINYINT UNSIGNED NOT NULL DEFAULT 2,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_coparte`));
