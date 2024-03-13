import React, { useEffect, useReducer, useRef } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  epochAFecha,
  inputDateAEpoch,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { crearExcel } from "@assets/utils/crearExcel"
import {
  EstatusSolicitud,
  PayloadCambioEstatus,
  QueriesSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import {
  Filtros,
  FiltrosProps,
  estadoInicialFiltros,
} from "@components/FiltrosSolicitudes"
import styles from "@components/styles/Filtros.module.css"
import { useSesion } from "@hooks/useSesion"
import {
  Banner,
  EstadoInicialBannerProps,
  estadoInicialBanner,
} from "@components/Banner"
import { estatusSolicitud, rolesUsuario } from "@assets/utils/constantes"
import { UsuarioLogin } from "@models/usuario.model"
import { ChangeEvent } from "@assets/models/formEvents.model"

type ActionTypes =
  | "LOADING_ON"
  | "ERROR_API"
  | "LOAD_SOLICITUDES"
  | "NO_SOLICITUDES"
  | "SHOW_FILTROS"
  | "LIMPIAR_FILTROS"
  | "ABRIR_MODAL_ELIMIAR"
  | "CANCELAR_ELIMINAR"
  | "SELECCIONAR_TODAS_SOLICITUDES"
  | "CAMBIO_ESTATUS_SOLICITUD_CB"
  | "HANDLE_CHANGE_FILTRO"
  | "HANDLE_CHANGE_FILTRO_COPARTE"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

interface SolicitudPresupuestoVista extends SolicitudPresupuesto {
  checked: boolean
}

interface EstadoProps {
  solicitudes: SolicitudPresupuestoVista[]
  modalEliminar: {
    show: boolean
    id: number
  }
  filtros: FiltrosProps
  selectEstatus: 0 | EstatusSolicitud
  cbEstatus: boolean
  isLoading: boolean
  banner: EstadoInicialBannerProps
  user: UsuarioLogin
}

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
        banner: estadoInicialBanner,
      }
    case "ERROR_API":
      return {
        ...state,
        isLoading: false,
        banner: {
          show: true,
          mensaje: payload,
          tipo: "error",
        },
      }
    case "LOAD_SOLICITUDES":
      return {
        ...state,
        solicitudes: payload,
        isLoading: false,
        filtros: {
          estado: {
            ...state.filtros.estado,
            id_coparte: 0,
            id_proyecto: 0,
          },
          show: false,
        },
      }
    case "NO_SOLICITUDES":
      return {
        ...state,
        solicitudes: [],
        isLoading: false,
        filtros: {
          estado: {
            ...state.filtros.estado,
            id_coparte: 0,
            id_proyecto: 0,
          },
          show: false,
        },
        banner: {
          show: true,
          mensaje: "No hay solicitudes para mostrar",
          tipo: "warning",
        },
      }
    case "SHOW_FILTROS":
      return {
        ...state,
        filtros: {
          ...state.filtros,
          show: !state.filtros.show,
        },
      }
    case "LIMPIAR_FILTROS":
      return {
        ...state,
        filtros: {
          ...state.filtros,
          estado: {
            ...estadoInicialFiltros,
            i_estatus:
              state.user.id_rol == rolesUsuario.COPARTE
                ? 0
                : estatusSolicitud.REVISION,
          },
        },
      }
    case "ABRIR_MODAL_ELIMIAR":
      return {
        ...state,
        modalEliminar: {
          show: true,
          id: payload,
        },
      }
    case "CANCELAR_ELIMINAR":
      return {
        ...state,
        modalEliminar: {
          show: false,
          id: 0,
        },
      }
    case "SELECCIONAR_TODAS_SOLICITUDES":
      const cb = !state.cbEstatus

      return {
        ...state,
        cbEstatus: cb,
        solicitudes: state.solicitudes.map((sol) => ({ ...sol, checked: cb })),
      }
    case "CAMBIO_ESTATUS_SOLICITUD_CB":
      const nuevaListaSolicitudes = state.solicitudes.map((sol) => {
        if (sol.id == payload) {
          return {
            ...sol,
            checked: !sol.checked,
          }
        }
        return sol
      })
      return {
        ...state,
        solicitudes: nuevaListaSolicitudes,
      }
    case "HANDLE_CHANGE_FILTRO":
      return {
        ...state,
        filtros: {
          ...state.filtros,
          estado: {
            ...state.filtros.estado,
            [payload.name]: payload.value,
          },
        },
      }
    case "HANDLE_CHANGE_FILTRO_COPARTE":
      return {
        ...state,
        filtros: {
          ...state.filtros,
          estado: {
            ...state.filtros.estado,
            id_coparte: payload,
            id_proyecto: 0,
          },
        },
      }
    default:
      return state
  }
}

