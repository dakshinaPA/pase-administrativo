export interface QueriesSolicitud {
  id?: number
  id_proyecto?: number
  id_responsable?: number
}

export interface ComprobanteSolicitud {
  id?: number
  folio_fiscal: string
  f_total: string
  f_retenciones: string
  i_metodo_pago: 1 | 2 // 1.PUE 2.PPD
  metodo_pago?: "PUE" | "PPD"
  id_forma_pago: number
  clave_forma_pago?: string
  forma_pago?: string
  id_regimen_fiscal: number
  clave_regimen_fiscal?: string
  regimen_fiscal?: string
  dt_registro?: string
}

export type TipoGastoSolicitud = 0 | 1 | 2 | 3 | 4 | 5

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
  f_monto_comprobar?: string
  i_estatus?: EstatusSolicitud
  estatus?: string
  titular_cuenta: string
  clabe: string
  id_banco: number
  banco?: string
  email: string
  comprobantes?: ComprobanteSolicitud[]
}
