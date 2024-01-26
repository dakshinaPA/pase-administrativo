import Link from "next/link"

interface Btn {
  margin: "l" | "r" | boolean
}

const BtnEditar = ({ onClick }) => {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={onClick}
    >
      Editar
      <i className="bi bi-pencil ms-2"></i>
    </button>
  )
}

interface PropsBtnCancelar extends Btn {
  onclick: () => void
}

const BtnCancelar = ({ onclick, margin }: PropsBtnCancelar) => {
  const margen = () => {
    switch (margin) {
      case "l":
        return "ms-2"
      case "r":
        return "me-2"
      case false:
        return ""
    }
  }

  return (
    <button
      className={`btn btn-outline-danger ${margen()}`}
      type="button"
      onClick={onclick}
    >
      Cancelar
    </button>
  )
}

interface PropsBtnRegistrar extends Btn {
  modalidad: "EDITAR" | "CREAR"
}

const BtnRegistrar = ({ modalidad, margin }: PropsBtnRegistrar) => {
  const margen = () => {
    switch (margin) {
      case "l":
        return "ms-2"
      case "r":
        return "me-2"
      case false:
        return ""
    }
  }

  return (
    <button className={`btn btn-outline-success ${margen()}`} type="submit">
      {modalidad === "EDITAR" ? "Guardar" : "Registrar"}
    </button>
  )
}

interface PropsBtnNeutro extends Btn {
  texto: string
  onclick: () => void
  width: boolean
}

const BtnNeutro = ({ margin, texto, onclick, width }: PropsBtnNeutro) => {
  const margen = () => {
    switch (margin) {
      case "l":
        return "ms-2"
      case "r":
        return "me-2"
      case false:
        return ""
    }
  }

  let clases = "btn btn-outline-secondary"

  if (margin) clases += ` ${margen()}`
  if (width) clases += " w-100"

  return (
    <button className={clases} type="button" onClick={onclick}>
      {texto}
    </button>
  )
}

interface PropsBtnAccion extends Btn {
  onclick: () => void
  icono: string
  title: string
}

const BtnAccion = ({ margin, onclick, icono, title }: PropsBtnAccion) => {
  const margen = () => {
    switch (margin) {
      case "l":
        return "ms-1"
      case "r":
        return "me-1"
      case false:
        return ""
    }
  }

  let clases = "btn btn-secondary btn-sm"
  if (margin) clases += ` ${margen()}`

  return (
    <button className={clases} onClick={onclick} title={title} type="button">
      <i className={`bi ${icono}`}></i>
    </button>
  )
}

interface PropsLinkAccion extends Btn {
  icono: string
  ruta: string
}

const LinkAccion = ({ margin, ruta, icono }: PropsLinkAccion) => {
  const margen = () => {
    switch (margin) {
      case "l":
        return "ms-1"
      case "r":
        return "me-1"
      case false:
        return ""
    }
  }

  let clases = "btn btn-secondary btn-sm"
  if (margin) clases += ` ${margen()}`

  return (
    <Link href={ruta} className={clases}>
      <i className={`bi ${icono}`}></i>
    </Link>
  )
}

export {
  BtnEditar,
  BtnCancelar,
  BtnRegistrar,
  BtnNeutro,
  BtnAccion,
  LinkAccion,
}
