import { ColaboradorProyecto, MinistracionProyecto, NotaProyecto, ProveedorProyecto, RubroMinistracion } from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"

export interface ResProyectoDB {
  id: number
  id_financiador: number
  financiador: string
  id_coparte: number
  id_administrador: number
  coparte: string
  id_responsable: number
  id_alt: string
  nombre: string
  responsable: string
  id_tema_social: number
  tema_social: string
  sector_beneficiado: string
  i_tipo_financiamiento: number
  i_beneficiados: number
  id_estado: number
  estado: string
  municipio: string
  descripcion: string
  dt_inicio: string
  dt_fin: string
  dt_registro: string
  id_proyecto_saldo: number
  f_monto_total: number
  f_solicitado: number
  f_transferido: number
  f_comprobado: number
  f_retenciones: number
  f_pa: number
  p_avance: number
  ministraciones?: MinistracionProyecto[]
  rubros_ministracion?: RubroMinistracion[]
  colaboradores?: ColaboradorProyecto[]
  proveedores?: ProveedorProyecto[]
  solicitudes?: SolicitudPresupuesto[]
  notas?: NotaProyecto[]
}
