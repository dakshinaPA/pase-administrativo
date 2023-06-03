export interface UsuarioCoparte {
  id?: number
  id_coparte: number
  nombre?: string
  cargo?: string
  b_enlace?: string
}

export interface RolUsuario {
  id: number
  nombre: string
}

export interface Usuario {
  id?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
  password?: string
  rol: RolUsuario
  copartes?: UsuarioCoparte[]
}