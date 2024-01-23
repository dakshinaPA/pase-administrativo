import { ComprobanteSolicitud } from "@models/solicitud-presupuesto.model";

export interface ComprobanteReportes extends ComprobanteSolicitud {
  id_proyecto: number
  id_alt_proyecto: string
  proyecto: string
  id_partida_presupuesta: number
  partida_presupuestal: string
  titular_cuenta: string
}