import { obtenerCopartes, obtenerProyectos } from "@assets/utils/common"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { ProyectoMin, QueriesProyecto } from "@models/proyecto.model"
import { QueriesSolicitud } from "@models/solicitud-presupuesto.model"
import { useState, useEffect } from "react"
import styles from "@components/styles/Filtros.module.css"
import { UsuarioLogin } from "@models/usuario.model"
import { rolesUsuario } from "@assets/utils/constantes"
import { ChangeEvent } from "@assets/models/formEvents.model"

export interface FiltrosProps {
  show: boolean
  estado: QueriesSolicitud
}

type ActionTypes =
  | "LIMPIAR_FILTROS"
  | "HANDLE_CHANGE_FILTRO"
  | "HANDLE_CHANGE_FILTRO_COPARTE"

interface FiltrosPropsUI {
  filtros: FiltrosProps
  despachar: (type: ActionTypes, payload?: any) => void
  cargarSolicitudes: () => Promise<void>
  user: UsuarioLogin
}

const estadoInicialFiltros: QueriesSolicitud = {
  id_coparte: 0,
  id_proyecto: 0,
  titular: "",
  dt_inicio: "",
  dt_fin: "",
}

const Filtros = ({
  filtros,
  despachar,
  cargarSolicitudes,
  user,
}: FiltrosPropsUI) => {
  const [copartesUsuario, setCopartesUsuario] = useState<CoparteMin[]>([])
  const [proyectosUsuario, setProyectosUsuario] = useState<ProyectoMin[]>([])

  useEffect(() => {
    cargarDataUsuario()
  }, [])

  const cargarDataUsuario = async () => {
    //llenar select de copartes si no es usuario coparte
    if (user.id_rol != rolesUsuario.COPARTE) {
      cargarCopartesUsuario()
    } else {
      cargarProyectos({ id_responsable: user.id })
    }
  }

  const cargarCopartesUsuario = async () => {
    const queries: QueriesCoparte =
      user.id_rol == rolesUsuario.ADMINISTRADOR ? { id_admin: user.id } : {}

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

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target
    despachar("HANDLE_CHANGE_FILTRO", { name, value })
  }

  const handleChangeCoparte = (ev: ChangeEvent) => {
    const id_coparte = Number(ev.target.value)
    despachar("HANDLE_CHANGE_FILTRO_COPARTE", id_coparte)

    if (!id_coparte) {
      setProyectosUsuario([])
      return
    }
    cargarProyectos({ id_coparte })
  }

  const buscarSolicitudes = () => {
    cargarSolicitudes()
  }

  const limpiarFiltros = () => {
    despachar("LIMPIAR_FILTROS")
  }

  if (!filtros.show) return null

  return (
    <div className={styles.filtro}>
      <div className="border px-2 py-3">
        {user.id_rol != rolesUsuario.COPARTE && (
          <div className="mb-3">
            <label className="form-label color1 fw-semibold">Coparte</label>
            <select
              className="form-control"
              name="id_coparte"
              onChange={handleChangeCoparte}
              value={filtros.estado.id_coparte}
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
            value={filtros.estado.id_proyecto}
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
            value={filtros.estado.i_estatus}
          >
            <option value="0">Todos</option>
            <option value="1">Revisión</option>
            <option value="2">Autorizada</option>
            <option value="3">Rechazada</option>
            <option value="4">Procesada</option>
            <option value="5">Devolución</option>
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
            value={filtros.estado.titular}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha inicio</label>
          <input
            className="form-control"
            type="date"
            name="dt_inicio"
            onChange={handleChange}
            value={filtros.estado.dt_inicio}
          />
        </div>
        <div className="mb-3">
          <label className="form-label color1 fw-semibold">Fecha fin</label>
          <input
            className="form-control"
            type="date"
            name="dt_fin"
            onChange={handleChange}
            value={filtros.estado.dt_fin}
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

export { Filtros, estadoInicialFiltros }
