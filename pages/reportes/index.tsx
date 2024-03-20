import { ComprobanteReportes } from "@api/models/reportes.model"
import { ApiCall } from "@assets/utils/apiCalls"
import { crearExcel } from "@assets/utils/crearExcel"
import { RegistroContenedor } from "@components/Contenedores"
import { useSesion } from "@hooks/useSesion"

const Comprobantes = () => {
  const genFoliosFiscales = async () => {
    const res = await ApiCall.get("/reportes/comprobantes")
    if (res.error) {
      console.log(res.data)
    } else {
      const comprobantes = res.data as ComprobanteReportes[]
      generarExcel(comprobantes)
    }
  }

  const generarExcel = (comprobantes: ComprobanteReportes[]) => {
    const encabezado = [
      "Folio fiscal",
      "Id solicitud",
      "Proyecto",
      "Titular",
      "Partida presupuestal",
      "Total",
      "Retenciones ISR",
      "Retenciones IVA",
      "Retenciones totales",
      "Forma de pago",
      "Régimen fiscal emisor",
      "RFC emisor",
      "Fecha de registro",
      "Fecha de timbrado",
      "Fecha de pago",
    ]


    const comprobantesAArray = comprobantes.map((comprobante) => {
      return [
        comprobante.folio_fiscal,
        comprobante.id_solicitud_presupuesto,
        comprobante.id_alt_proyecto,
        comprobante.titular_cuenta,
        comprobante.partida_presupuestal,
        comprobante.f_total,
        comprobante.f_isr,
        comprobante.f_iva,
        comprobante.f_retenciones,
        comprobante.forma_pago,
        comprobante.regimen_fiscal,
        comprobante.rfc_emisor,
        comprobante.dt_registro,
        comprobante.dt_timbrado,
        comprobante.dt_pago,
      ]
    })

    const dataSheet = [encabezado, ...comprobantesAArray]

    crearExcel({
      nombreHoja: "Libro 1",
      nombreArchivo: "comprobantes.xlsx",
      data: dataSheet,
    })
  }

  return (
    <tr>
      <td>Comprobantes de solicitudes</td>
      <td>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={genFoliosFiscales}
        >
          Exportar
          <i className="bi bi-file-earmark-excel ms-1"></i>
        </button>
      </td>
    </tr>
  )
}

const Reportes = () => {
  const { status } = useSesion()
  if (status !== "authenticated") return null

  return (
    <RegistroContenedor>
      <div className="row">
        <div className="col-12 mb-4">
          <h2 className="color1">Reportes</h2>
        </div>
        <div className="col-12">
          <table className="table">
            <thead className="table-light">
              <tr className="color1">
                <th>Nombre</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <Comprobantes />
            </tbody>
          </table>
        </div>
      </div>
    </RegistroContenedor>
  )
}

export default Reportes
