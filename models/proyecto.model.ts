// import { Colaborador } from "./colaborador.model"
import { Direccion } from "./direccion.model"
import { SolicitudPresupuesto } from "./solicitud-presupuesto.model"

export interface QueriesProyecto {
  id?: number
  id_coparte?: number
  id_responsable?: number
  id_admin?: number
  min?: boolean
  registro_solicitud?: boolean
  activo?: boolean
}

export interface PeriodoServicioColaborador {
  id?: number
  i_numero_ministracion: number
  f_monto: number
  servicio: string
  descripcion: string
  dt_inicio: string
  dt_fin: string
  cp: string // cp de la direccion fiscal
}

export interface ColaboradorProyecto {
  id?: number
  id_proyecto: number
  proyecto?: string
  id_responsable?: number
  id_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  i_tipo: 1 | 2 | 3 // asimilado, honorarios, sin pago
  tipo?: string
  clabe: string
  id_banco: number
  banco?: string
  telefono: string
  email: string
  rfc: string
  curp: string
  dt_registro?: string
  direccion: Direccion
  periodos_servicio: PeriodoServicioColaborador[]
}

export interface ProveedorProyecto {
  id?: number
  id_proyecto: number
  proyecto?: string
  id_responsable?: number
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

export interface RubroMinistracion {
  id?: number
  id_ministracion?: number
  id_rubro: number
  rubro?: string
  f_monto: number
  b_activo?: boolean
}

export interface MinistracionProyecto {
  id?: number
  id_proyecto?: number
  i_numero: number
  i_grupo: string
  dt_recepcion: string
  dt_registro?: string
  rubros_presupuestales: RubroMinistracion[]
}

export interface NotaProyecto {
  id?: number
  id_proyecto: number
  id_usuario: number
  mensaje: string
  usuario?: string
  dt_registro: string
}

export interface SaldoProyecto {
  id?: number
  f_monto_total: number
  f_transferido: number
  f_solicitado: number
  f_comprobado: number
  f_por_comprobar?: number
  f_isr?: number
  f_retenciones: number
  f_pa: number //pase administrativo es la suma de las gestiones financieras
  f_ejecutado?: number // suma de solicitado + retenciones + isr + gestion financiera
  f_remanente?: number
  p_avance?: number
}

export interface ProyectoMin {
  id?: number
  id_alt: string
  nombre: string
}

export interface Proyecto extends ProyectoMin {
  id_financiador: number
  financiador?: string
  id_coparte: number
  coparte?: string
  id_administrador?: number
  id_responsable: number
  responsable?: string
  id_tema_social: number
  tema_social?: string
  sector_beneficiado: string
  i_tipo_financiamiento: number
  tipo_financiamiento?: string
  i_beneficiados: number
  id_estado: number
  estado?: string
  municipio: string
  descripcion: string
  dt_inicio: string
  dt_fin: string
  dt_registro?: string
  saldo?: SaldoProyecto
  ministraciones?: MinistracionProyecto[]
  colaboradores?: ColaboradorProyecto[]
  proveedores?: ProveedorProyecto[]
  solicitudes_presupuesto?: SolicitudPresupuesto[]
  notas?: NotaProyecto[]
}

export interface DataProyecto {
  colaboradores: ColaboradorProyecto[]
  proveedores: ProveedorProyecto[]
  rubros_presupuestales: RubroMinistracion[]
}