import stylesModalNota from "./styles/ModalNotaFinanciador.module.css"
import styles from "./styles/Modal.module.css"

interface ModalNotaProps {
  show: boolean
  cancelar: () => void
  aceptar: () => void
}

const ModalNotaFinanciador = ({ show, cancelar, aceptar }: ModalNotaProps) => {
  if (!show) {
    return null
  }

  return (
    <div className={stylesModalNota.modal_nota_contenedor}>
      <div className={styles.modal}>
        <div className="bg1 text-white p-2">
          <h5 className="m-0">Agregar nota</h5>
        </div>
        <div className="px-2 py-3">
          <textarea className="form-control"></textarea>
        </div>
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
    </div>
  )
}

export { ModalNotaFinanciador }