const SolicitudesPresupuesto = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const estadoInicialFiltrosStatus = {
    ...estadoInicialFiltros,
    i_estatus:
      user.id_rol == rolesUsuario.COPARTE ? 0 : estatusSolicitud.REVISION,
  }

  const estadoInicial: EstadoProps = {
    solicitudes: [],
    modalEliminar: {
      show: false,
      id: 0,
    },
    filtros: {
      show: false,
      estado: estadoInicialFiltrosStatus,
    },
    selectEstatus: 0,
    cbEstatus: false,
    isLoading: true,
    banner: estadoInicialBanner,
    user,
  }

  const router = useRouter()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const aExcel = useRef(null)

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const cargarSolicitudes = async () => {
    try {
      const queries: QueriesSolicitud = {}

      if (user.id_rol == rolesUsuario.ADMINISTRADOR) {
        queries.id_admin = user.id
      } else if (user.id_rol == rolesUsuario.COPARTE) {
        queries.id_responsable = user.id
      }

      if (Number(estado.filtros.estado.id_coparte))
        queries.id_coparte = estado.filtros.estado.id_coparte
      if (Number(estado.filtros.estado.id_proyecto)) {
        queries.id_proyecto = estado.filtros.estado.id_proyecto
        delete queries.id_coparte
      }
      if (Number(estado.filtros.estado.i_estatus))
        queries.i_estatus = estado.filtros.estado.i_estatus
      if (estado.filtros.estado.titular)
        queries.titular = estado.filtros.estado.titular
      if (estado.filtros.estado.dt_inicio)
        queries.dt_inicio = String(
          inputDateAEpoch(estado.filtros.estado.dt_inicio)
        )
      if (estado.filtros.estado.dt_fin)
        queries.dt_fin = String(inputDateAEpoch(estado.filtros.estado.dt_fin))

      dispatch({ type: "LOADING_ON" })

      const reSolicitudes = await obtenerSolicitudes(queries)
      if (reSolicitudes.error) throw reSolicitudes

      const solicitudesDB = reSolicitudes.data as SolicitudPresupuesto[]
      const solicitudesVista: SolicitudPresupuestoVista[] = solicitudesDB.map(
        (sol) => ({ ...sol, checked: false })
      )

      if (!!solicitudesDB.length) {
        dispatch({ type: "LOAD_SOLICITUDES", payload: solicitudesVista })
      } else {
        dispatch({ type: "NO_SOLICITUDES" })
      }
    } catch ({ data, mensaje }) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const despachar = (type: ActionTypes, payload?: any) => {
    dispatch({ type, payload })
  }

  const cambiarEstatusSolicitudes = async (ev: ChangeEvent) => {
    const i_estatus = ev.target.value

    console.log(i_estatus)

    // EstatusSolicitud
    // const idsSelecionados = solicitudesFiltradas
    //   .filter((sol) => !!sol.checked)
    //   .map((sol) => sol.id)
    // // no enviar peticion si no hay ids seleccionados
    // if (!idsSelecionados.length) return
    // setIsLoading(true)
    // setCbStatusSolicitudes(false)
    // const payload: PayloadCambioEstatus = {
    //   i_estatus,
    //   ids_solicitudes: idsSelecionados,
    // }
    // const { error, data, mensaje } = await ApiCall.put(
    //   "/solicitudes-presupuesto/cambio-estatus",
    //   payload
    // )
    // if (error) {
    //   console.log(data)
    //   setShowBanner({
    //     mensaje,
    //     show: true,
    //     tipo: "error",
    //   })
    // } else {
    //   cargarSolicitudes()
    // }
    // setIsLoading(false)
  }

  const abrirModalEliminarSolicitud = (id: number) => {
    dispatch({ type: "ABRIR_MODAL_ELIMIAR", payload: id })
  }

  const eliminarSolicitud = async () => {
    dispatch({ type: "LOADING_ON" })

    const { error, data, mensaje } = await ApiCall.delete(
      `/solicitudes-presupuesto/${estado.modalEliminar.id}`
    )

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      await cargarSolicitudes()
    }
  }

  const cancelarEliminarSolicitud = () => {
    dispatch({ type: "CANCELAR_ELIMINAR" })
  }

  const descargarExcel = () => {
    const encabezado = [
      "Id proyecto",
      "Fecha registro",
      "Fecha de pago",
      "Coparte",
      "Proveedor",
      "ClABE/Cuenta",
      "Titular",
      "Email",
      "Tipo de gasto",
      "Descricpión del gasto",
      "Partida presupuestal",
      "Importe solicitado",
      "Comprobado",
      "Por comprobar",
      "Retenciones",
      "Total",
      "Estatus",
    ]

    const solicituesAArray = estado.solicitudes.map((solicitud) => {
      const dtPago = solicitud.dt_pago ? epochAFecha(solicitud.dt_pago) : ""

      return [
        solicitud.proyecto.split(" ")[0],
        epochAFecha(solicitud.dt_registro),
        dtPago,
        solicitud.coparte,
        solicitud.proveedor,
        solicitud.clabe,
        solicitud.titular_cuenta,
        solicitud.email,
        solicitud.tipo_gasto,
        solicitud.descripcion_gasto,
        solicitud.rubro,
        solicitud.f_importe,
        solicitud.saldo.f_total_comprobaciones,
        solicitud.saldo.f_monto_comprobar,
        solicitud.saldo.f_total_impuestos_retenidos,
        solicitud.saldo.f_total,
        solicitud.estatus,
      ]
    })

    const dataSheet = [encabezado, ...solicituesAArray]

    crearExcel({
      nombreHoja: "Libro 1",
      nombreArchivo: "solicitudes.xlsx",
      data: dataSheet,
    })
  }

  const seleccionarSolicitudCambioStatus = (id_solicitud: number) => {
    dispatch({
      type: "CAMBIO_ESTATUS_SOLICITUD_CB",
      payload: id_solicitud,
    })
  }

  const selectAllSolicitudes = () => {
    dispatch({ type: "SELECCIONAR_TODAS_SOLICITUDES" })
  }

  const showSelectEstatus = estado.solicitudes.some((sol) => !!sol.checked)
  const showCbStatus = user.id_rol != rolesUsuario.COPARTE

  if (estado.isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        {user.id_rol == rolesUsuario.COPARTE && (
          <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
            <BtnNeutro
              texto="Registrar +"
              onclick={() => router.push("/solicitudes-presupuesto/registro")}
              margin={false}
              width={true}
            />
          </div>
        )}
        <div
          className={`col-12 col-sm-6 col-lg-3 mb-3 ${styles.filtros_contenedor}`}
        >
          <button
            type="button"
            className={`btn btn-outline-secondary w-100`}
            onClick={() => dispatch({ type: "SHOW_FILTROS" })}
          >
            Filtros
            <i className="bi bi-funnel ms-1"></i>
          </button>
          <Filtros
            filtros={estado.filtros}
            despachar={despachar}
            cargarSolicitudes={cargarSolicitudes}
            user={user}
          />
        </div>
        <div className="col d-none d-xl-block"></div>
        {showSelectEstatus && (
          <div className="col-12 col-sm-6 col-lg-3 mb-3">
            <select
              className="form-control"
              onChange={cambiarEstatusSolicitudes}
              value={estado.selectEstatus}
            >
              <option value="0" disabled>
                Selecciona estatus
              </option>
              <option value="1">Revisión</option>
              <option value="2">Autorizada</option>
              <option value="3">Rechazada</option>
              {user.id_rol == rolesUsuario.SUPER_USUARIO && (
                <option value="4">Procesada</option>
              )}
              <option value="5">Devolución</option>
            </select>
          </div>
        )}
        <div className="col-12 col-sm-6 col-lg-3 col-xl-2 mb-3">
          <button
            className="btn btn-outline-secondary w-100"
            type="button"
            onClick={descargarExcel}
          >
            Exportar
            <i className="bi bi-file-earmark-excel ms-1"></i>
          </button>
          <a ref={aExcel} className="d-none" href="" download="solicitudes.xls">
            Exportar
          </a>
        </div>
      </div>
      <>
        <div className="row">
          {estado.banner.show ? (
            <Banner tipo={estado.banner.tipo} mensaje={estado.banner.mensaje} />
          ) : (
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr className="color1">
                    <th>#id</th>
                    <th>Proyecto</th>
                    {user.id_rol != 3 && <th>Coparte</th>}
                    <th>Tipo de gasto</th>
                    <th>Partida presupuestal</th>
                    <th>Titular</th>
                    <th>Proveedor</th>
                    <th>Descripción</th>
                    <th>Importe solicitado</th>
                    <th>Comprobado</th>
                    <th>Por comprobar</th>
                    <th>Retenciones</th>
                    <th>Total</th>
                    <th>Estatus</th>
                    <th>Fecha registro</th>
                    <th>Fecha pago</th>
                    {showCbStatus && (
                      <th>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={selectAllSolicitudes}
                          checked={estado.cbEstatus}
                        />
                      </th>
                    )}
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {estado.solicitudes.map((solicitud) => {
                    const {
                      id,
                      id_proyecto,
                      proyecto,
                      coparte,
                      tipo_gasto,
                      titular_cuenta,
                      proveedor,
                      descripcion_gasto,
                      rubro,
                      f_importe,
                      saldo,
                      i_estatus,
                      estatus,
                      dt_registro,
                      dt_pago,
                      checked,
                    } = solicitud

                    const colorBadge = obtenerBadgeStatusSolicitud(i_estatus)

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{proyecto.split(" ")[0]}</td>
                        {user.id_rol != 3 && <td>{coparte}</td>}
                        <td>{tipo_gasto}</td>
                        <td>{rubro}</td>
                        <td>{titular_cuenta}</td>
                        <td>{proveedor}</td>
                        <td>{descripcion_gasto}</td>
                        <td>{montoALocaleString(f_importe)}</td>
                        <td>
                          {montoALocaleString(saldo.f_total_comprobaciones)}
                        </td>
                        <td>{montoALocaleString(saldo.f_monto_comprobar)}</td>
                        <td>
                          {montoALocaleString(
                            saldo.f_total_impuestos_retenidos
                          )}
                        </td>
                        <td>{montoALocaleString(saldo.f_total)}</td>
                        <td>
                          <span className={`badge bg-${colorBadge}`}>
                            {estatus}
                          </span>
                        </td>
                        <td>{epochAFecha(dt_registro)}</td>
                        <td>{dt_pago ? epochAFecha(dt_pago) : "-"}</td>
                        {showCbStatus && (
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              onChange={() =>
                                seleccionarSolicitudCambioStatus(id)
                              }
                              checked={checked}
                            />
                          </td>
                        )}
                        <td>
                          <div className="d-flex">
                            <LinkAccion
                              margin={false}
                              icono="bi-eye-fill"
                              ruta={`/solicitudes-presupuesto/${id}`}
                            />
                            {user.id_rol == 1 && (
                              <BtnAccion
                                margin="l"
                                icono="bi-x-circle"
                                onclick={() => abrirModalEliminarSolicitud(id)}
                                title="eliminar solicitud"
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
          )}
        </div>
      </>
      <ModalEliminar
        show={estado.modalEliminar.show}
        aceptar={eliminarSolicitud}
        cancelar={cancelarEliminarSolicitud}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar la solicitud {estado.modalEliminar.id}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default SolicitudesPresupuesto
