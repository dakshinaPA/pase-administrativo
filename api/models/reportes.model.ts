
import { Direccion } from "@models/direccion.model";
import { ColaboradorProyecto, PeriodoServicioColaborador } from "@models/proyecto.model";
import { ComprobanteSolicitud } from "@models/solicitud-presupuesto.model";

export interface ComprobanteReportes extends ComprobanteSolicitud {
  id_proyecto: number
  id_alt_proyecto: string
  proyecto: string
  id_partida_presupuesta: number
  partida_presupuestal: string
  titular_cuenta: string
  regimen_fiscal: string
  dt_pago: string
}

export interface ColaboradorReportes extends PeriodoServicioColaborador, Direccion, ColaboradorProyecto {
  id_alt_proyecto: string,
  cp_direccion: string
  ps_activo: 0 | 1
}