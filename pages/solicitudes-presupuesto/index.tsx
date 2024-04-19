import React, { useEffect, useReducer, useRef } from "react"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import {
  ModalEliminar,
  estaInicialModalEliminar,
} from "@components/ModalEliminar"
import {
  epochAFecha,
  inputDateAEpoch,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerCopartes,
  obtenerProyectos,
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
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { ProyectoMin, QueriesProyecto } from "@models/proyecto.model"

type ActionTypes =
  | "CARGA_INICIAL"
  | "LOADING_ON"
  | "ERROR_API"
  | "LOAD_PROYECTOS"
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
  | "SHOW_CAMBIO_ESTATUS"
  | "HANDLE_CHANGE_SLCT_ESTATUS"
  | "CANCELAR_CAMBIO_ESTATUS"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

interface SolicitudPresupuestoVista extends SolicitudPresupuesto {
  checked: boolean
}

interface SelectEstatusProps {
  show: boolean
  i_estatus: 0 | EstatusSolicitud
  dt_pago: string
}

interface EstadoProps {
  solicitudes: SolicitudPresupuestoVista[]
  modalEliminar: {
    show: boolean
    id: number
  }
  filtros: FiltrosProps
  selectEstatus: SelectEstatusProps
  cbEstatus: boolean
  isLoading: boolean
  banner: EstadoInicialBannerProps
  user: UsuarioLogin
}

const estadoInicialSelectEstatus: SelectEstatusProps = {
  show: false,
  i_estatus: 0,
  dt_pago: "",
}

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      let banner = estadoInicialBanner

      if (!payload.solicitudesDB.length) {
        banner = {
          show: true,
          mensaje: "No hay solicitudes para mostrar",
          tipo: "warning",
        }
      }

      return {
        ...state,
        filtros: {
          ...state.filtros,
          copartesDB: payload.copartesDB,
          proyectosDB: payload.proyectosDB,
        },
        solicitudes: payload.solicitudesDB,
        banner,
        isLoading: false,
      }
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
        banner: estadoInicialBanner,
        filtros: {
          ...state.filtros,
          show: false,
        },
        selectEstatus: estadoInicialSelectEstatus,
        modalEliminar: estaInicialModalEliminar,
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
      const solicitudesDB = payload as SolicitudPresupuesto[]
      const solicitudesVista: SolicitudPresupuestoVista[] = solicitudesDB.map(
        (sol) => ({ ...sol, checked: false })
      )
      return {
        ...state,
        solicitudes: solicitudesVista,
        isLoading: false,
      }
    case "LOAD_PROYECTOS":
      return {
        ...state,
        filtros: {
          ...state.filtros,
          estado: {
            ...state.filtros,
            id_coparte: payload.id_coparte,
            id_proyecto: 0,
          },
          proyectosDB: payload.proyectosDB,
        },
      }
    case "NO_SOLICITUDES":
      return {
        ...state,
        solicitudes: [],
        isLoading: false,
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
    case "SHOW_CAMBIO_ESTATUS":
      return {
        ...state,
        selectEstatus: {
          ...state.selectEstatus,
          show: true,
        },
        filtros: {
          ...state.filtros,
          show: false,
        },
      }
    case "HANDLE_CHANGE_SLCT_ESTATUS":
      return {
        ...state,
        selectEstatus: {
          ...state.selectEstatus,
          [payload.name]: payload.value,
        },
      }
    case "CANCELAR_CAMBIO_ESTATUS":
      return {
        ...state,
        selectEstatus: estadoInicialSelectEstatus,
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
      copartesDB: [],
      proyectosDB: [],
      estado: estadoInicialFiltrosStatus,
    },
    selectEstatus: estadoInicialSelectEstatus,
    cbEstatus: false,
    isLoading: true,
    banner: estadoInicialBanner,
    user,
  }

  const router = useRouter()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const slectEstatus = useRef(null)
  const slectDtPAgo = useRef(null)
  const aExcel = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    //llenar select de copartes si no es usuario coparte
    const promesas = []

    if (user.id_rol != rolesUsuario.COPARTE) {
      promesas.push(obtenerCopartesDB())
    } else {
      promesas.push(obtenerProyectosDB({ id_responsable: user.id }))
    }

    promesas.push(obtenerSolicitudesDB())

    const resComb = await Promise.all(promesas)
    try {
      for (const res of resComb) if (res.error) throw res

      let copartesDB = []
      let proyectosDB = []

      if (user.id_rol != rolesUsuario.COPARTE) {
        copartesDB = resComb[0].data as CoparteMin[]
      } else {
        proyectosDB = resComb[0].data as ProyectoMin[]
      }
      const solicitudesDB = resComb[1].data as SolicitudPresupuesto[]

      dispatch({
        type: "CARGA_INICIAL",
        payload: {
          copartesDB,
          proyectosDB,
          solicitudesDB,
        },
      })
    } catch ({ mensaje }) {
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const obtenerCopartesDB = () => {
    const queries: QueriesCoparte =
      user.id_rol == rolesUsuario.ADMINISTRADOR ? { id_admin: user.id } : {}
    return obtenerCopartes(queries)
  }

  const obtenerProyectosDB = (queries: QueriesProyecto) => {
    return obtenerProyectos(queries)
  }

  const obtenerSolicitudesDB = () => {
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

    return obtenerSolicitudes(queries)
  }

  const cargarSolicitudes = async () => {
    try {
      dispatch({ type: "LOADING_ON" })

      const reSolicitudes = await obtenerSolicitudesDB()
      if (reSolicitudes.error) throw reSolicitudes

      const solicitudesDB = reSolicitudes.data as SolicitudPresupuesto[]

      if (!!solicitudesDB.length) {
        dispatch({ type: "LOAD_SOLICITUDES", payload: solicitudesDB })
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

  const handleChangeCoparte = async (id_coparte: number) => {
    if (!id_coparte) {
      dispatch({
        type: "LOAD_PROYECTOS",
        payload: {
          id_coparte,
          proyectosDB: [],
        },
      })
    } else {
      const { error, data, mensaje } = await obtenerProyectos({ id_coparte })

      if (error) {
        console.log(data)
        dispatch({
          type: "ERROR_API",
          payload: mensaje,
        })
      } else {
        dispatch({
          type: "LOAD_PROYECTOS",
          payload: {
            id_coparte,
            proyectosDB: data,
          },
        })
      }
    }
  }

  const despachar = (type: ActionTypes, payload?: any) => {
    dispatch({ type, payload })
  }

  const handleChangeSlctEstatus = async (ev: ChangeEvent) => {
    const { name, value } = ev.target
    dispatch({ type: "HANDLE_CHANGE_SLCT_ESTATUS", payload: { name, value } })
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
      "No.",
      "Id proyecto",
      "Fecha de pago",
      "Coparte",
      "Proveedor",
      "CLABE",
      "Titular cuenta",
      "RFC titular",
      "Email titular",
      "Tipo de gasto",
      "Descricpión del gasto",
      "Partida presupuestal del proyecto",
      "Importe solicitado",
      "Importe comprobado",
      "Por comprobar",
      "Impuestos ISR",
      "Impuestos IVA",
      "Total retenciones",
      "35% ISR",
      "Comprobación",
      "Observaciones",
      "Estatus",
    ]

    const solicituesAArray = estado.solicitudes.map((solicitud) => {
      const dtPago = solicitud.dt_pago ? epochAFecha(solicitud.dt_pago) : ""
      const proveedor = solicitud.proveedor || "Por definir"
      const folios_fiscales = solicitud.comprobantes
        .map(({ folio_fiscal }) => folio_fiscal)
        .join("/")

      const notas = solicitud.notas
        .map(({ usuario, mensaje }) => `${usuario} - ${mensaje}`)
        .join(" / ")

      return [
        solicitud.id,
        solicitud.proyecto.split(" ")[0],
        dtPago,
        solicitud.coparte,
        proveedor,
        solicitud.clabe,
        solicitud.titular_cuenta,
        solicitud.rfc_titular,
        solicitud.email_titular,
        solicitud.tipo_gasto,
        solicitud.descripcion_gasto,
        solicitud.rubro,
        solicitud.f_importe,
        solicitud.saldo.f_total_comprobaciones,
        "",
        solicitud.saldo.f_total_isr,
        solicitud.saldo.f_total_iva,
        solicitud.saldo.f_total_impuestos_retenidos,
        "",
        folios_fiscales,
        notas,
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

  const cambiarEstatusMasivo = async () => {
    const idsSolCamdioStatus = estado.solicitudes
      .filter(({ checked }) => !!checked)
      .map(({ id }) => id)

    const payload: PayloadCambioEstatus = {
      i_estatus: Number(estado.selectEstatus.i_estatus) as EstatusSolicitud,
      dt_pago: estado.selectEstatus.dt_pago,
      ids_solicitudes: idsSolCamdioStatus,
    }

    // validar que haya un estatus seleccionado
    if (!payload.i_estatus) {
      slectEstatus.current.focus()
      return false
    }
    // si el estatus es procesado, debe tener fecha de pago
    if (payload.i_estatus == estatusSolicitud.PROCESADA && !payload.dt_pago) {
      slectDtPAgo.current.focus()
      return false
    }

    const { error, data, mensaje } = await ApiCall.put(
      "/solicitudes-presupuesto/cambio-estatus",
      payload
    )
    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      cargarSolicitudes()
    }
  }

  const showSelectEstatus = estado.solicitudes.some((sol) => !!sol.checked)
  const showCbStatus = user.id_rol != rolesUsuario.COPARTE

  //totales
  let totalSolicitado = 0
  let totalComprobado = 0
  let totalXcomprobar = 0
  let totalRetenciones = 0
  let total = 0

  for (const sol of estado.solicitudes) {
    totalSolicitado += sol.f_importe
    totalComprobado += sol.saldo.f_total_comprobaciones
    totalXcomprobar += sol.saldo.f_monto_comprobar
    totalRetenciones += sol.saldo.f_total_impuestos_retenidos
    total += sol.saldo.f_total
  }

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
        <div className="col-12 col-sm-6 col-lg-3 mb-3 position-relative">
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
            copartesDB={estado.filtros.copartesDB}
            proyectosDB={estado.filtros.proyectosDB}
            despachar={despachar}
            handleChangeCoparte={handleChangeCoparte}
            cargarSolicitudes={cargarSolicitudes}
            user={user}
          />
        </div>
        <div className="col d-none d-xl-block"></div>
        {showSelectEstatus && (
          <div className="col-12 col-sm-6 col-lg-3 mb-3 position-relative">
            <button
              type="button"
              className={`btn btn-outline-secondary w-100`}
              onClick={() => dispatch({ type: "SHOW_CAMBIO_ESTATUS" })}
            >
              Cambiar estatus
              <i className="bi bi bi-toggles ms-1"></i>
            </button>
            {estado.selectEstatus.show && (
              <div className={styles.filtro}>
                <div className="px-2 py-3">
                  <div className="mb-3">
                    <label className="form-label color1 fw-semibold">
                      Estatus
                    </label>
                    <select
                      className="form-control"
                      onChange={handleChangeSlctEstatus}
                      name="i_estatus"
                      value={estado.selectEstatus.i_estatus}
                      ref={slectEstatus}
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
                  {estado.selectEstatus.i_estatus ==
                    estatusSolicitud.PROCESADA && (
                    <div className="mb-3">
                      <label className="form-label color1 fw-semibold">
                        Fecha de pago
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        onChange={handleChangeSlctEstatus}
                        name="dt_pago"
                        ref={slectDtPAgo}
                        value={estado.selectEstatus.dt_pago}
                      />
                    </div>
                  )}
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        dispatch({ type: "CANCELAR_CAMBIO_ESTATUS" })
                      }
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={cambiarEstatusMasivo}
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                    <th>CLABE</th>
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
                  {user.id_rol != rolesUsuario.COPARTE && (
                    <tr className="bg-light">
                      <td className="fw-bold" colSpan={9}>
                        Totales
                      </td>
                      <td className="fw-bold">
                        {montoALocaleString(totalSolicitado)}
                      </td>
                      <td className="fw-bold">
                        {montoALocaleString(totalComprobado)}
                      </td>
                      <td className="fw-bold">
                        {montoALocaleString(totalXcomprobar)}
                      </td>
                      <td className="fw-bold">
                        {montoALocaleString(totalRetenciones)}
                      </td>
                      <td className="fw-bold">{montoALocaleString(total)}</td>
                      <td colSpan={showCbStatus ? 5 : 4}></td>
                    </tr>
                  )}
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
                      clabe,
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
                        <td>{clabe}</td>
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
