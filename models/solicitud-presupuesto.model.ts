export interface QueriesSolicitud {
  id?: number
  id_proyecto?: number
  id_responsable?: number
}

export interface ComprobanteSolicitud {
  id?: number
  folio_fiscal: string
  f_subtotal: string
  f_total: string
  f_retenciones: string
  regimen_fiscal: string
  forma_pago: string
  metodo_pago: string
  dt_registro?: string
}

export type TipoGastoSolicitud = 1 | 2 | 3 | 4 | 5

export type EstatusSolicitud = 1 | 2 | 3 | 4 | 5

export interface SolicitudPresupuesto {
  id?: number
  id_proyecto: number
  proyecto?: string
  id_responsable?: number
  i_tipo_gasto: TipoGastoSolicitud
  tipo_gasto?: string
  proveedor: string
  descripcion_gasto: string
  id_partida_presupuestal: number //id rubro
  rubro?: string
  f_importe: string
  // f_monto_comprobar: string
  i_estatus?: EstatusSolicitud
  estatus?: string
  titular: string
  clabe: string
  id_banco: number
  banco?: string
  rfc: string
  email: string
  comprobantes?: ComprobanteSolicitud[]
}
