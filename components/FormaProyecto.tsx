import {
  Context,
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react"
import { useCatalogos } from "@contexts/catalogos.context"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  MinistracionProyecto,
  NotaProyecto,
  Proyecto,
} from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import {
  fechaMasDiasFutuosString,
  inputDateAformato,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerCopartes,
  obtenerFinanciadores,
  obtenerProyectos,
  obtenerUsuarios,
} from "@assets/utils/common"
import {
  BtnAccion,
  BtnCancelar,
  BtnEditar,
  BtnNeutro,
  BtnRegistrar,
  LinkAccion,
} from "./Botones"
// import {
//   ActionTypes,
//   ProyectoProvider,
//   useProyecto,
// } from "@contexts/proyecto.context"
import { FormaMinistracion } from "./FromaMinistracion"
import { TooltipInfo } from "./Tooltip"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { Toast } from "./Toast"
import { useToast } from "@hooks/useToasts"
import { UsuarioLogin, UsuarioMin } from "@models/usuario.model"
import { PieChart } from "./PieChart"
import { Banner, EstadoInicialBannerProps, estadoInicialBanner } from "./Banner"
import Link from "next/link"
import { rolesUsuario } from "@assets/utils/constantes"
import { useSesion } from "@hooks/useSesion"
import { useRouter } from "next/router"
import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"

interface NuevaMinistracion extends MinistracionProyecto {
  id_rubro: number
}

interface FormMinistracion {
  show: boolean
  estado: NuevaMinistracion
}

interface EstadoProps {
  cargaInicial: Proyecto
  forma: Proyecto
  financiadoresDB: FinanciadorMin[]
  copartesDB: CoparteMin[]
  usuariosCoparteDB: UsuarioMin[]
  formaMinistracion: FormMinistracion
  modoEditar: boolean
  isLoading: boolean
  banner: EstadoInicialBannerProps
}

type ActionTypes =
  // | "SET_IDS_DEPENDENCIAS"
  | "ERROR_API"
  | "REGISTRO"
  | "CAMBIO_COPARTE"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "CHANGLE_FORMA_MINISTRACION"
  | "AGREGAR_RUBRO_MINISTRACION"
  | "ACTUALIZAR_MONTO_RUBRO_MINISTRACION"
  | "QUITAR_RUBRO_MINISTRACION"
  | "AGREGAR_MINISTRACION"
  | "QUITAR_MINISTRACION"
  | "ACTUALIZAR_MINISTRACIONES"
  | "CAMBIAR_TIPO_FINANCIAMIENTO"
  | "RECARGAR_NOTAS"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

interface ProyectoProvider {
  estado: EstadoProps
  idProyecto: number
  user: UsuarioLogin
  despachar: (type: ActionTypes, payload?: any) => void
  // rubros_presupuestales: RubrosPresupuestalesDB[]
}

