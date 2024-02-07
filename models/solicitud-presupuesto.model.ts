export interface QueriesSolicitud {
  id?: number
  id_coparte?: number
  id_proyecto?: number
  id_responsable?: number
  id_admin?: number
  i_estatus?: number
  limit?: number
  dt_inicio?: string
  dt_fin?: string
  titular?: string
}

export type MetodosPAgo = "PUE" | "PPD"
export type IMetodosPAgo = 1 | 2

export interface ComprobanteSolicitud {
  id?: number
  id_solicitud_presupuesto?: number
  folio_fiscal: string
  f_total: string
  f_retenciones: string
  f_iva: string
  f_isr: string
  i_metodo_pago: IMetodosPAgo // 1.PUE 2.PPD
  metodo_pago?: MetodosPAgo
  id_forma_pago: number
  clave_forma_pago?: string
  forma_pago?: string
  rfc_emisor: string
  id_regimen_fiscal_receptor: number
  id_regimen_fiscal_emisor: number
  uso_cfdi: string
  dt_registro?: string
  b_activo?: boolean
}

export type TipoGastoSolicitud = 0 | 1 | 2 | 3 | 4 | 5

export type EstatusSolicitud = 1 | 2 | 3 | 4 | 5

export interface SaldoSolicitud {
  f_total_comprobaciones: number
  f_monto_comprobar: number
  f_total_impuestos_retenidos: number
  f_total: number
}

export interface NotaSolicitud {
  id?: number
  id_solicitud: number
  id_usuario: number
  mensaje: string
  usuario: string
  dt_registro: string
}

export interface SolicitudPresupuesto {
  id?: number
  id_coparte?: number
  coparte?: string
  id_proyecto: number
  proyecto?: string
  id_responsable?: number
  i_tipo_gasto: TipoGastoSolicitud
  tipo_gasto?: string
  proveedor: string
  descripcion_gasto: string
  id_partida_presupuestal: number //id rubro
  rubro?: string
  f_importe: number
  f_retenciones: number
  i_estatus?: EstatusSolicitud
  estatus?: string
  titular_cuenta: string
  clabe: string
  banco: string
  email: string
  saldo?: SaldoSolicitud
  dt_registro?: string
  comprobantes?: ComprobanteSolicitud[]
  notas?: NotaSolicitud[]
}

export interface PayloadCambioEstatus {
  i_estatus: EstatusSolicitud
  ids_solicitudes: number[]
}
