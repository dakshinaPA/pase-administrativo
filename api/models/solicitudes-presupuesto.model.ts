import { ColaboradorProyecto, ProveedorProyecto } from "@models/proyecto.model"
import {
  ComprobanteSolicitud,
  NotaSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"

export interface SolicitudesDB {
  solicitudes: SolicitudPresupuesto[]
  comprobantes: ComprobanteSolicitud[]
  notas: NotaSolicitud[]
  colaboradores: ColaboradorProyecto[]
  proveedores: ProveedorProyecto[]
}
