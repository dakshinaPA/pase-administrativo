export interface ResProveedorDB {
  id: number
  id_proyecto: number
  proyecto: string
  id_responsable: number
  nombre: string // nombre o razon social
  i_tipo: 1 | 2 // persona fisica, persona moral
  clabe: string
  id_banco: number
  banco: string
  telefono: string
  email: string
  rfc: string
  bank: string
  bank_branch_address: string
  account_number: string
  bic_code: string
  intermediary_bank: string
  routing_number: string
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
  pais: string
}