import { EstatusLegalCoparte } from "@models/coparte.model"

export interface ResCoparteDB {
  id: number
  id_administrador: number
  nombre_administrador: string
  id_alt: string
  nombre: string
  nombre_corto: string
  i_estatus_legal: EstatusLegalCoparte
  representante_legal: string
  rfc: string
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