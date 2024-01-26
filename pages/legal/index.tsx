import { RegistroContenedor } from "@components/Contenedores"
import styles from "@components/styles/Formatos.module.css"
import { useSesion } from "@hooks/useSesion"
import { Usuario } from "@models/usuario.model"

const Legal = () => {
  const { status } = useSesion()
  if (status !== "authenticated") return null

  return (
    <RegistroContenedor>
      <div className="row">
        <div className="col-12 mb-4">
          <h2 className="color1">Apartado legal</h2>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <a
            href="https://dakshina-imagen.s3.us-east-2.amazonaws.com/Aviso_de_privacidad.pdf"
            target="_blank"
            className="color1 fw-bold d-flex flex-column align-items-center"
          >
            <i className={`bi bi-file-earmark-pdf ${styles.logoPdf}`}></i>
            Aviso de privacidad
          </a>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <a
            href="https://dakshina-imagen.s3.us-east-2.amazonaws.com/Terminos_y_condiciones_del_sitio_web.pdf"
            target="_blank"
            className="color1 fw-bold d-flex flex-column align-items-center"
          >
            <i className={`bi bi-file-earmark-pdf ${styles.logoPdf}`}></i>
            Términos y condiciones del sitio web
          </a>
        </div>
        <div className="col-12 col-sm-6 col-lg-4">
          <a
            href="https://dakshina-imagen.s3.us-east-2.amazonaws.com/terminos_y_condiciones_del_pa.pdf"
            target="_blank"
            className="color1 fw-bold d-flex flex-column align-items-center"
          >
            <i className={`bi bi-file-earmark-pdf ${styles.logoPdf}`}></i>
            Términos y condiciones del PA
          </a>
        </div>
      </div>
    </RegistroContenedor>
  )
}

export default Legal
