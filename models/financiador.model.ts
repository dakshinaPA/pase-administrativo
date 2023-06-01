export interface EnlaceFinanciador {
  id?: number
  id_financiador?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
}

export interface NotaFinanciador {
  id?: number
  id_financiador: number
  id_usuario: number
  mensaje: string
  usuario: string
  dt_registro: string
}

export interface Financiador {
  id?: number
  nombre: string
  id_pais: number
  representante_legal: string
  pagina_web: string
  i_tipo: 1 | 2
  dt_registro?: string
  enlace: EnlaceFinanciador
  notas?: NotaFinanciador[]
}