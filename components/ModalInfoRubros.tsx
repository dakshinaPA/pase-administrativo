import { FondoNegro } from "@components/FondoNegro"
import styles from "./styles/Modal.module.css"
import { useCatalogos } from "@contexts/catalogos.context"
import Link from "next/link"

export interface ModalInfoRubros {
  show: boolean
  id_rubro: number
}

interface ModalInfoRubrosProps extends ModalInfoRubros {
  cerrar: () => void
}

const estaInicialModalInfoRubros: ModalInfoRubros = {
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
        <div className="text-end">
          <Link href="/partidas-presupuestales" target="_blank" className={styles.linkPartidas}>
            ver tabla completa de partidas presupuestales
          </Link>
        </div>
      </div>
    </FondoNegro>
  )
}

export { ModalInfoRubro, estaInicialModalInfoRubros }
