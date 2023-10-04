import { PeriodoServicioColaborador } from "@models/proyecto.model"

export interface ResColaboradoreDB {
  id: number
  id_proyecto: number
  proyecto: string
  id_responsable: number
  id_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: 1 | 2 | 3// asimilados, salarios, persona fisica extranjera
  clabe: string
  id_banco: number
  banco: string
  telefono: string
  email: string
  rfc: string
  curp: string
  dt_registro: string
  id_direccion: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp_direccion: string
  id_estado: number
  estado?: string
  periodos_servicio?: PeriodoServicioColaborador[]
}

/*
  extranjeros
Nombre del banco	
Bank branch address:	
Account number:	numerico
BIC/SWIFT Code:	
Intermediary bank:	
Routing number: numerico 

--no clabe
--no rfc



*/