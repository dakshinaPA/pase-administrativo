import { Proyecto } from "./proyecto.model"

export interface QueriesCoparte {
  id?: number
  id_admin?: number
  min?: boolean
}

// usuario tipo coparte
export interface CoparteUsuarioMin {
  id?: number
  id_usuario?: number
  id_coparte?: number
  nombre?: string
  apellido_paterno?: string
  apellido_materno?: string
}

export interface CoparteUsuario extends CoparteUsuarioMin {
  email?: string
  telefono?: string
  password?: string
  cargo: string
  b_enlace?: boolean
}

export interface DireccionCoparte {
  id?: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp: string
  id_estado: number
  estado?: string
}

export interface AdministradorCoparte {
  id: number,
  nombre?: string
}

export interface NotaCoparte {
  id?: number
  id_coparte: number
  id_usuario: number
  usuario?: string
  mensaje: string
  dt_registro?: string
}

export type EstatusLegalCoparte = 1 | 2 // constituida | no constituida

export interface Coparte {
  id?: number
  id_administrador?: number 
  id_alt: string
  nombre: string
  nombre_corto: string
  i_estatus_legal: EstatusLegalCoparte
  estatus_legal?: string
  representante_legal: string // solo constituidas
  rfc: string // solo constituidas
  dt_registro?: string
  direccion: DireccionCoparte
  administrador: AdministradorCoparte
  enlace?: CoparteUsuario
  usuarios?: CoparteUsuario[]
  proyectos?: Proyecto[]
  notas?: NotaCoparte[]
}

export interface CoparteMin {
  id: number
  nombre: string
}