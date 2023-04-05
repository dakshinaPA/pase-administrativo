export interface Usuario {
    id_usuario?: number
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    email: string
    email2?: string
    password: string
    interno?: 1 | 2
    id_rol?: 1 | 2 | 3
    rol?: string
}

export interface LoginUsuario {
    email: string
    password: string
}