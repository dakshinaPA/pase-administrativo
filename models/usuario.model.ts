// import { CoparteUsuario } from "@models/coparte.model"

export interface QueriesUsuario {
  id?: number
  id_rol?: IdRolUsuario
  id_coparte?: number
  min?: boolean
}

export interface UsuarioMin {
  id?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
}

export interface RolUsuario {
  id: number
  nombre?: string
  b_enlace?: boolean
}

export interface CoparteUsuario {
  id?: number //id coparte_usuarios
  id_coparte: number
  coparte?: string
  cargo: string
  b_enlace?: boolean
}

export type IdRolUsuario = 1 | 2 | 3

export interface Usuario extends UsuarioMin {
  email: string
  telefono: string
  password: string
  id_rol: IdRolUsuario
  rol?: string
  coparte?: CoparteUsuario
}

export interface UsuarioLogin extends UsuarioMin {
  id_rol: number
}