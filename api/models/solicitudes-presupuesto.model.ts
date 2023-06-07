import {
  TipoGastoSolicitud,
  EstatusSolicitud,
} from "@models/solicitud-presupuesto.model"

export interface ResSolicitudPresupuestoDB {
  id?: number
  id_proyecto: number
  i_tipo_gasto: TipoGastoSolicitud
  clabe: string
  id_banco: number
  titular_cuenta: string
  rfc_titular: string
  email_titular: string
  proveedor: string
  descripcion_gasto: string
  id_partida_presupuestal: number
  f_importe: string
  f_monto_comprobar: string
  i_estatus: EstatusSolicitud
  dt_registro: string
}
