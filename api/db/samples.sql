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
('PANAMA');

CREATE TABLE `estados` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `estados` (`nombre`) 
VALUES ('Aguascalientes'),
  ( "Baja California" ),
  ( "Baja California Sur" ),
  ( "Campeche" ), 
  ( "Coahuila" ), 
  ( "Colima" ), 
  ( "Chiapas" ),
  ( "Chihuahua" ),
  ( "Durango" ),
  ( "Distrito Federal" ),
  ( "Guanajuato" ),
  ( "Guerrero" ),
  ( "Hidalgo" ), 
  ( "Jalisco" ), 
  ( "México" ),
  ( "Michoacán" ), 
  ( "Morelos" ), 
  ( "Nayarit" ), 
  ( "Nuevo León" ),
  ( "Oaxaca" ),
  ( "Puebla" ),
  ( "Querétaro" ), 
  ( "Quintana Roo" ),
  ( "San Luis Potosí" ),
  ( "Sinaloa" ), 
  ( "Sonora" ),
  ( "Tabasco" ), 
  ( "Tamaulipas" ),
  ( "Tlaxcala" ),
  ( "Veracruz" ),
  ( "Yucatán" ), 
  ( "Zacatecas" );

CREATE TABLE `bancos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) UNIQUE NOT NULL,
  `clave` VARCHAR(3) UNIQUE NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `bancos` (`nombre`, `clave`) VALUES
('BANAMEX','002'),
('ABC CAPITAL','138'),
('ACCENDO BANCO','102'),
('ACTINVER','133'),
('AFIRME','062'),
('AKALA','638'),
('AMERICAN EXPRES','103'),
('ASP INTEGRA OPC','659'),
('AUTOFIN','128'),
('BAJIO','030'),
('BANCO AZTECA','127'),
('BANCO FINTERRA','154'),
('BANCO S3','160'),
('BBVA BANCOMER','012'),
('BANCOMEXT','006'),
('BANCOPPEL','137'),
('BANCREA','152'),
('BANJERCITO','019'),
('BANK OF AMERICA','106'),
('BANKAOOL','147'),
('BANOBRAS','009'),
('BANORTE','072'),
('BANREGIO','058'),
('BANSEFI','166'),
('BANSI','060'),
('BARCLAYS','129'),
('BBASE','145'),
('BMONEX','112'),
('BULLTICK CB','632'),
('CAJA POP MEXICA','677'),
('CAJA TELMEX','683'),
('CB INTERCAM','630'),
('CI BOLSA','631'),
('CIBANCO','143'),
('COMPARTAMOS','130'),
('CONSUBANCO','140'),
('CREDICAPITAL','652'),
('CREDIT SUISSE','126'),
('CRISTOBAL COLON','680'),
('DEUTSCHE','124'),
('DONDE','151'),
('ESTRUCTURADORES','606'),
('EVERCORE','648'),
('FINAMEX','616'),
('FINCOMUN','634'),
('FOMPED','689'),
('FONDO (FIRA)','685'),
('GBM','601'),
('GE MONEY','022'),
('HDI SEGUROS','636'),
('HIPOTECARIA FED','168'),
('HSBC','021'),
('ICBC','155'),
('INBURSA','036'),
('INDEVAL','902'),
('ING','116'),
('INMOBILIARIO','150'),
('INTERBANCO','136'),
('INVERCAP','686'),
('INVEX','059'),
('JP MORGAN','110'),
('KUSPIT','653'),
('LIBERTAD','670'),
('MASARI','602'),
('MIFEL','042'),
('MIZUHO BANK','158'),
('MONEXCB','600'),
('MUFG','108'),
('MULTIVA BANCO','132'),
('MULTIVA CBOLSA','613'),
('NAFIN','135'),
('PAGATODO','148'),
('PROFUTURO','620'),
('REFORMA','642'),
('SABADELL','156'),
('SANTANDER','014'),
('SCOTIABANK','044'),
('SHINHAN','157'),
('STP','646'),
('TAMIBE','625'),
('TRANSFER','684'),
('UNAGRA','656'),
('VALMEX','617'),
('VALUE','605'),
('VE POR MAS','113'),
('VECTOR','608'),
('VOLKSWAGEN','141');

CREATE TABLE `rubros_presupuestales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `rubros_presupuestales` (`nombre`) VALUES 
('Gestión financiera'),
('Asimilados a salarios'),
('Honorarios a personas físicas residentes nacionales'),
('Arrendamiento a personas físicas residentes nacionales'),
('Arrendamiento a personas morales'),
('Combustibles y lubricantes'),
('Viáticos y gastos de viaje'),
('Teléfono, internet'),
('Mobiliario y equipo'),
('Limpieza, artículos de higiene y medicamentos'),
('Papelería y artículos de oficina'),
('Mantenimiento y conservación'),
('Propaganda y publicidad'),
('Capacitación y asesoría'),
('Donativos y ayudas'),
('Asistencia Técnica'),
('Gastos no deducibles (sin requisitos fiscales)'),
('Paquetería y mensajería'),
('TI (Software, Pagina Web)'),
('Insumos para proyecto (despensa)'),
('Materiales para proyecto'),
('Pagos al extranjero');

