export interface CatalogoGenerico {
  id: number
  nombre: string
}

export interface PaisDB extends CatalogoGenerico {}

export interface EstadoDB extends CatalogoGenerico {}

export interface TemasSocialesDB extends CatalogoGenerico {}

export interface RubrosPresupuestalesDB extends CatalogoGenerico {}

export interface BancosDB extends CatalogoGenerico {}

export interface MetodosPagoDB extends CatalogoGenerico {
  clave: string
}
