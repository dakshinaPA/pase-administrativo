import { EstatusLegalCoparte, NotaCoparte } from "@models/coparte.model"
import { ResUsuarioDB } from "./usuario.model"
import { ResProyectoDB } from "./proyecto.model"
import { Proyecto } from "@models/proyecto.model"

export interface ResCoparteDB {
  id: number
  id_administrador: number
  administrador: string
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
  notas?: NotaCoparte[]
  usuarios?: ResUsuarioDB[]
  proyectos?: Proyecto[]
}
