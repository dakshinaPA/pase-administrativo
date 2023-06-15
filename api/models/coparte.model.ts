export interface ResCoparteDB {
  id: number
  id_administrador: number
  nombre_administrador: string
  id_alt: string
  nombre: string
  i_estatus_legal: 1 | 2
  representante_legal: string
  rfc: string
  id_tema_social: number
  tema_social?: string
  dt_registro: string
  id_coparte_direccion: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp: string
  id_estado: number
  estado?: string
}