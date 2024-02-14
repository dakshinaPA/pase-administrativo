import { FondoNegro } from "@components/FondoNegro"
import styles from "./styles/Modal.module.css"

export interface ModalEliminarProps {
  show: boolean
  id: number
  nombre: string
}

const estaInicialModalEliminar: ModalEliminarProps = {
  show: false,
  id: 0,
  nombre: "",
}

const ModalEliminar = ({ children, show, cancelar, aceptar }) => {
  if (!show) {
    return null
  }

  return (
    <FondoNegro>
      <div className={styles.modal}>
        <div className="bg1 text-white p-3">
          <h5 className="m-0">Confirmarción eliminar</h5>
        </div>
        <div className="p-3">{children}</div>
        <hr className="m-0" />
        <div className="p-3 text-end">
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={cancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-outline-success ms-2"
            onClick={aceptar}
          >
            Aceptar
          </button>
        </div>
      </div>
    </FondoNegro>
  )
}

export { ModalEliminar, estaInicialModalEliminar }
