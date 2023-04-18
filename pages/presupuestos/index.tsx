import React from "react"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"
import { TablaBusqueda } from "@components/TablaBusqueda"
import { aMinuscula } from "@assets/utils/common"

const SolicitudesPresupuesto = () => {

  const buscarSolicitud = (solicitud: SolicitudPresupuesto, query: string) => {
    
    const { proveedor, clabe, banco } = solicitud

    return aMinuscula(proveedor).includes(query)
  }

  const headersTabla = ["Id", "Proveedor", "Clabe", "Banco"]

  const formatearDataUsuario = (data: SolicitudPresupuesto[]) => {

    const dataTransformada = data.map(({ id, proveedor, clabe, banco }) => {
      
      return {
        id: id,
        txt_id: proveedor,
        td: [String(id), proveedor, clabe, banco],
      }
    })

    return dataTransformada
  }

  return (
    <TablaBusqueda
      routeEntidad="presupuestos"
      filtrarEntidades={buscarSolicitud}
      headersTabla={headersTabla}
      modalEliminarMsj="la solicitud de presupuesto"
      formatearData={formatearDataUsuario}
    />
  )
}

export default SolicitudesPresupuesto
