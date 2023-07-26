import { IdRolUsuario } from "@models/usuario.model"

export interface ResUsuarioDB {
  id: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
  password?: string
  id_rol: IdRolUsuario
  rol: string
  id_coparte_usuario: number
  id_coparte: number
  coparte: string
  cargo: string
  b_enlace: 1 | 0
}

export interface LoginUsuario {
  email: string
  password: string
}
