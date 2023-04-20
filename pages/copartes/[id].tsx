import { FormaCoparte } from "@components/FormaCoparte"
import { BtnBack } from "@components/BtnBack"

const RegistroCoparte = () => {
  return (
    <>
      <div className="container mb-3">
        <div className="row">
          <div className="col-12 d-flex align-items-center">
            <BtnBack navLink="/copartes" />
            <h2 className="color1 mb-0">Editar coparte</h2>
          </div>
        </div>
      </div>
      <FormaCoparte />
    </>
  )
}

export default RegistroCoparte
