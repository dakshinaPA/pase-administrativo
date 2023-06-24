import { CoparteUsuario } from "@models/coparte.model"

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

export interface Usuario extends UsuarioMin {
  email: string
  telefono: string
  password?: string
  rol: RolUsuario
  copartes?: CoparteUsuario[]
}

export interface UsuarioLogin extends UsuarioMin {
  id_rol: number
}