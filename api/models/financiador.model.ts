import { NotaFinanciador } from "@models/financiador.model"

export interface ResFinanciadorDB {
  id: number
  id_alt: string
  nombre: string
  representante_legal: string
  rfc_representante_legal: string
  pagina_web: string
  rfc: string
  actividad: string
  dt_constitucion: string
  i_tipo: 1 | 2
  tipo?: string
  dt_registro: string
  id_enlace: number
  nombre_enlace: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
  id_direccion: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp: string
  id_estado: number
  id_pais: number
  estado?: string
  pais?: string
  notas?: NotaFinanciador[]
}