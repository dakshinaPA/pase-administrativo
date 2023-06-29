export interface ResColaboradoreDB {
  id: number
  id_proyecto: number
  id_responsable: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: 1 | 2 // asimilados, salarios
  clabe: string
  id_banco: number
  banco: string
  telefono: string
  email: string
  rfc: string
  curp: string
  cp: string
  nombre_servicio: string
  descripcion_servicio: string
  f_monto_total: string
  dt_inicio_servicio: string
  dt_fin_servicio: string
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
}