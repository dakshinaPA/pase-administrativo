export interface CatalogoGenerico {
  id: number
  nombre: string
}

export interface PaisDB extends CatalogoGenerico {}

export interface EstadoDB extends CatalogoGenerico {}

export interface TemasSocialesDB extends CatalogoGenerico {}

export interface RubrosPresupuestalesDB extends CatalogoGenerico {
  descripcion: string
  importante: string
}

export interface BancosDB extends CatalogoGenerico {
  clave: string
}

export interface FormasPagoDB extends CatalogoGenerico {
  clave: string
}

export interface RegimenesFiscalesDB extends CatalogoGenerico {
  clave: string
}

export interface SectoresBeneficiadosDB extends CatalogoGenerico {}
