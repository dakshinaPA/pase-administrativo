export interface Usuario {
  id?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  email2?: string
  password: string
  i_rol: number
  rol?: string
}

export interface LoginUsuario {
  email: string
  password: string
}