CREATE TABLE `formas_pago` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(2) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `formas_pago` (`clave`, `nombre`) VALUES
('01', 'Efectivo'),
('02', 'Cheque nominativo'),
('03', 'Transferencia electrónica de fondos'),
('04', 'Tarjeta de crédito'),
('05', 'Monedero electrónico'),
('06', 'Dinero electrónico'),
('08', 'Vales de despensa'),
('12', 'Dación en pago'),
('13', 'Pago por subrogación'),
('14', 'Pago por consignación'),
('15', 'Condonación'),
('17', 'Compensación'),
('23', 'Novación'),
('24', 'Confusión'),
('25', 'Remisión de deuda'),
('26', 'Prescripción o caducidad'),
('27', 'A satisfacción del acreedor'),
('28', 'Tarjeta de débito'),
('29', 'Tarjeta de servicios'),
('30', 'Aplicación de anticipos'),
('31', 'Intermediario pagos'),
('99', 'Por definir');

CREATE TABLE `regimenes_fiscales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `clave` VARCHAR(3) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `regimenes_fiscales` (`clave`, `nombre`) VALUES
('601', 'General de Ley Personas Morales'),
('603', 'Personas Morales con Fines no Lucrativos'),
('605', 'Sueldos y Salarios e Ingresos Asimilados a Salarios'),
('606', 'Arrendamiento'),
('607', 'Régimen de Enajenación o Adquisición de Bienes'),
('608', 'Demás ingresos'),
('610', 'Residentes en el Extranjero sin Establecimiento Permanente en México'),
('611', 'Ingresos por Dividendos (socios y accionistas)'),
('612', 'Personas Físicas con Actividades Empresariales y Profesionales'),
('614', 'Ingresos por intereses'),
('615', 'Régimen de los ingresos por obtención de premios'),
('616', 'Sin obligaciones fiscales'),
('620', 'Sociedades Cooperativas de Producción que optan por diferir sus ingresos'),
('621', 'Incorporación Fiscal'),
('622', 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras'),
('623', 'Opcional para Grupos de Sociedades'),
('624', 'Coordinados'),
('625', 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas'),
('626', 'Régimen Simplificado de Confianza');

CREATE TABLE `sectores_beneficiados` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`));

INSERT INTO `sectores_beneficiados` (`nombre`) VALUES
('Sector prueba 1'),
('Sector prueba 2')


--------------------------------------------------------

CREATE TABLE `financiadores` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_alt` VARCHAR(20) UNIQUE NOT NULL,
  `nombre` VARCHAR(30) NOT NULL COMMENT 'Denominacion social',
  `representante_legal` VARCHAR(80) NOT NULL,
  `rfc_representante_legal` VARCHAR(20) NOT NULL,
  `pagina_web` VARCHAR(100) NOT NULL DEFAULT '',
  `rfc` VARCHAR(50) UNIQUE NOT NULL COMMENT 'RFC o tax number',
  `actividad` VARCHAR(80) NOT NULL COMMENT 'actividad, giro mercantil u objeto social',
  `i_tipo` TINYINT UNSIGNED NOT NULL COMMENT '1.aliado, 2.independiente',
  `dt_constitucion` VARCHAR(10) NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`));

-- INSERT INTO `financiadores` (`nombre`, `id_pais`, `representante_legal`, `pagina_web`, `i_tipo`, `dt_registro`) 
-- VALUES ('FONDO SEMILLAS', 1, 'Juancho Melendez', 'www.fonsosemillas.com', 1, '1685385164'),
-- ('FINANCIA2', 1, 'Felipe Mireles', 'www.financiados.com', 2, '1685385164');

