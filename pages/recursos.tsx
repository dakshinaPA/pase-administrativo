import { RegistroContenedor } from "@components/Contenedores"
import { useSesion } from "@hooks/useSesion"

const PageVideos = () => {
  const { status } = useSesion()
  if (status !== "authenticated") return null

  return (
    <RegistroContenedor>
      <div className="row mb-5">
        <div className="col-12">
          <a href="https://dakshina.thinkific.com" target="_blank">
            <div
              className="p-4 d-flex flex-column justify-content-center align-items-end"
              style={{
                height: "300px",
                backgroundImage:
                  "url(https://dakshina-imagen.s3.us-east-2.amazonaws.com/osc.png)",
                backgroundSize: "cover",
                backgroundPositionY: "center",
              }}
            >
              <h3 className="text-white">Plataforma de aprendizaje para OSC</h3>
              <p className="text-white">
                Descubre cursos, webinars y más, que Dakshina tiene para ti sin
                costo
              </p>
            </div>
          </a>
        </div>
      </div>
      <div className="row g-5">
        <div className="col-12 text-center">
          <h2 className="color1">Videos</h2>
        </div>
        <div className="col-12 col-lg-6">
          <h4 className="color1">1. Introducción a la plataforma</h4>
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
          <h4 className="color1">2. Registro de proveedores</h4>
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
          <h4 className="color1">3. Registro de colaboradores</h4>
          <video
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/ingreso-colaboradores.mp4"
            width="100%"
            // height="240"
            controls
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="col-12 col-lg-6">
          <h4 className="color1">4. Comprobación de solicitudes</h4>
          <video
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/ingreso-solicitudes.mp4"
            width="100%"
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
