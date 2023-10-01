import {
  obtenerCopartes,
  obtenerProyectos,
  inputDateAEpoch,
} from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { ProyectoMin, QueriesProyecto } from "@models/proyecto.model"
import { QueriesSolicitud } from "@models/solicitud-presupuesto.model"
import { useState, useEffect } from "react"
import styles from "@components/styles/Filtros.module.css"

interface FiltrosProps {
  filtros: QueriesSolicitud
  setFiltros: React.Dispatch<React.SetStateAction<QueriesSolicitud>>
  show: boolean
  setShow: (show: boolean) => void
  cargarSolicitudes: () => Promise<void>
  limpiarFiltros: () => void

}

const Filtros = ({
  filtros,
  setFiltros,
  show,
  setShow,
  cargarSolicitudes,
  limpiarFiltros
}: FiltrosProps) => {
  const { user } = useAuth()
  const [copartesUsuario, setCopartesUsuario] = useState<CoparteMin[]>([])
  const [proyectosUsuario, setProyectosUsuario] = useState<ProyectoMin[]>([])

  // useEffect(() => {
  //   // setFiltros(estadoInicialForma)
  //   // setProyectosUsuario([])
  // }, [show])

  useEffect(() => {
    cargarDataUsuario()
  }, [])

  useEffect(() => {
    if (filtros.id_coparte == 0) {
      // limpuiar filtro de proyectos
      setFiltros((prevState) => ({
        ...prevState,
        id_proyecto: 0,
      }))
      setProyectosUsuario([])
      return
    }

    cargarProyectos({ id_coparte: filtros.id_coparte })
  }, [filtros.id_coparte])

  const cargarDataUsuario = async () => {
    //llenar select de copartes si no es usuario coparte
    if (user.id_rol != 3) {
      cargarCopartesUsuario()
    } else {
      cargarProyectos({ id_responsable: user.id })
    }
  }

  const cargarCopartesUsuario = async () => {
    const queries: QueriesCoparte =
      user.id_rol == 2 ? { id_admin: user.id } : {}

    try {
      const reCopartes = await obtenerCopartes(queries)
      if (reCopartes.error) throw reCopartes.data
      const copartes = reCopartes.data as CoparteMin[]
      setCopartesUsuario(copartes)
    } catch (error) {
      console.log(error)
    }
  }

  const cargarProyectos = async (queries: QueriesProyecto) => {
    try {
      const reProyectos = await obtenerProyectos(queries)
      if (reProyectos.error) throw reProyectos.data
      const proyectos = reProyectos.data as ProyectoMin[]
      setProyectosUsuario(proyectos)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (ev) => {
    const { name, value } = ev.target

    setFiltros((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const buscarSolicitudes = () => {
    cargarSolicitudes()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className={styles.filtro}>
      <div className="border px-2 py-3">
        {user.id_rol != 3 && (
          <div className="mb-3">
            <label className="form-label color1 fw-semibold">Coparte</label>
            <select
              className="form-control"
              name="id_coparte"
              onChange={handleChange}
              value={filtros.id_coparte}
            >
              <option value="0">Todas</option>
              {copartesUsuario.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Proyecto</label>
          <select
            className="form-control"
            name="id_proyecto"
            onChange={handleChange}
            value={filtros.id_proyecto}
          >
            <option value="0">Todos</option>
            {proyectosUsuario.map(({ id, id_alt, nombre }) => (
              <option key={id} value={id}>
                {id_alt} - {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Estatus</label>
          <select
            className="form-control"
            name="i_estatus"
            onChange={handleChange}
            value={filtros.i_estatus}
          >
            <option value="0">Todos</option>
            <option value="1">Revisión</option>
            <option value="2">Autorizada</option>
            <option value="3">Rechazada</option>
            <option value="4">Procesada</option>
            <option value="3">Devolución</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">
            Titular cuenta
          </label>
          <input
            className="form-control"
            type="text"
            name="titular"
            onChange={handleChange}
            value={filtros.titular}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha inicio</label>
          <input
            className="form-control"
            type="date"
            name="dt_inicio"
            onChange={handleChange}
            value={filtros.dt_inicio}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha fin</label>
          <input
            className="form-control"
            type="date"
            name="dt_fin"
            onChange={handleChange}
            value={filtros.dt_fin}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary w-100 mb-3"
          onClick={buscarSolicitudes}
        >
          Buscar
          <i className="bi bi-search ms-2"></i>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary w-100"
          onClick={limpiarFiltros}
        >
          Limpiar filtros
          <i className="bi bi-stars ms-2"></i>
        </button>
      </div>
    </div>
  )
}

export { Filtros }