CREATE TABLE `financiador_direccion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `calle` VARCHAR(30) NOT NULL,
  `numero_ext` VARCHAR(10) NOT NULL,
  `numero_int` VARCHAR(10) NOT NULL,
  `colonia` VARCHAR(30) NOT NULL,
  `municipio` VARCHAR(20) NOT NULL,
  `cp` VARCHAR(10) NOT NULL,
  `id_estado` INT UNSIGNED NOT NULL DEFAULT 0,
  `estado` VARCHAR(20) NOT NULL DEFAULT '',
  `id_pais` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX (`id_financiador`),
  INDEX (`id_estado`),
  INDEX (`id_pais`));

CREATE TABLE `financiador_enlace` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `nombre` VARCHAR(50) NOT NULL,
  `apellido_paterno` VARCHAR(50) NOT NULL,
  `apellido_materno` VARCHAR(50) NOT NULL,
  `email` VARCHAR(30) NOT NULL UNIQUE,
  `telefono` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_financiador`));

-- INSERT INTO `financiador_enlace` (`id_financiador`, `nombre`, `apellido_paterno`, `apellido_materno`, `email`, `telefono`) 
-- VALUES (1, 'Jaime', 'Rodriguez', 'López', 'jaime@gmail.com', '8116542379'),
-- (2, 'Jorge', 'Mireles', 'del Campo', 'mirelillos@gmail.com', '4438765467');

CREATE TABLE `financiador_notas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `mensaje` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_financiador`),
  INDEX (`id_usuario`));

-- INSERT INTO `financiador_notas` (`id_financiador`, `id_usuario`, `mensaje`, `dt_registro`) 
-- VALUES (1, 1, 'Este es un financiador muy agradable', '1685385164'),
-- (2, 2, 'Este financiador es confiable', '1685385164');

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
  INDEX (`id_rol`));

INSERT INTO `usuarios` (`nombre`, `apellido_paterno`, `apellido_materno`, `email`, `telefono`, `password`, `id_rol`, `dt_registro`) 
VALUES ('Isabel', 'Flores', 'Cerón', 'iflores@dakshina.org.mx', '5552334455', '123', 1, '1685385164');


-------------------------------------------------------

CREATE TABLE `copartes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_administrador` INT UNSIGNED NOT NULL COMMENT 'administrador responsable',
  `id_alt` VARCHAR(20) UNIQUE NOT NULL,
  `nombre` VARCHAR(45) NOT NULL,
  `nombre_corto` VARCHAR(20) NOT NULL,
  `i_estatus_legal` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1.constituida, 2.no constituida',
  `representante_legal` VARCHAR(80) NOT NULL DEFAULT '' COMMENT 'solo constituidas',
  `rfc` VARCHAR(20) NOT NULL DEFAULT '' COMMENT 'solo constituidas',
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_administrador`));

-- INSERT INTO `copartes` (`id_alt`, `nombre`, `i_estatus`, `i_estatus_legal`, `representante_legal`, `dt_registro`) 
-- VALUES ('001', 'Espirales', 1, 1, 'Felipe Montealvirez Torres','1685385164'),
-- ('003', 'Animatronics', 1, 2, 'Joaquin Pereira Mora', '1685385164'),
-- ('008', 'Ayuditas', 1, 1, 'Ana Torres Ramos', '1685385164');

CREATE TABLE `coparte_direccion` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_coparte` INT UNSIGNED NOT NULL,
  `calle` VARCHAR(30) NOT NULL,
  `numero_ext` VARCHAR(10) NOT NULL,
  `numero_int` VARCHAR(10) NOT NULL,
  `colonia` VARCHAR(30) NOT NULL,
  `municipio` VARCHAR(20) NOT NULL,
  `cp` VARCHAR(5) NOT NULL,
  `id_estado` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_coparte`),
  INDEX (`id_estado`));

-- INSERT INTO `coparte_direccion` (`id_coparte`,`calle`, `numero_ext`, `numero_int`, `colonia`, `municipio`, `cp`, `id_estado` ) 
-- VALUES (1, 'Violetas', '34', 'A', 'Las matlazincas', 'Naucalpan', '65788', 3 ),
-- (2, 'Benito Juarez', '99', '', 'Las flores', 'Morelia', '99876', 4 ),
-- (3, 'J. Mujica', '187', 'B', 'Jardines felices', 'Rayón', '88996', 17 );

CREATE TABLE `coparte_usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_coparte` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `cargo` VARCHAR(40) NOT NULL,
  `b_enlace` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX (`id_usuario`),
  INDEX (`id_coparte`));

CREATE TABLE `coparte_notas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_coparte` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `mensaje` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_coparte`),
  INDEX (`id_usuario`));