const ProyectoContext: Context<ProyectoProvider> = createContext(null)

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
  const { type, payload } = action

  switch (type) {
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
    case "REGISTRO":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_financiador: payload.financiadoresDB[0]?.id || 0,
          id_coparte: payload.copartesDB[0]?.id || 0,
          id_responsable: payload.usuariosCoparteDB[0]?.id || 0,
        },
        financiadoresDB: payload.financiadoresDB,
        copartesDB: payload.copartesDB,
        usuariosCoparteDB: payload.usuariosCoparteDB,
        isLoading: false,
      }
    case "CAMBIO_COPARTE":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_coparte: payload.id,
          id_responsable: payload.usuariosCoparteDB[0]?.id || 0,
        },
        usuariosCoparteDB: payload.usuariosCoparteDB,
      }
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        forma: {
          ...state.forma,
          [payload.name]: payload.value,
        },
      }
    case "CHANGLE_FORMA_MINISTRACION":
      return {
        ...state,
        formaMinistracion: {
          ...state.formaMinistracion,
          estado: {
            ...state.formaMinistracion.estado,
            [payload.name]: payload.value,
          },
        },
      }
    case "AGREGAR_RUBRO_MINISTRACION":
      return {
        ...state,
        formaMinistracion: {
          ...state.formaMinistracion,
          estado: {
            ...state.formaMinistracion.estado,
            id_rubro: 0,
            rubros_presupuestales: [
              ...state.formaMinistracion.estado.rubros_presupuestales,
              {
                id_rubro: payload.id,
                rubro: payload.nombre,
                f_monto: 0,
              },
            ],
          },
        },
      }
    case "QUITAR_RUBRO_MINISTRACION":
      const rubrosSinEliminar =
        state.formaMinistracion.estado.rubros_presupuestales.filter(
          ({ id_rubro }) => id_rubro != payload
        )

      return {
        ...state,
        formaMinistracion: {
          ...state.formaMinistracion,
          estado: {
            ...state.formaMinistracion.estado,
            rubros_presupuestales: rubrosSinEliminar,
          },
        },
      }
    case "ACTUALIZAR_MONTO_RUBRO_MINISTRACION":
      const rubrosMontosActualizados =
        state.formaMinistracion.estado.rubros_presupuestales.map((rp) => {
          if (rp.id_rubro == payload.id_rubro) {
            return {
              ...rp,
              f_monto: payload.f_monto,
            }
          }
          return rp
        })

      return {
        ...state,
        formaMinistracion: {
          ...state.formaMinistracion,
          estado: {
            ...state.formaMinistracion.estado,
            rubros_presupuestales: rubrosMontosActualizados,
          },
        },
      }
    case "QUITAR_MINISTRACION":
      return {
        ...state,
        // ministraciones: payload,
      }
    case "AGREGAR_MINISTRACION":
      return {
        ...state,
        forma: {
          ...state.forma,
          ministraciones: [
            ...state.forma.ministraciones,
            {
              i_numero: state.formaMinistracion.estado.i_numero,
              i_grupo: state.formaMinistracion.estado.i_grupo,
              dt_recepcion: state.formaMinistracion.estado.dt_recepcion,
              rubros_presupuestales: [
                ...state.formaMinistracion.estado.rubros_presupuestales,
              ],
            },
          ],
        },
      }
    case "ACTUALIZAR_MINISTRACIONES":
      return {
        ...state,
        // ministraciones: payload,
      }
    case "CAMBIAR_TIPO_FINANCIAMIENTO":
      return {
        ...state,
        // ministraciones: [],
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        // notas: payload,
      }
    default:
      return state
  }
}

