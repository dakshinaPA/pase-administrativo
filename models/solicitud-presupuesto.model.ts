export interface CuentaSolicitud {
  titular: string
  clabe: string
  id_banco: number
  rfc: string
  email: string
}

export interface ComprobanteSolicitud {
  id?: number
  folio_fiscal: string
  f_total: string
  f_retenciones: string
  i_regimen_fiscal: number
  i_forma_pago: number
}

export type TipoGastoSolicitud = 1 | 2 | 3 | 4 | 5

export type EstatusSolicitud = 1 | 2 | 3 | 4

export interface SolicitudPresupuesto {
  id?: number 
  id_proyecto?: number
  i_tipo_gasto: TipoGastoSolicitud
  tipo_gasto?: string
  proveedor: string
  descripcion_gasto: string
  id_partida_presupuestal: number //id rubro
  f_importe: string
  f_monto_comprobar: string
  i_estatus: EstatusSolicitud
  estatus?: string
  cuenta: CuentaSolicitud
  comprobantes?: ComprobanteSolicitud[]
}