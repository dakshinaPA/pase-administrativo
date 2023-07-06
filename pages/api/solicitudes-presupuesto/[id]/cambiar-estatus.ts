import { SolicitudesPresupuestoServices } from "@api/services/solicitudes-presupuesto"
import { EstatusSolicitud } from "@models/solicitud-presupuesto.model"
import { NextApiRequest, NextApiResponse } from "next"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const id_solicitud = Number(req.query.id)
  const i_nuevoEstatus = req.body.i_estatus as EstatusSolicitud

  switch (req.method) {
    case "PUT":
      var { status, ...data } =
        await SolicitudesPresupuestoServices.actualizarEstatus(
          id_solicitud,
          i_nuevoEstatus
        )
      res.status(status).json(data)
      break
    default:
      res.status(500).json({ mensaje: "Acceso no autorizado" })
  }
}
