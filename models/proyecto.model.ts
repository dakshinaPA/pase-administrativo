// import { Colaborador } from "./colaborador.model"
import { Direccion } from "./direccion.model"

export interface ColaboradorProyecto {
  id?: number
  id_proyecto?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: number
  tipo: string
  clabe: string
  id_banco: number
  banco?: string
  telefono: string
  email: string
  rfc: string
  curp: string
  cp: string
  nombre_servicio: string
  descripcion_servicio: string
  f_monto_total: string
  dt_inicio_servicio: string
  dt_fin_servicio: string
  dt_registro?: string
  direccion: Direccion
}

export interface ProveedorProyecto {
  id?: number
  id_proyecto?: number
  nombre: string
  i_tipo: number
  tipo?: string
  clabe: string
  id_banco: number
  banco?: string
  telefono: string
  email: string
  rfc: string
  descripcion_servicio: string
  dt_registro?: string
  direccion: Direccion
}

export interface RubroProyecto {
  id?: number
  id_proyecto?: number
  id_rubro: number
  rubro?: string
  f_monto: string
}

export interface MinistracionProyecto {
  id?: number
  id_proyecto?: number
  i_numero: number
  f_monto: string
  i_grupo: number
  dt_recepcion: string
  dt_registro?: string
}

export interface Proyecto {
  id?: number
  id_coparte: number
  id_alt: string
  f_monto_total: string
  i_tipo_financiamiento: number
  i_beneficiados: number
  dt_registro?: string
  dt_registro_epoch?: string
  financiador: {
    id: number
    nombre?: string
  }
  responsable: {
    id: number
    nombre?: string
  }
  rubros: RubroProyecto[]
  ministraciones: MinistracionProyecto[]
  colaboradores?: ColaboradorProyecto[]
  proveedores?: ProveedorProyecto[]
}