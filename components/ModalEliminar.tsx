import { FondoNegro } from "@components/FondoNegro"
import styles from "./styles/Modal.module.css"

const ModalEliminar = ({ children, show, cancelar, aceptar }) => {
  if (!show) {
    return null
  }

  return (
    <FondoNegro>
      <div className={styles.modal}>
        <div className="bg1 text-white p-2">
          <h5 className="m-0">Confirmarción eliminar</h5>
        </div>
        <div className="px-2 py-3">{children}</div>
        <hr className="m-0" />
        <div className="p-2 text-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={aceptar}
          >
            Aceptar
          </button>
        </div>
      </div>
    </FondoNegro>
  )
}

export { ModalEliminar }