-- INSERT INTO `coparte_usuarios` (`id_coparte`, `id_usuario`) 
-- VALUES (1, 1),
-- (1, 3),
-- (2, 1),
-- (2, 5),
-- (3, 4),
-- (3, 6);

CREATE TABLE `temas_sociales` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

INSERT INTO `temas_sociales` (`nombre`) VALUES
('Cuerpo: i.Interrupción legal, segura y gratuita del embarazo'),
('Cuerpo: ii.Derechos sexuales y reproductivos'),
('Cuerpo: iii.El deporte y el arte como estrategias para combatir violencias'),
('Cuerpo: iv.Violencia de género y feminicidios'),
('Cuerpo: v.Búsqueda de personas desaparecidas'),
('Cuerpo: vi.Fundamentalismos'),
('Cuerpo: vii.Maternidad segura'),
('Tierra : i.Alternativas comunitarias para responder al cambio climático'),
('Tierra : ii.Desarrollo sustentable'),
('Tierra : iii.Derecho de las mujeres a la propiedad de la tierra'),
('Tierra : iv.Justicia ambiental'),
('Tierra : v.Defensa del territorio ante proyectos extractivistas (mineras, eólicas, et)'),
('Trabajo: i.Derechos laborales de trabajadoras de la maquila, empleadas del hogar, trabajadoras sexuales, jornaleras, et'),
('Trabajo: ii.Trabajo doméstico y de cuidados'),
('Trabajo: iii.Autonomía económica y cooperativas'),
('Trabajo: iv.Reinserción social de mujeres privadas de la libertad'),
('Trabajo: v.Participación de mujeres en sindicatos'),
('Identidades: i. Participación política de mujeres indígenas y afrodescendientes'),
('Identidades: ii.Movimientos LBTTTIQ+'),
('Identidades: iii.Discapacidades'),
('Identidades: iv.Migración'),
('Identidades: v.Niñez y educación'),
('Identidades: vi.Liderazgo y participación política'),
('Identidades vii.Violencia'),
('Arte y cultura de los pueblos indígenas');

-----------------------------------------------------------

