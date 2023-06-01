import { FormaSolicitudPresupuesto } from "@components/FormaSolicitudPresupuesto"
import { BtnBack } from "@components/BtnBack"

const RegistroUsuario = () => {
  return (
    <>
      <div className="container mb-3">
        <div className="row">
          <div className="col-12 d-flex align-items-center">
            <BtnBack navLink="/presupuestos" />
            <h2 className="color1 mb-0">Registrar solicitud de presupuesto</h2>
          </div>
        </div>
      </div>
      <FormaSolicitudPresupuesto />
    </>
  )
}

export default RegistroUsuario