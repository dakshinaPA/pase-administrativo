import { RegistroContenedor } from "@components/Contenedores"
import React from "react"
import styles from "@components/styles/Formatos.module.css"
import { useSesion } from "@hooks/useSesion"

const FormatoFile = ({ link, titulo, formato }) => {
  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
      <a
        href={link}
        target="_blank"
        className="color1 fw-bold d-flex flex-column text-center"
      >
        <i
          className={`bi bi-file-earmark-${formato} ${styles.logoFormatos}`}
        ></i>
        {titulo}
      </a>
    </div>
  )
}

const Formatos = () => {
  const { status } = useSesion()
  if (status !== "authenticated") return null

  return (
    <RegistroContenedor>
      <div className="row">
        <div className="col-12 mb-4">
          <h2 className="color1">Formatos</h2>
        </div>
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/reporte_de_servicio.docx"
          titulo="Reporte de servicio"
          formato="word"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/terminos_de_referencia-entrega_de_beneficios.docx"
          titulo="Térmnos de referencia de entrega de beneficios"
          formato="word"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/invoice_ejemplo.xlsx"
          titulo="Invoice ejemplo"
          formato="excel"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/comprobacion_y_control_de_gastos_PA.xlsx"
          titulo="Comprobación y control de gastos PA"
          formato="excel"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/formulario_orden_de_compra.docx"
          titulo="Formulario orden de compra"
          formato="word"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/reporte_de_comision_y_desglose_de_viaticos.xlsm"
          titulo="Reporte de comisión y desglose de viáticos"
          formato="excel"
        />
        <FormatoFile
          link="https://dakshina-imagen.s3.us-east-2.amazonaws.com/integracion_expediente_prestadores_servicios_profesionales.docx"
          titulo="Integración de expediente de prestadores de servicios profesionales"
          formato="word"
        />
      </div>
    </RegistroContenedor>
  )
}

export default Formatos