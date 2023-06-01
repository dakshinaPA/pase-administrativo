export interface ResUsuarioDB {
  id: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
  password?: string
  id_rol: number
  rol: string
}

export interface LoginUsuario {
  email: string
  password: string
}
