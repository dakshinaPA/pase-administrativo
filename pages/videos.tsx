import { RegistroContenedor } from "@components/Contenedores"
import { useSesion } from "@hooks/useSesion"

const PageVideos = () => {
  const { status } = useSesion()
  if (status !== "authenticated") return null

  return (
    <RegistroContenedor>
      <div className="row g-5">
        <div className="col-12 col-lg-6">
          <h3 className="color1">Video 1</h3>
          <h4 className="color1">Introducción a la plataforma</h4>
          <video
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/introduccion-plataforma.mp4"
            width="100%"
            // height="240"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="col-12 col-lg-6">
          <h3 className="color1">Video 2</h3>
          <h4 className="color1">Registro de proveedores</h4>
          <video
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/ingreso-proveedores.mp4"
            width="100%"
            // height="240"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="col-12 col-lg-6">
          <h3 className="color1">Video 3</h3>
          <h4 className="color1">Registro de colaboradores</h4>
          <video
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/ingreso-colaboradores.mp4"
            width="100%"
            // height="240"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </RegistroContenedor>
  )
}

export default PageVideos
