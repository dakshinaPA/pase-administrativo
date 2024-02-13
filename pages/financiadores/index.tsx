import React, { useEffect, useReducer } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { ModalEliminar } from "@components/ModalEliminar"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { aMinuscula } from "@assets/utils/common"
import { Financiador } from "@models/financiador.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import {
  Banner,
  EstadoInicialBannerProps,
  estadoInicialBanner,
} from "@components/Banner"
import { ChangeEvent } from "@assets/models/formEvents.model"

interface ModalEliminarProps {
  show: boolean
  id: number
  nombre: string
}

interface EstadoProps {
  financiadoresDB: Financiador[]
  modalEliminar: ModalEliminarProps
  isLoading: boolean
  inputBusqueda: string
  banner: EstadoInicialBannerProps
}

const estaInicialModalEliminar: ModalEliminarProps = {
  show: false,
  id: 0,
  nombre: "",
}

const estadoInicial: EstadoProps = {
  financiadoresDB: [],
  modalEliminar: estaInicialModalEliminar,
  isLoading: true,
  inputBusqueda: "",
  banner: estadoInicialBanner,
}

type ActionTypes =
  | "ERROR_API"
  | "CARGAR_DATA"
  | "ELIMINAR"
  | "CANCELAR_ELIMINAR"
  | "BUSCAR"
  | "ABRIR_MODAL_ELIMINAR"

interface ActionProps {
  type: ActionTypes
  payload?: any
}

const reducer = (state: EstadoProps, action: ActionProps): EstadoProps => {
  switch (action.type) {
    case "ERROR_API":
      return {
        ...state,
        banner: {
          show: true,
          mensaje: action.payload,
          tipo: "error",
        },
        isLoading: false,
      }
    case "CARGAR_DATA":
      return {
        ...state,
        financiadoresDB: action.payload,
        isLoading: false,
      }
    case "ELIMINAR":
      return {
        ...state,
        modalEliminar: {
          ...state.modalEliminar,
          show: false,
        },
        isLoading: true,
      }
    case "CANCELAR_ELIMINAR":
      return {
        ...state,
        modalEliminar: estaInicialModalEliminar,
      }
    case "BUSCAR":
      return {
        ...state,
        inputBusqueda: action.payload,
      }
    case "ABRIR_MODAL_ELIMINAR":
      const id = action.payload
      const match = state.financiadoresDB.find((fin) => fin.id === id)
      const nombre = match?.nombre || ""

      return {
        ...state,
        modalEliminar: {
          show: true,
          id,
          nombre,
        },
      }
    default:
      return { ...state }
  }
}

const Financiadores = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const [estado, dispatch] = useReducer(reducer, estadoInicial)

  useEffect(() => {
    obtenerTodos()
  }, [])

  const obtenerTodos = async () => {
    const res = await ApiCall.get("/financiadores")
    const { error, data, mensaje } = res

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      dispatch({
        type: "CARGAR_DATA",
        payload: data as Financiador[],
      })
    }
  }

  const abrirModalEliminar = (id: number) => {
    dispatch({
      type: "ABRIR_MODAL_ELIMINAR",
      payload: id,
    })
  }

  const eliminarFinanciador = async () => {
    dispatch({
      type: "ELIMINAR",
    })

    const { error, data, mensaje } = await ApiCall.delete(
      `/financiadores/${estado.modalEliminar.id}`
    )

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      await obtenerTodos()
    }
  }

  const cancelarEliminar = () => {
    dispatch({
      type: "CANCELAR_ELIMINAR",
    })
  }

  const onInputBusqueda = (ev: ChangeEvent) => {
    dispatch({
      type: "BUSCAR",
      payload: ev.target.value,
    })
  }

  const busquedaFiltrados = estado.financiadoresDB.filter(
    ({ nombre, id_alt }) => {
      const query = aMinuscula(estado.inputBusqueda)
      return (
        aMinuscula(nombre).includes(query) || aMinuscula(id_alt).includes(query)
      )
    }
  )

  if (estado.isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (estado.banner.show) {
    return (
      <Contenedor>
        <Banner tipo={estado.banner.tipo} mensaje={estado.banner.mensaje} />
      </Contenedor>
    )
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == 1 && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/financiadores/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        {user.id_rol == 2 ? (
          <div className="col d-none d-sm-block mb-3"></div>
        ) : (
          <div className="col d-none d-lg-block mb-3"></div>
        )}
        <div className="col-12 col-sm-6 col-xl-4 mb-3">
          <div className="input-group">
            <input
              type="text"
              name="busqueda"
              className="form-control"
              placeholder="Buscar registro"
              value={estado.inputBusqueda}
              onChange={onInputBusqueda}
            />
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table">
            <thead className="table-light">
              <tr className="color1">
                <th>#Id</th>
                <th>Id Alt</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>País</th>
                <th>Enlace</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Página web</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {busquedaFiltrados.map((financiador) => {
                const {
                  id,
                  id_alt,
                  nombre,
                  tipo,
                  pagina_web,
                  enlace,
                  direccion,
                } = financiador

                const nombreEnlace = `${enlace.nombre} ${enlace.apellido_paterno} ${enlace.apellido_materno}`

                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{id_alt}</td>
                    <td>{nombre}</td>
                    <td>{tipo}</td>
                    <td>{direccion.pais}</td>
                    <td>{nombreEnlace}</td>
                    <td>{enlace.email}</td>
                    <td>{enlace.telefono}</td>
                    <td className="textOverflowTd">
                      <a href={`http://${pagina_web}`} target="_blank">
                        {pagina_web}
                      </a>
                    </td>
                    <td>
                      <div className="d-flex">
                        <LinkAccion
                          margin={false}
                          icono="bi-eye-fill"
                          ruta={`/financiadores/${id}`}
                          title="ver detalle"
                        />
                        {user.id_rol == 1 && (
                          <BtnAccion
                            margin="l"
                            icono="bi-x-circle"
                            onclick={() => abrirModalEliminar(id)}
                            title="eliminar financiador"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEliminar
        show={estado.modalEliminar.show}
        aceptar={eliminarFinanciador}
        cancelar={cancelarEliminar}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al financiador {estado.modalEliminar.nombre}
          ?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Financiadores
