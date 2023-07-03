interface Btn {
  margin: "l" | "r" | boolean
}

const BtnEditar = ({ onClick }) => {
  return (
    <button type="button" className="btn btn-secondary" onClick={onClick}>
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

  if(margin) clases += ` ${margen()}`
  if(width) clases += " w-100"

  return (
    <button
      className={clases}
      type="button"
      onClick={onclick}
    >
      {texto}
    </button>
  )
}

export { BtnEditar, BtnCancelar, BtnRegistrar, BtnNeutro }
