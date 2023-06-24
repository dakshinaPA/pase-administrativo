// import { Colaborador } from "./colaborador.model"
import { Direccion } from "./direccion.model"
import { SolicitudPresupuesto } from "./solicitud-presupuesto.model"

export interface QueriesProyecto {
  id_coparte: number
  id: number
  min: boolean
  registro_solicitud: boolean
}

export interface ColaboradorProyecto {
  id?: number
  id_proyecto?: number
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: 1 | 2
  tipo?: string
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
  i_tipo: 1 | 2 // 1.persona fisica, 2. persona moral
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
  nombre?: string
  f_monto: string
}

export interface MinistracionProyecto {
  id?: number
  id_proyecto?: number
  i_numero: number
  f_monto: string
  i_grupo: string
  dt_recepcion: string
  dt_registro?: string
}

export interface ProyectoMin {
  id?: number
  id_alt: string
  rubros?: RubroProyecto[]
}

export interface Proyecto extends ProyectoMin {
  id_coparte: number
  f_monto_total: string
  i_tipo_financiamiento: number
  tipo_financiamiento?: string
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
  solicitudes_presupuesto?: SolicitudPresupuesto[]
}