const FormaProyecto = () => {
  // const {
  //   estado,
  //   // estadoForma,
  //   // dispatch,
  //   idProyecto,
  //   idCoparte,
  //   modalidad,
  //   // showFormaMinistracion,
  //   // setShowFormaMinistracion,
  //   // setFormaMinistracion,
  //   // estaInicialFormaMinistracion,
  //   // modoEditar,
  //   // setModoEditar,
  //   user,
  //   router,
  // } = useProyecto()
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  const estadoInicialForma: Proyecto = {
    id_coparte: 0,
    id_financiador: 0,
    id_responsable: 0,
    id_alt: "",
    nombre: "",
    i_tipo_financiamiento: 1,
    id_tema_social: 1,
    sector_beneficiado: "",
    id_estado: 1,
    municipio: "",
    descripcion: "",
    dt_inicio: "",
    dt_fin: "",
    i_beneficiados: 0,
    saldo: {
      f_monto_total: 0,
      f_transferido: 0,
      f_solicitado: 0,
      f_comprobado: 0,
      f_por_comprobar: 0,
      f_isr: 0,
      f_retenciones: 0,
      f_pa: 0,
      f_ejecutado: 0,
      f_remanente: 0,
      p_avance: 0,
    },
    ministraciones: [],
    colaboradores: [],
    proveedores: [],
    solicitudes_presupuesto: [],
    notas: [],
  }

  const estaInicialFormaMinistracion: FormMinistracion = {
    show: true,
    estado: {
      i_numero: 1,
      i_grupo: "0",
      dt_recepcion: "",
      id_rubro: 0,
      rubros_presupuestales: [
        {
          id_rubro: 1,
          rubro: "Gestión financiera",
          f_monto: 0,
        },
      ],
    },
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    financiadoresDB: [],
    copartesDB: [],
    usuariosCoparteDB: [],
    formaMinistracion: estaInicialFormaMinistracion,
    isLoading: true,
    banner: estadoInicialBanner,
    modoEditar: modalidad === "CREAR",
  }

  const { temas_sociales, estados } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const { toastState, mostrarToast, cerrarToast } = useToast()

  useEffect(() => {
    cargarData()
  }, [])

  // useEffect(() => {
  //   cargarUsuariosCoparte()
  // }, [estadoForma.id_coparte])

  const cargarData = async () => {
    try {
      //obtener financiadores en registro o edicion
      const reFinanciadores = await obtenerFinanciadores()
      if (reFinanciadores.error) throw reFinanciadores
      const financiadoresDB = reFinanciadores.data as FinanciadorMin[]

      if (modalidad == "CREAR") {
        const queryCopartes: QueriesCoparte = {}
        if (idCoparte) {
          queryCopartes.id = idCoparte
        } else if (user.id_rol == rolesUsuario.ADMINISTRADOR) {
          queryCopartes.id_admin = user.id
        }

        const reCopartes = await obtenerCopartes(queryCopartes)
        if (reCopartes.error) throw reCopartes

        const copartesDB = reCopartes.data as CoparteMin[]

        //si hay copartes, traer usuarios de la primera en la lista
        let usuariosCoparteDB = []
        if (!!copartesDB.length) {
          usuariosCoparteDB = await obtenerUsuariosCoparte(copartesDB[0].id)
        }

        dispatch({
          type: "REGISTRO",
          payload: {
            financiadoresDB,
            copartesDB,
            usuariosCoparteDB,
          },
        })
      } else {
        const reProyecto = await obtenerProyectos({
          id: idProyecto,
          min: false,
        })

        if (reProyecto.error) throw reProyecto
        const proyectoDB = reProyecto.data as Proyecto

        dispatch({
          type: "CARGA_INICIAL",
          payload: proyectoDB,
        })
      }
    } catch ({ data, mensaje }) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const obtenerUsuariosCoparte = async (id_coparte: number) => {
    const reUsuariosDB = await obtenerUsuarios({
      id_coparte,
      min: true,
    })
    if (reUsuariosDB.error) throw reUsuariosDB
    return reUsuariosDB.data as UsuarioMin[]
  }

  const handleChangeCoparte = async (ev: ChangeEvent) => {
    const idCoparte = Number(ev.target.value)
    try {
      const usuariosCoparteDB = await obtenerUsuariosCoparte(idCoparte)
      dispatch({
        type: "CAMBIO_COPARTE",
        payload: {
          id: idCoparte,
          usuariosCoparteDB,
        },
      })
    } catch ({ data, mensaje }) {
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  // const cargarUsuariosCoparte = async () => {
  //   const idCoparte = estadoForma.id_coparte
  //   if (!idCoparte) return

  //   setIsLoading(true)

  //   const { error, data, mensaje } = await obtenerUsuarios({
  //     id_coparte: idCoparte,
  //     min: true,
  //   })

  //   if (error) {
  //     console.log(data)
  //     setShowBanner({
  //       mensaje,
  //       show: true,
  //       tipo: "error",
  //     })
  //   } else {
  //     const usuariosCoparte = data as UsuarioMin[]
  //     setUsuariosCoparteDB(usuariosCoparte)

  //     if (modalidad === "CREAR") {
  //       //setear al primer usuario de la lista
  //       dispatch({
  //         type: "HANDLE_CHANGE",
  //         payload: {
  //           name: "id_responsable",
  //           value: usuariosCoparte[0].id,
  //         },
  //       })
  //     }
  //   }

  //   setIsLoading(false)
  // }

  const registrar = () => {
    return ApiCall.post("/proyectos", estado.forma)
  }

  const editar = () => {
    return ApiCall.put(`/proyectos/${idProyecto}`, estado.forma)
  }

  const cancelar = () => {
    // modalidad === "EDITAR" ? setModoEditar(false) : router.push("/proyectos")
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    let { name, value } = ev.target

    if (name === "nombre") name = "nombre_proyecto"

    if (error.campo === ev.target.name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: ev.target,
    })
  }

  const mostrarFormaMinistracion = () => {
    //cuando se vaya a agregar una nueva ministracion hay que limpiar la forma
    //hay que calcular el numero automaticamente
    // setFormaMinistracion((prevState) => ({
    //   ...estaInicialFormaMinistracion,
    //   i_numero:
    //     Number(
    //       estadoForma.ministraciones[estadoForma.ministraciones.length - 1]
    //         ?.i_numero || 0
    //     ) + 1,
    // }))
    // setShowFormaMinistracion(true)
  }

  const calcularDtMinFin = () => {
    return estado.forma.dt_inicio
      ? fechaMasDiasFutuosString(estado.forma.dt_inicio, 1)
      : ""
  }

  const validarForma = () => {
    const campos = {
      nombre_proyecto: estado.forma.nombre,
      id_financiador: estado.forma.id_financiador,
      id_coparte: estado.forma.id_coparte,
      id_responsable: estado.forma.id_responsable,
      sector_beneficiado: estado.forma.sector_beneficiado,
      municipio: estado.forma.municipio,
      dt_inicio: estado.forma.dt_inicio,
      dt_fin: estado.forma.dt_fin,
      i_beneficiados: estado.forma.i_beneficiados,
      descripcion: estado.forma.descripcion,
    }

    // console.log(campos)
    return validarCampos(campos)
  }

  const validarMinistraciones = () => {
    if (estado.forma.ministraciones.length > 0) {
      return true
    }

    mostrarToast("Agregar ministración")
    return false
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    if (!validarMinistraciones()) return
    console.log(estado.forma)

    // setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
      // setShowBanner({
      //   mensaje,
      //   show: true,
      //   tipo: "error",
      // })
    } else {
      if (modalidad === "CREAR") {
        router.push("/proyectos")
      } else {
        const reProyectoActualizado = await obtenerProyectos({
          id: idProyecto,
          min: false,
        })
        if (reProyectoActualizado.error) {
          console.log(reProyectoActualizado.data)
        } else {
          const proyectoActualizado = reProyectoActualizado.data as Proyecto
          // dispatch({
          //   type: "CARGA_INICIAL",
          //   payload: proyectoActualizado,
          // })
          // setModoEditar(false)
        }
      }
    }
    // setIsLoading(false)
  }

  const despachar = (type: ActionTypes, payload?: any) => {
    dispatch({
      type,
      payload,
    })
  }

  const showBtnNuevaMinistracion =
    estado.modoEditar &&
    !estado.formaMinistracion.show &&
    (estado.forma.i_tipo_financiamiento >= 3 ||
      (estado.forma.i_tipo_financiamiento <= 2 &&
        !(estado.forma.ministraciones.length > 0)))

  const showBtnEditar =
    !estado.modoEditar &&
    idProyecto &&
    !estado.formaMinistracion.show &&
    (estado.forma.id_administrador == user.id ||
      user.id_rol == rolesUsuario.SUPER_USUARIO)

  const enableSlctFinanciadores =
    modalidad === "CREAR" ||
    (modalidad === "EDITAR" &&
      estado.modoEditar &&
      user.id_rol == rolesUsuario.SUPER_USUARIO)

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

  const value: ProyectoProvider = {
    estado,
    user,
    despachar,
    idProyecto,
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/proyectos" />
            {!idProyecto && <h2 className="color1 mb-0">Registrar proyecto</h2>}
          </div>
          {/* {showBtnEditar && <BtnEditar onClick={() => setModoEditar(true)} />} */}
        </div>
      </div>
      <ProyectoContext.Provider value={value}>
        <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
          {modalidad === "EDITAR" && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Id alterno</label>
              <input
                className="form-control"
                type="text"
                // onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                // name="id_alt"
                value={estado.forma.id_alt}
                disabled
              />
              {error.campo == "id_alt" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          )}
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="nombre"
              value={estado.forma.nombre}
              disabled={!estado.modoEditar}
            />
            {error.campo == "nombre" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Financiador</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_financiador"
              value={estado.forma.id_financiador}
              disabled={!enableSlctFinanciadores}
            >
              {estado.financiadoresDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
            {error.campo == "id_financiador" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Coparte</label>
            {modalidad === "CREAR" ? (
              <select
                className="form-control"
                onChange={handleChangeCoparte}
                value={estado.forma.id_coparte}
                name="id_coparte"
                disabled={Boolean(idProyecto) || Boolean(idCoparte)}
              >
                {estado.copartesDB.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {`${nombre.substring(0, 50)}...`}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="form-control"
                type="text"
                value={estado.forma.coparte}
                disabled
              />
            )}
            {error.campo == "id_coparte" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Responsable</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_responsable"
              value={estado.forma.id_responsable}
              disabled={!estado.modoEditar}
            >
              {estado.usuariosCoparteDB.map(
                ({ id, nombre, apellido_paterno }) => (
                  <option key={id} value={id}>
                    {nombre} {apellido_paterno}
                  </option>
                )
              )}
              {error.campo == "id_responsable" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Tipo de financiamiento</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="i_tipo_financiamiento"
              value={estado.forma.i_tipo_financiamiento}
              disabled={Boolean(idProyecto)}
            >
              <option value="1">Estipendio</option>
              <option value="2">Única ministración</option>
              <option value="3">Varias Ministraciones</option>
              <option value="4">Multi anual</option>
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Tema social</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_tema_social"
              value={estado.forma.id_tema_social}
              disabled={!estado.modoEditar}
            >
              {temas_sociales.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {`${nombre.substring(0, 50)}...`}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Sector beneficiado</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="sector_beneficiado"
              value={estado.forma.sector_beneficiado}
              disabled={!estado.modoEditar}
            />
            {error.campo == "sector_beneficiado" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label me-1">Estado</label>
            <TooltipInfo texto="Estado de acción del proyecto" />
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_estado"
              value={estado.forma.id_estado}
              disabled={!estado.modoEditar}
            >
              {estados.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label me-1">Municipio</label>
            <TooltipInfo texto="Municipio de acción del proyecto" />
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="municipio"
              value={estado.forma.municipio}
              disabled={!estado.modoEditar}
            />
            {error.campo == "municipio" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label me-1">Fecha inicio</label>
            <TooltipInfo texto="Inicio de la ejecución del proyecto" />
            <input
              className="form-control"
              type="date"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="dt_inicio"
              value={estado.forma.dt_inicio}
              disabled={!estado.modoEditar}
            />
            {error.campo == "dt_inicio" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label me-1">Fecha fin</label>
            <TooltipInfo texto="Fin de la ejecución del proyecto" />
            <input
              className="form-control"
              type="date"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="dt_fin"
              value={estado.forma.dt_fin}
              min={calcularDtMinFin()}
              disabled={!estado.modoEditar}
            />
            {error.campo == "dt_fin" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Beneficiados</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="i_beneficiados"
              value={estado.forma.i_beneficiados}
              disabled={!estado.modoEditar}
            />
            {error.campo == "i_beneficiados" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 mb-3">
            <label className="form-label me-1">Descripción</label>
            <textarea
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="descripcion"
              value={estado.forma.descripcion}
              disabled={!estado.modoEditar}
            />
            {error.campo == "descripcion" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12">
            <hr />
          </div>
          {/* Seccion Ministraciones */}
          <div className="col-12 mb-3 d-flex justify-content-between">
            <h4 className="color1 mb-0">Ministraciones</h4>
            {showBtnNuevaMinistracion && (
              <BtnNeutro
                margin={false}
                texto="Nuevo presupuesto +"
                width={false}
                onclick={mostrarFormaMinistracion}
              />
            )}
          </div>
          <TablaMinistraciones />
          {estado.formaMinistracion.show && <FormaMinistracion />}
          {estado.modoEditar && !estado.formaMinistracion.show && (
            <div className="col-12 text-end">
              <BtnCancelar onclick={cancelar} margin={"r"} />
              <BtnRegistrar modalidad={modalidad} margin={false} />
            </div>
          )}
        </FormaContenedor>
        <Toast estado={toastState} cerrar={cerrarToast} />
        {modalidad === "EDITAR" && (
          <>
            <Saldos />
            <Colaboradores />
            <Proveedores />
            <SolicitudesPresupuesto />
            {user.id_rol != rolesUsuario.COPARTE && <Notas />}
          </>
        )}
      </ProyectoContext.Provider>
    </RegistroContenedor>
  )
}

const TablaMinistraciones = () => {
  const { estado, user, despachar } = useContext(ProyectoContext)
  // const { user } = useSesion()

  const showAcciones =
    (user.id == estado.forma.id_administrador ||
      user.id_rol == rolesUsuario.SUPER_USUARIO) &&
    estado.modoEditar

  const sumaRubros = estado.forma.ministraciones.reduce(
    (acum, min) =>
      acum +
      min.rubros_presupuestales.reduce(
        (acum, rp) => acum + Number(rp.f_monto),
        0
      ),
    0
  )

  return (
    <div className="col-12 col-md table-responsive mb-3">
      <table className="table">
        <thead className="table-light">
          <tr className="color1">
            <th>Número</th>
            <th>Grupo</th>
            <th>Fecha de recepción</th>
            <th>Rubros</th>
            <th>Monto</th>
            {showAcciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {estado.forma.ministraciones.map(
            ({
              id,
              i_numero,
              i_grupo,
              dt_recepcion,
              rubros_presupuestales,
            }) => {
              const f_monto = rubros_presupuestales.reduce(
                (acum, rp) => acum + Number(rp.f_monto),
                0
              )

              return (
                <tr key={i_numero}>
                  <td>{i_numero}</td>
                  <td>{i_grupo}</td>
                  <td>{inputDateAformato(dt_recepcion)}</td>
                  <td>
                    <table className="table table-bordered mb-0">
                      <tbody>
                        {rubros_presupuestales.map(
                          ({ id_rubro, rubro, f_monto }) => {
                            // const nombre_corto = `${rubro.substring(0, 20)}...`
                            return (
                              <tr key={id_rubro}>
                                <td>{rubro}</td>
                                <td className="w-25">
                                  {montoALocaleString(Number(f_monto))}
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </td>
                  <td>{montoALocaleString(f_monto)}</td>
                  {showAcciones && (
                    <td>
                      {id ? (
                        <BtnAccion
                          margin={false}
                          icono="bi-pencil"
                          // onclick={() => editarMinistracion(id)}
                          onclick={() => {}}
                          title="editar ministración"
                        />
                      ) : (
                        <BtnAccion
                          margin={false}
                          icono="bi-x-circle"
                          // onclick={() => quitarMinistracion(i_numero)}
                          onclick={() => {}}
                          title="editar ministración"
                        />
                      )}
                    </td>
                  )}
                </tr>
              )
            }
          )}
          <tr>
            <td colSpan={4}></td>
            <td>{montoALocaleString(sumaRubros)}</td>
            {showAcciones && <td></td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const Saldos = () => {
  const { estado } = useContext(ProyectoContext)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Saldo</h3>
      </div>
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        <table className="table table-borderless">
          <tbody>
            <tr>
              <td>Solicitado transferido</td>
              <td>{montoALocaleString(estado.forma.saldo.f_transferido)}</td>
            </tr>
            <tr>
              <td>Impuestos</td>
              <td>{montoALocaleString(estado.forma.saldo.f_retenciones)}</td>
            </tr>
            <tr>
              <td>35% ISR</td>
              <td>{montoALocaleString(estado.forma.saldo.f_isr)}</td>
            </tr>
            <tr>
              <td>Pase administrativo</td>
              <td>{montoALocaleString(estado.forma.saldo.f_pa)}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                <hr className="my-0" />
              </td>
            </tr>
            <tr>
              <th>Total ejecutado</th>
              <td className="fw-bold">
                {montoALocaleString(estado.forma.saldo.f_ejecutado)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="col-12 col-md-6 col-lg-4 mb-3">
        <table className="table table-borderless">
          <tbody>
            <tr>
              <th>Financiamiento</th>
              <td className="fw-bold">
                {montoALocaleString(estado.forma.saldo.f_monto_total)}
              </td>
            </tr>
            <tr>
              <th>Disponible</th>
              <td className="fw-bold color3">
                {montoALocaleString(estado.forma.saldo.f_remanente)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="col-12 col-lg-4 text-center">
        <h6 className="mb-3 fw-bold">Avance</h6>
        <PieChart lado={150} porcentaje={estado.forma.saldo.p_avance} />
      </div>
    </div>
  )
}

const Colaboradores = () => {
  // const { estado, idProyecto, user } = useProyecto()
  const { estado, user, despachar, idProyecto } = useContext(ProyectoContext)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Colaboradores</h3>
        {user.id == estado.forma.id_responsable && (
          <Link
            href={`/proyectos/${idProyecto}/colaboradores/registro`}
            className="btn btn-outline-secondary"
          >
            Registrar +
          </Link>
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr className="color1">
              <th>Id empleado</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>Clabe</th>
              <th>Banco</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estado.forma.colaboradores.map(
              ({
                id,
                id_empleado,
                nombre,
                apellido_paterno,
                tipo,
                telefono,
                email,
                clabe,
                banco,
              }) => (
                <tr key={id}>
                  <td>{id_empleado}</td>
                  <td>
                    {nombre} {apellido_paterno}
                  </td>
                  <td>{tipo}</td>
                  <td>{email}</td>
                  <td>{clabe}</td>
                  <td>{banco}</td>
                  <td>{telefono}</td>
                  <td>
                    <LinkAccion
                      margin={false}
                      icono="bi-eye-fill"
                      ruta={`/proyectos/${idProyecto}/colaboradores/${id}`}
                      title="ver colaborador"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Proveedores = () => {
  // const { estado, idProyecto, user } = useProyecto()
  const { estado, user, despachar, idProyecto } = useContext(ProyectoContext)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Proveedores</h3>
        {user.id == estado.forma.id_responsable && (
          <Link
            href={`/proyectos/${idProyecto}/proveedores/registro`}
            className="btn btn-outline-secondary"
          >
            Registrar +
          </Link>
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr className="color1">
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Servicio</th>
              <th>Teléfono</th>
              <th>RFC</th>
              <th>CLABE / cuenta</th>
              <th>Banco</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estado.forma.proveedores.map(
              ({
                id,
                nombre,
                tipo,
                descripcion_servicio,
                telefono,
                rfc,
                clabe,
                banco,
                account_number,
                bank,
              }) => (
                <tr key={id}>
                  <td>{nombre}</td>
                  <td>{tipo}</td>
                  <td>{descripcion_servicio}</td>
                  <td>{telefono}</td>
                  <td>{rfc}</td>
                  <td>{clabe || account_number}</td>
                  <td>{banco || bank}</td>
                  <td>
                    <LinkAccion
                      margin={false}
                      icono="bi-eye-fill"
                      ruta={`/proyectos/${idProyecto}/proveedores/${id}`}
                      title="ver proveedor"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SolicitudesPresupuesto = () => {
  // const { estado, idProyecto, user } = useProyecto()
  const { estado, user, idProyecto } = useContext(ProyectoContext)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Solicitudes de presupuesto</h3>
        {user.id == estado.forma.id_responsable && (
          <Link
            href={`/proyectos/${idProyecto}/solicitudes-presupuesto/registro`}
            className="btn btn-outline-secondary"
          >
            Registrar +
          </Link>
        )}
      </div>
      <div
        className="col-12 table-responsive"
        style={{ maxHeight: "500px", overflowY: "auto" }}
      >
        <table className="table">
          <thead className="table-light">
            <tr className="color1">
              <th>Tipo gasto</th>
              <th>Partida presupuestal</th>
              <th>Descripción gasto</th>
              <th>Proveedor</th>
              <th>Titular cuenta</th>
              <th>Importe</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estado.forma.solicitudes_presupuesto.map(
              ({
                id,
                tipo_gasto,
                rubro,
                descripcion_gasto,
                proveedor,
                titular_cuenta,
                f_importe,
                saldo,
                i_estatus,
                estatus,
              }) => (
                <tr key={id}>
                  <td>{tipo_gasto}</td>
                  <td>{rubro}</td>
                  <td>{descripcion_gasto}</td>
                  <td>{proveedor}</td>
                  <td>{titular_cuenta}</td>
                  <td>{montoALocaleString(f_importe)}</td>
                  <td>
                    <span
                      className={`badge bg-${obtenerBadgeStatusSolicitud(
                        i_estatus
                      )}`}
                    >
                      {estatus}
                    </span>
                  </td>
                  <td>
                    <LinkAccion
                      margin={false}
                      icono="bi-eye-fill"
                      ruta={`/solicitudes-presupuesto/${id}`}
                      title="ver proveedor"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Notas = () => {
  // const { estado, idProyecto, user } = useProyecto()
  const { estado, user, idProyecto } = useContext(ProyectoContext)

  const [mensajeNota, setMensajeNota] = useState<string>("")
  const inputNota = useRef(null)

  const agregar = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/proyectos/${idProyecto}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })

    if (cr.error) {
      console.log(cr.data)
    } else {
      refrescarNotas()
      //limpiar el input
      setMensajeNota("")
    }
  }

  const refrescarNotas = async () => {
    const re = await ApiCall.get(`/proyectos/${idProyecto}/notas`)

    if (re.error) {
      console.log(re.data)
    } else {
      const notasDB = re.data as NotaProyecto[]
      // dispatch({
      //   type: "RECARGAR_NOTAS",
      //   payload: notasDB,
      // })
    }
  }

  return (
    <div className="row">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Notas</h3>
      </div>
      <div className="col-12 table-responsive mb-3">
        <table className="table">
          <thead className="table-light">
            <tr className="color1">
              <th>Usuario</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {estado.forma.notas.map(({ id, usuario, mensaje, dt_registro }) => (
              <tr key={id}>
                <td>{usuario}</td>
                <td>{mensaje}</td>
                <td>{dt_registro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="col-12 col-md-9 mb-3">
        <input
          type="text"
          className="form-control"
          value={mensajeNota}
          onChange={({ target }) => setMensajeNota(target.value)}
          placeholder="mensaje de la nota"
          ref={inputNota}
        ></input>
      </div>
      <div className="col-12 col-md-3 mb-3 text-end">
        <BtnNeutro
          texto="Agregar nota +"
          onclick={agregar}
          margin={false}
          width={false}
        />
      </div>
    </div>
  )
}

// const RegistroProyecto = () => {
//   return (
//     <ProyectoProvider>
//       <FormaProyecto />
//     </ProyectoProvider>
//   )
// }

export { FormaProyecto, ProyectoContext }