CREATE TABLE `proyectos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_financiador` INT UNSIGNED NOT NULL,
  `id_coparte` INT UNSIGNED NOT NULL,
  `id_responsable` INT UNSIGNED NOT NULL COMMENT 'id usuario coparte',
  `id_alt` VARCHAR(20) UNIQUE NOT NULL,
  `nombre` VARCHAR(70) UNIQUE NOT NULL,
  `id_tema_social` INT UNSIGNED NOT NULL,
  `sector_beneficiado` VARCHAR(200) NOT NULL,
  `i_tipo_financiamiento` TINYINT UNSIGNED NOT NULL COMMENT '1.estipendio, 2.unica ministracion, 3.varias ministraciones, 4.multi anual',
  `i_beneficiados` INT UNSIGNED NOT NULL,
  `id_estado` INT UNSIGNED NOT NULL COMMENT 'estado de accion',
  `municipio` VARCHAR(70) NOT NULL COMMENT 'municipio de accion',
  `descripcion` TEXT NOT NULL,
  `dt_inicio` VARCHAR(10) NOT NULL COMMENT 'inicio de ejecucion',
  `dt_fin` VARCHAR(10) NOT NULL COMMENT 'fin de ejecucion',
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_financiador`),
  INDEX (`id_coparte`),
  INDEX (`id_tema_social`),
  INDEX (`id_estado`),
  INDEX (`id_responsable`));

  CREATE TABLE `proyecto_saldo` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_proyecto` INT UNSIGNED NOT NULL,
  `f_monto_total` VARCHAR(20) NOT NULL DEFAULT 0,
  `f_solicitado` VARCHAR(20) NOT NULL DEFAULT 0,
  `f_transferido` VARCHAR(20) NOT NULL DEFAULT 0,
  `f_comprobado` VARCHAR(20) NOT NULL DEFAULT 0,
  `f_retenciones` VARCHAR(20) NOT NULL DEFAULT 0,
  `f_pa` VARCHAR(20) NOT NULL DEFAULT 0,
  `p_avance` VARCHAR(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX (`id_proyecto`));

  CREATE TABLE `proyecto_ministraciones` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `i_numero` TINYINT UNSIGNED NOT NULL COMMENT 'numero de ministracion',
    `i_grupo` VARCHAR(10) NOT NULL,
    `dt_recepcion` VARCHAR(10) NOT NULL,
    `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `dt_registro` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_proyecto`));

  CREATE TABLE `ministracion_rubros_presupuestales` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_ministracion` INT UNSIGNED NOT NULL,
    `id_rubro` INT UNSIGNED NOT NULL,
    `f_monto` VARCHAR(20) NOT NULL,
    `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    INDEX (`id_ministracion`),
    INDEX (`id_rubro`));

  CREATE TABLE `proyecto_notas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_proyecto` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `mensaje` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_proyecto`),
  INDEX (`id_usuario`));

-----------------------------------------------------------

  CREATE TABLE `colaboradores` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `id_empleado` VARCHAR(20) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `apellido_paterno` VARCHAR(50) NOT NULL,
    `apellido_materno` VARCHAR(50) NOT NULL,
    `i_tipo` TINYINT UNSIGNED NOT NULL COMMENT '1.asimilados, 2.honorarios, 3.sin pago',
    `clabe` VARCHAR(18) NOT NULL,
    `id_banco` TINYINT UNSIGNED NOT NULL,
    `telefono` VARCHAR(10) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `rfc` VARCHAR(20) NOT NULL,
    `curp` VARCHAR(20) NOT NULL,
    `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `dt_registro` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_proyecto`),
    INDEX (`id_banco`));

  CREATE TABLE `colaborador_direccion` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_colaborador` INT UNSIGNED NOT NULL,
    `calle` VARCHAR(30) NOT NULL,
    `numero_ext` VARCHAR(10) NOT NULL,
    `numero_int` VARCHAR(10) NOT NULL,
    `colonia` VARCHAR(30) NOT NULL,
    `municipio` VARCHAR(20) NOT NULL,
    `cp` VARCHAR(5) NOT NULL,
    `id_estado` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_colaborador`),
    INDEX (`id_estado`));

  CREATE TABLE `colaborador_periodos_servicio` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_colaborador` INT UNSIGNED NOT NULL,
    `i_numero_ministracion` INT UNSIGNED NOT NULL,
    `f_monto` VARCHAR(20) NOT NULL COMMENT 'total a pagar durante el proyecto',
    `servicio` VARCHAR(40) NOT NULL,
    `descripcion` VARCHAR(150) NOT NULL,
    `cp` VARCHAR(5) NOT NULL COMMENT 'el que aparece en constancia de situacion fiscal',
    `dt_inicio` VARCHAR(10) NOT NULL,
    `dt_fin` VARCHAR(10) NOT NULL,
    `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `dt_registro` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_colaborador`));


-----------------------------------------------------------

  CREATE TABLE `proveedores` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_proyecto` INT UNSIGNED NOT NULL,
    `nombre` VARCHAR(50) NOT NULL COMMENT 'nombre o razon social',
    `i_tipo` TINYINT UNSIGNED NOT NULL COMMENT '1.persona fisica, 2.persona moral',
    `clabe` VARCHAR(18) NOT NULL,
    `id_banco` TINYINT UNSIGNED NOT NULL,
    `telefono` VARCHAR(10) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `rfc` VARCHAR(20) NOT NULL,
    `descripcion_servicio` VARCHAR(150) NOT NULL,
    `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
    `dt_registro` VARCHAR(10) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_proyecto`),
    INDEX (`id_banco`));

  
  CREATE TABLE `proveedor_direccion` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_proveedor` INT UNSIGNED NOT NULL,
    `calle` VARCHAR(30) NOT NULL,
    `numero_ext` VARCHAR(10) NOT NULL,
    `numero_int` VARCHAR(10) NOT NULL,
    `colonia` VARCHAR(30) NOT NULL,
    `municipio` VARCHAR(20) NOT NULL,
    `cp` VARCHAR(5) NOT NULL,
    `id_estado` INT UNSIGNED NOT NULL,
    PRIMARY KEY (`id`),
    INDEX (`id_proveedor`),
    INDEX (`id_estado`));

