export interface ResProveedorDB {
  id: number
  id_proyecto: number
  nombre: string // nombre o razon social
  i_tipo: 1 | 2 // persona fisica, persona moral
  clabe: string
  id_banco: number
  banco: string
  telefono: string
  email: string
  rfc: string
  descripcion_servicio: string
  dt_registro: string
  id_direccion: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp: string
  id_estado: number
  estado?: string
}