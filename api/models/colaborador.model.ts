import { PeriodoServicioColaborador } from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"

export interface ResColaboradoreDB {
  id: number
  id_proyecto: number
  proyecto: string
  id_alt_financiador: string
  id_alt_coparte: string
  id_alt_proyecto: string
  id_responsable: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: 1 | 2 | 3 // asimilados, salarios, persona fisica extranjera
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
  historial_pagos?: SolicitudPresupuesto[]
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
