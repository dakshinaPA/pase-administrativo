import { FormaUsuario } from "@components/FormaUsuario"
import { BtnBack } from "@components/BtnBack"

const RegistroUsuario = () => {
  return (
    <>
      <div className="container mb-3">
        <div className="row">
          <div className="col-12 d-flex align-items-center">
            <BtnBack navLink="/usuarios" />
            <h2 className="color1 mb-0">Editar usuario</h2>
          </div>
        </div>
      </div>
      <FormaUsuario />
    </>
  )
}

export default RegistroUsuario
