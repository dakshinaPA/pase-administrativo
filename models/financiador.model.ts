export interface EnlaceFinanciador {
  id?: number
  id_financiador?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  email: string
  telefono: string
}

export interface DireccionFinanciador {
  id?: number
  calle: string
  numero_ext: string
  numero_int: string
  colonia: string
  municipio: string
  cp: string
  id_estado: number
  id_pais: number
  estado?: string
  pais?: string
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
  representante_legal: string
  pagina_web: string
  folio_fiscal: string
  actividad: string
  dt_constitucion: string
  i_tipo: 1 | 2
  tipo?: string 
  dt_registro?: string
  enlace: EnlaceFinanciador
  direccion: DireccionFinanciador
  notas?: NotaFinanciador[]
}