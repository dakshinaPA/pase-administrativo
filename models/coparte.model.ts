// usuario tipo coparte
export interface CoparteUsuario {
  id?: number
  id_usuario?: number
  id_coparte?: number
  nombre?: string
  cargo: string
  b_enlace: boolean
}

//usuario tipo coparte
export interface EnlaceCoparte {
  id?: number
  id_usuario?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
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

export interface Coparte {
  id?: number
  id_administrador?: number 
  id_alt: string
  nombre: string
  i_estatus_legal: 1 | 2 // constituida | no constituida
  estatus_legal?: string
  representante_legal: string // solo constituidas
  rfc: string // solo constituidas
  id_tema_social: number
  dt_registro?: string
  direccion: DireccionCoparte
  administrador: AdministradorCoparte
  enlace?: EnlaceCoparte
  usuarios?: CoparteUsuario[]
}

export interface CoparteMin {
  id: number
  nombre: string
}