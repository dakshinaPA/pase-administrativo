import { FondoNegro } from "@components/FondoNegro"
import styles from "./styles/Modal.module.css"
import { useCatalogos } from "@contexts/catalogos.context"

export interface ModalInfoRubrosProps {
  show: boolean
  id_rubro: number
  cerrar: () => void
}

const estaInicialModalInfoRubros = {
  show: false,
  id_rubro: 0,
}

const ModalInfoRubro = ({ show, id_rubro, cerrar }: ModalInfoRubrosProps) => {
  const { rubros_presupuestales } = useCatalogos()

  if (!show) return null

  const match = rubros_presupuestales.find(({ id }) => id == id_rubro)

  return (
    <FondoNegro>
      <div className={`${styles.modal} p-3`}>
        <div className="text-end">
          <i
            className="bi bi-x-lg"
            style={{ cursor: "pointer" }}
            onClick={cerrar}
          ></i>
        </div>
        <h4 className="color1 text-center mb-4">{match.nombre}</h4>
        <p className="fw-bold color1">Descripción:</p>
        <p>{match.descripcion}</p>
        {match.importante && (
          <>
            <p className="fw-bold color-warning">
              Importante
              <i className="bi bi-exclamation-diamond mx-1"></i>:
            </p>
            <p>{match.importante}</p>
          </>
        )}
      </div>
    </FondoNegro>
  )
}

export { ModalInfoRubro, estaInicialModalInfoRubros }
