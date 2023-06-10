import { CoparteUsuario } from "@models/coparte.model"

// export interface UsuarioCoparte {
//   id?: number
//   id_coparte: number
//   nombre?: string
//   cargo?: string
//   b_enlace?: boolean
// }

export interface RolUsuario {
  id: number
  nombre?: string
  b_enlace?: boolean
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
  copartes?: CoparteUsuario[]
}