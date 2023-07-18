import {
  TipoGastoSolicitud,
  EstatusSolicitud,
} from "@models/solicitud-presupuesto.model"

export interface ResSolicitudPresupuestoDB {
  id?: number
  id_proyecto: number
  id_responsable: number
  proyecto: string
  i_tipo_gasto: TipoGastoSolicitud
  clabe: string
  id_banco: number
  banco: string
  titular_cuenta: string
  email: string
  proveedor: string
  descripcion_gasto: string
  id_partida_presupuestal: number
  rubro: string
  f_importe: number
  f_total_comprobaciones: number
  f_total_impuestos_retenidos: number
  i_estatus: EstatusSolicitud
  dt_registro: string
}
