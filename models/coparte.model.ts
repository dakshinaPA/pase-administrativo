interface ContactoCoparte {
  nombre: string
  email: string
  telefono: number
}

interface EnlaceCoparte {
  id: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
}

export interface Coparte {
  id?: number
  // id_alt?: string | number
  nombre: string
  i_estatus: 1 | 2 // activa | finalizada
  i_estatus_legal: 1 | 2 // constituida | no constituida
  representante_legal: string // solo constituidas
  enlace: EnlaceCoparte
  contacto: ContactoCoparte
}