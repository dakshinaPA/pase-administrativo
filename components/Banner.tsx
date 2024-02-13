export type TiposBanner = "" | "error" | "warning"

interface BannerProps {
  tipo: TiposBanner
  mensaje?: string
}

export interface EstadoInicialBannerProps extends BannerProps {
  show: boolean
}

const estadoInicialBanner: EstadoInicialBannerProps = {
  show: false,
  tipo: "",
  mensaje: "",
}

const mensajesBanner = {
  fallaApi: "Error de conexión, contactar a un administrador o soporte",
  sinProyectos: "El usuario no cuenta con proyectos asignados",
}

const Banner = ({ tipo, mensaje }: BannerProps) => {
  let tipoAlerta = ""

  switch (tipo) {
    case "error":
      tipoAlerta = "danger"
      break
    case "warning":
      tipoAlerta = "warning"
      break
    default:
      tipoAlerta = "danger"
  }

  return (
    <div className={`alert alert-${tipoAlerta} text-center`}>{mensaje}</div>
  )
}

export { Banner, estadoInicialBanner, mensajesBanner }