-----------------------------------------------------------


CREATE TABLE `solicitudes_presupuesto` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_proyecto` INT UNSIGNED NOT NULL,
  `i_tipo_gasto` TINYINT UNSIGNED NOT NULL COMMENT '1.reembolso, 2.programacion, 3.asimilado a salarios, 4.honorarios profesionales, 5.gastos por comprobar',
  `clabe` VARCHAR(18) NOT NULL,
  `id_banco` INT UNSIGNED NOT NULL,
  `titular_cuenta` VARCHAR(80) NOT NULL,
  `email` VARCHAR(50) NOT NULL,
  `proveedor` VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'menos en gastos por comprobar',
  `descripcion_gasto` VARCHAR(300) NOT NULL,
  `id_partida_presupuestal` INT UNSIGNED NOT NULL COMMENT 'id proyecto_rubros_presupuestales',
  `f_importe` FLOAT UNSIGNED NOT NULL,
  -- `f_monto_comprobar` VARCHAR(20) NOT NULL COMMENT 'diferencia entre importe y gastos comprobados',
  `i_estatus` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '1. revision, 2.autorizada, 3.rechazada, 4.procesada, 5.devolucion',
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_proyecto`),
  INDEX (`id_banco`),
  INDEX (`id_partida_presupuestal`));

CREATE TABLE `solicitud_presupuesto_comprobantes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_solicitud_presupuesto` INT UNSIGNED NOT NULL,
  `folio_fiscal` VARCHAR(40) UNIQUE NOT NULL,
  `f_total` VARCHAR(20) NOT NULL,
  `f_retenciones` VARCHAR(20) NOT NULL,
  `i_metodo_pago` TINYINT UNSIGNED NOT NULL COMMENT '1.- PUE, 2.PPD',
  `id_forma_pago`INT UNSIGNED NOT NULL,
  `id_regimen_fiscal`INT UNSIGNED NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_forma_pago`),
  INDEX (`id_regimen_fiscal`),
  INDEX (`id_solicitud_presupuesto`));

CREATE TABLE `solicitud_presupuesto_notas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_solicitud` INT UNSIGNED NOT NULL,
  `id_usuario` INT UNSIGNED NOT NULL,
  `mensaje` TEXT NOT NULL,
  `b_activo` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dt_registro` VARCHAR(10) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id_solicitud`),
  INDEX (`id_usuario`));

------------------------------------------------------


TRUNCATE TABLE coparte_direccion;
TRUNCATE TABLE coparte_usuarios;
TRUNCATE TABLE copartes;
TRUNCATE TABLE coparte_notas;

TRUNCATE TABLE usuarios;

TRUNCATE TABLE financiador_direccion;
TRUNCATE TABLE financiador_enlace;
TRUNCATE TABLE financiador_notas;
TRUNCATE TABLE financiadores;

TRUNCATE TABLE proyectos;
TRUNCATE TABLE proyecto_saldo;
TRUNCATE TABLE proyecto_ministraciones;
TRUNCATE TABLE proyecto_notas;
TRUNCATE TABLE ministracion_rubros_presupuestales;

TRUNCATE TABLE colaboradores;
TRUNCATE TABLE colaborador_direccion;
TRUNCATE TABLE colaborador_periodos_servicio;

TRUNCATE TABLE proveedores;
TRUNCATE TABLE proveedor_direccion;

TRUNCATE TABLE solicitudes_presupuesto;
TRUNCATE TABLE solicitud_presupuesto_comprobantes;
TRUNCATE TABLE solicitud_presupuesto_notas;


-- mysqldump -u root -p dakshina > dakshina.sql 
-- mysql  -h dakshina.cyt6walgkcp2.us-east-2.rds.amazonaws.com -u admin -p dakshina < dakshina.sql
-- show status where `variable_name` = 'Threads_connected';
-- show processlist;

alter table usuarios modify column password varbinary(200) not null;
update usuarios set password=AES_ENCRYPT('123', 'dakshina23');
select id, nombre, CAST(AES_DECRYPT(password, 'dakshina23') AS CHAR) from usuarios;