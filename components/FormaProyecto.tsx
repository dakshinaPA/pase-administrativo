import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  MinistracionProyecto,
  NotaProyecto,
  Proyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import {
  CoparteMin,
  CoparteUsuarioMin,
  QueriesCoparte,
} from "@models/coparte.model"
import { useCatalogos } from "@contexts/catalogos.context"
import {
  inputDateAformato,
  obtenerCopartes,
  obtenerFinanciadores,
  obtenerProyectos,
  obtenerUsuariosCoparte,
} from "@assets/utils/common"
import { BtnEditar } from "./Botones"
import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"

type ActionTypes =
  | "SET_IDS_DEPENDENCIAS"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "QUITAR_MINISTRACION"
  | "AGREGAR_MINISTRACION"
  | "CAMBIAR_TIPO_FINANCIAMIENTO"
  | "RECARGAR_NOTAS"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (state: Proyecto, action: ActionDispatch): Proyecto => {
  const { type, payload } = action

  switch (type) {
    case "SET_IDS_DEPENDENCIAS":
      return {
        ...state,
        id_financiador: payload.id_financiador,
        id_coparte: payload.id_coparte,
      }
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "QUITAR_MINISTRACION":
      return {
        ...state,
        ministraciones: payload,
      }
    case "AGREGAR_MINISTRACION":
      return {
        ...state,
        ministraciones: [...state.ministraciones, payload],
      }
    case "CAMBIAR_TIPO_FINANCIAMIENTO":
      return {
        ...state,
        ministraciones: [],
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: payload,
      }
    default:
      return state
  }
}

const FormaMinistracion = ({ agregarMinistracion, setShowForma }) => {
  const { rubros_presupuestales } = useCatalogos()

  const estaInicialdFormaMinistracion: MinistracionProyecto = {
    i_numero: 0,
    f_monto: "0",
    i_grupo: "0",
    dt_recepcion: "",
    rubros_presupuestales: [],
  }

  const estadoInicialdFormaRubros: RubroMinistracion = {
    id_rubro: 0,
    f_monto: "",
  }

  const [formaMinistracion, setFormaMinistracion] = useState(
    estaInicialdFormaMinistracion
  )
  const [formaRubros, setFormaRubros] = useState(estadoInicialdFormaRubros)
  const inputNumero = useRef(null)
  const inputGrupo = useRef(null)
  const inputDtRecepcion = useRef(null)
  const selectRubro = useRef(null)
  const inputMontoRubro = useRef(null)
  const formMinistracion = useRef(null)

  useEffect(() => {
    formMinistracion.current.scrollIntoView({
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    const montoMinistracionAagregar =
      formaMinistracion.rubros_presupuestales.reduce(
        (acum, rubro) => acum + Number(rubro.f_monto),
        0
      )

    setFormaMinistracion((prevState) => ({
      ...prevState,
      f_monto: String(montoMinistracionAagregar),
    }))
  }, [formaMinistracion.rubros_presupuestales])

  const handleChangeMinistracion = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaMinistracion({
      ...formaMinistracion,
      [name]: value,
    })
  }

  const handleChangeRubro = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaRubros((prevState) => {
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  const agregarRubro = () => {
    if (formaRubros.id_rubro == 0) {
      selectRubro.current.focus()
      return
    }

    if (!Number(formaRubros.f_monto)) {
      inputMontoRubro.current.focus()
      return
    }

    const rubroMatch = rubros_presupuestales.find(
      (rp) => rp.id == formaRubros.id_rubro
    )

    if (!rubroMatch) return

    const rubroAagregar: RubroMinistracion = {
      id_rubro: formaRubros.id_rubro,
      nombre: rubroMatch.nombre,
      f_monto: formaRubros.f_monto,
    }

    setFormaMinistracion((prevState) => {
      return {
        ...prevState,
        rubros_presupuestales: [
          ...prevState.rubros_presupuestales,
          rubroAagregar,
        ],
      }
    })

    //limpiar forma
    setFormaRubros(estadoInicialdFormaRubros)
  }

  const quitarRubro = (id_rubro: number) => {
    const listaFiltrada = formaMinistracion.rubros_presupuestales.filter(
      (rubro) => rubro.id_rubro != id_rubro
    )

    setFormaMinistracion((prevstate) => ({
      ...prevstate,
      rubros_presupuestales: listaFiltrada,
    }))
  }

  const cerrarForma = () => {
    setFormaMinistracion(estaInicialdFormaMinistracion)
    setFormaRubros(estadoInicialdFormaRubros)
    setShowForma(false)
  }

  const handleAgregar = () => {
    if (!Number(formaMinistracion.i_numero)) {
      inputNumero.current.focus()
      return
    }

    if (!Number(formaMinistracion.i_grupo)) {
      inputGrupo.current.focus()
      return
    }

    if (!formaMinistracion.dt_recepcion) {
      inputDtRecepcion.current.focus()
      return
    }

    if (!formaMinistracion.rubros_presupuestales.length) {
      selectRubro.current.focus()
      return
    }

    agregarMinistracion(formaMinistracion)
    cerrarForma()
  }

  const rubrosNoSeleccionados = () => {
    const rubros: RubrosPresupuestalesDB[] = []
    const idsRubrosForma = formaMinistracion.rubros_presupuestales.map(
      ({ id_rubro }) => Number(id_rubro)
    )

    for (const rp of rubros_presupuestales) {
      if (!idsRubrosForma.includes(rp.id)) {
        rubros.push(rp)
      }
    }

    return rubros
  }

  return (
    <div className="col-12" ref={formMinistracion}>
      <div className="row">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="mb-3">
            <label className="form-label">Número</label>
            <input
              className="form-control"
              type="text"
              onChange={handleChangeMinistracion}
              name="i_numero"
              value={formaMinistracion.i_numero}
              ref={inputNumero}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Monto</label>
            <input
              className="form-control"
              type="text"
              onChange={handleChangeMinistracion}
              name="f_monto"
              value={formaMinistracion.f_monto}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Grupo</label>
            <input
              className="form-control"
              type="text"
              onChange={handleChangeMinistracion}
              name="i_grupo"
              value={formaMinistracion.i_grupo}
              ref={inputGrupo}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fecha de rececpión</label>
            <input
              className="form-control"
              type="date"
              onChange={handleChangeMinistracion}
              name="dt_recepcion"
              value={formaMinistracion.dt_recepcion}
              ref={inputDtRecepcion}
            />
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg mb-3">
          <label className="form-label">Rubros seleccionados</label>
          <table className="table">
            <thead>
              <tr>
                <th>Rubro</th>
                <th>Monto</th>
                <th>
                  <i className="bi bi-trash"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {formaMinistracion.rubros_presupuestales.map(
                ({ id_rubro, nombre, f_monto }) => (
                  <tr key={id_rubro}>
                    <td>{nombre}</td>
                    <td>{f_monto}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-dark btn-sm"
                        onClick={() => quitarRubro(id_rubro)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
            <tbody></tbody>
          </table>
        </div>
        <div className="col-12 col-lg-3 mb-3">
          <div className="mb-3">
            <label className="form-label">Rubro</label>
            <select
              className="form-control"
              name="id_rubro"
              value={formaRubros.id_rubro}
              onChange={handleChangeRubro}
              ref={selectRubro}
            >
              <option value="0" disabled>
                Selecciona rubro
              </option>
              {rubrosNoSeleccionados().map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Monto</label>
            <input
              className="form-control"
              type="text"
              name="f_monto"
              value={formaRubros.f_monto}
              onChange={handleChangeRubro}
              ref={inputMontoRubro}
            />
          </div>
          <div>
            <button
              type="button"
              className="btn btn-secondary btn-sm w-100"
              onClick={agregarRubro}
            >
              Agregar rubro +
            </button>
          </div>
        </div>
        <div className="col-12 mb-3 d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cerrarForma}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={handleAgregar}
          >
            Agregar ministración +
          </button>
        </div>
      </div>
    </div>
  )
}

interface PropsTablaMinistraciones {
  modoEditar: boolean
  ministraciones: MinistracionProyecto[]
  quitar: (i_numero: number) => void
}

const TablaMinistraciones = ({
  modoEditar,
  ministraciones,
  quitar,
}: PropsTablaMinistraciones) => {
  return (
    <div className="col-12 col-md table-responsive mb-3">
      <table className="table">
        <thead className="table-light">
          <tr>
            <th>Número</th>
            <th>Grupo</th>
            <th>Fecha de recepción</th>
            <th>Rubros</th>
            <th>Monto</th>
            {modoEditar && (
              <th>
                <i className="bi bi-trash"></i>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {ministraciones.map(
            ({
              id,
              i_numero,
              f_monto,
              i_grupo,
              dt_recepcion,
              rubros_presupuestales,
            }) => (
              <tr key={i_numero}>
                <td>{i_numero}</td>
                <td>{i_grupo}</td>
                <td>{inputDateAformato(dt_recepcion)}</td>
                <td>
                  <table className="table table-bordered mb-0">
                    <tbody>
                      {rubros_presupuestales.map(
                        ({ id_rubro, nombre, f_monto }) => {
                          // const nombre_corto = `${nombre.substring(0, 20)}...`

                          return (
                            <tr key={id_rubro}>
                              <td>{nombre}</td>
                              <td className="w-25">{f_monto}</td>
                            </tr>
                          )
                        }
                      )}
                    </tbody>
                  </table>
                </td>
                <td>{f_monto}</td>
                {modoEditar && (
                  <td>
                    {!id && (
                      <button
                        type="button"
                        className="btn btn-dark btn-sm"
                        onClick={() => quitar(i_numero)}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}

const Colaboradores = ({ colaboradores, id_responsable }) => {
  const { user } = useAuth()
  const router = useRouter()
  const idProyecto = Number(router.query.idP)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Colaboradores</h3>
        {user.id == id_responsable && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              router.push(`/proyectos/${idProyecto}/colaboradores/registro`)
            }
          >
            Registrar +
          </button>
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Servicio</th>
              <th>Teléfono</th>
              <th>RFC</th>
              <th>CLABE</th>
              <th>Banco</th>
              <th>Monto total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.map(
              ({
                id,
                nombre,
                apellido_paterno,
                tipo,
                nombre_servicio,
                telefono,
                rfc,
                clabe,
                banco,
                f_monto_total,
              }) => (
                <tr key={id}>
                  <td>
                    {nombre} {apellido_paterno}
                  </td>
                  <td>{tipo}</td>
                  <td>{nombre_servicio}</td>
                  <td>{telefono}</td>
                  <td>{rfc}</td>
                  <td>{clabe}</td>
                  <td>{banco}</td>
                  <td>{f_monto_total}</td>
                  <td>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/colaboradores/${id}`
                        )
                      }
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
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

const Proveedores = ({ proveedores, id_responsable }) => {
  const { user } = useAuth()
  const router = useRouter()
  const idProyecto = Number(router.query.idP)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Proveedores</h3>
        {user.id == id_responsable && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              router.push(`/proyectos/${idProyecto}/proveedores/registro`)
            }
          >
            Registrar +
          </button>
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Servicio</th>
              <th>Teléfono</th>
              <th>RFC</th>
              <th>CLABE</th>
              <th>Banco</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(
              ({
                id,
                nombre,
                tipo,
                descripcion_servicio,
                telefono,
                rfc,
                clabe,
                banco,
              }) => (
                <tr key={id}>
                  <td>{nombre}</td>
                  <td>{tipo}</td>
                  <td>{descripcion_servicio}</td>
                  <td>{telefono}</td>
                  <td>{rfc}</td>
                  <td>{clabe}</td>
                  <td>{banco}</td>
                  <td>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/proveedores/${id}`
                        )
                      }
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
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

const SolicitudesPresupuesto = ({ solicitudes, id_responsable }) => {
  const { user } = useAuth()
  const router = useRouter()
  const idProyecto = Number(router.query.idP)

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Solicitudes de presupuesto</h3>
        {user.id == id_responsable && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              router.push(
                `/proyectos/${idProyecto}/solicitudes-presupuesto/registro`
              )
            }
          >
            Registrar +
          </button>
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Descripción gasto</th>
              <th>Tipo</th>
              <th>Rubro</th>
              <th>Proveedor</th>
              <th>Importe</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map(
              ({
                id,
                descripcion_gasto,
                tipo_gasto,
                rubro,
                proveedor,
                f_importe,
              }) => (
                <tr key={id}>
                  <td>{descripcion_gasto}</td>
                  <td>{tipo_gasto}</td>
                  <td>{rubro}</td>
                  <td>{proveedor}</td>
                  <td>{f_importe}</td>
                  <td>
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/solicitudes-presupuesto/${id}`
                        )
                      }
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
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

interface PropsNotas {
  notas: NotaProyecto[]
  refrescarNotas: () => void
}

const Notas = ({ notas, refrescarNotas }: PropsNotas) => {
  const router = useRouter()
  const idProyecto = Number(router.query.idP)
  const { user } = useAuth()
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const inputNota = useRef(null)

  const agregar = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    //limpiar el input
    setMensajeNota("")

    const cr = await ApiCall.post(`/proyectos/${idProyecto}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })

    if (cr.error) {
      console.log(cr.data)
    } else {
      refrescarNotas()
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
            <tr>
              <th>Usuario</th>
              <th>Mensaje</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {notas.map(({ id, usuario, mensaje, dt_registro }) => (
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
        {/* <textarea className="form-control"></textarea> */}
      </div>
      <div className="col-12 col-md-3 mb-3 text-end">
        <button className="btn btn-secondary" onClick={agregar}>
          Agregar nota +
        </button>
      </div>
    </div>
  )
}

const FormaProyecto = () => {
  const { user } = useAuth()
  if (!user) return null

  const { temas_sociales } = useCatalogos()
  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)

  const estadoInicialForma: Proyecto = {
    id_coparte: 0,
    id_financiador: 0,
    id_responsable: 0,
    id_alt: "",
    f_monto_total: "0",
    i_tipo_financiamiento: 1,
    id_tema_social: 1,
    i_beneficiados: 0,
    ministraciones: [],
    colaboradores: [],
    proveedores: [],
    solicitudes_presupuesto: [],
    notas: [],
  }

  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [financiadoresDB, setFinanciadoresDB] = useState<FinanciadorMin[]>([])
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosCoparteDB, setUsuariosCoparteDB] = useState<
    CoparteUsuarioMin[]
  >([])
  const [showFormaMinistracion, setShowFormaMinistracion] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarUsuariosCoparte()
  }, [estadoForma.id_coparte])

  useEffect(() => {
    if (modalidad === "CREAR") {
      dispatch({
        type: "CAMBIAR_TIPO_FINANCIAMIENTO",
        payload: null,
      })
    }
  }, [estadoForma.i_tipo_financiamiento])

  useEffect(() => {
    if (modalidad === "CREAR") {
      const montoTotalProyecto = estadoForma.ministraciones.reduce(
        (acum, ministracion) => acum + Number(ministracion.f_monto),
        0
      )

      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "f_monto_total",
          value: montoTotalProyecto,
        },
      })
    }
  }, [estadoForma.ministraciones])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const queryCopartes: QueriesCoparte = idCoparte
        ? { id: idCoparte }
        : { id_admin: user.id }

      const promesas = [obtenerFinanciadores(), obtenerCopartes(queryCopartes)]

      if (modalidad === "EDITAR") {
        promesas.push(obtenerProyectos({id: idProyecto, min: false}))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const financiaodresDB = resCombinadas[0].data as FinanciadorMin[]
      const copartesAdminDB = resCombinadas[1].data as CoparteMin[]

      setFinanciadoresDB(financiaodresDB)
      setCopartesDB(copartesAdminDB)

      if (modalidad === "EDITAR") {
        const proyecto = resCombinadas[2].data[0] as Proyecto
        dispatch({
          type: "CARGA_INICIAL",
          payload: proyecto,
        })
      } else {
        dispatch({
          type: "SET_IDS_DEPENDENCIAS",
          payload: {
            id_coparte: copartesAdminDB[0]?.id ?? 0,
            id_financiador: financiaodresDB[0]?.id ?? 0,
          },
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarUsuariosCoparte = async () => {
    const idCoparte = estadoForma.id_coparte
    if (!idCoparte) return

    const reUsCoDB = await obtenerUsuariosCoparte(idCoparte)

    if (reUsCoDB.error) {
      console.log(reUsCoDB.data)
    } else {
      const usuariosCoparte = reUsCoDB.data as CoparteUsuarioMin[]
      setUsuariosCoparteDB(usuariosCoparte)

      if (modalidad === "CREAR") {
        //setear al primer usuario de la lista
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_responsable",
            value: usuariosCoparte[0].id_usuario,
          },
        })
      }
    }
  }

  const registrar = () => {
    return ApiCall.post("/proyectos", estadoForma)
  }

  const editar = () => {
    return ApiCall.put(`/proyectos/${idProyecto}`, estadoForma)
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/proyectos")
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    dispatch({
      type,
      payload: ev.target,
    })
  }

  const agregarMinistracion = (ministracion: MinistracionProyecto) => {
    dispatch({
      type: "AGREGAR_MINISTRACION",
      payload: ministracion,
    })
  }

  const quitarMinistracion = (i_numero: number) => {
    const nuevaLista = estadoForma.ministraciones.filter(
      (min) => min.i_numero != i_numero
    )

    dispatch({
      type: "QUITAR_MINISTRACION",
      payload: nuevaLista,
    })
  }

  const refrescarNotas = async () => {
    const re = await ApiCall.get(`/proyectos/${idProyecto}/notas`)

    if (re.error) {
      console.log(re.data)
    } else {
      const notasDB = re.data as NotaProyecto[]
      dispatch({
        type: "RECARGAR_NOTAS",
        payload: notasDB,
      })
    }
  }

  const mostrarFormaMinistracion = () => {
    setShowFormaMinistracion(true)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push(
          //@ts-ignore
          `/copartes/${estadoForma.id_coparte}/proyectos/${data.idInsertado}`
        )
      } else {
        setModoEditar(false)
      }
    }
  }

  const showBtnNuevaMinistracion =
    modoEditar &&
    !showFormaMinistracion &&
    (estadoForma.i_tipo_financiamiento >= 3 ||
      (estadoForma.i_tipo_financiamiento <= 2 &&
        !(estadoForma.ministraciones.length > 0)))

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/proyectos" />
            {!idProyecto && <h2 className="color1 mb-0">Registrar proyecto</h2>}
          </div>
          {!modoEditar &&
            idProyecto &&
            estadoForma.id_administrador == user.id && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        {modalidad === "EDITAR" && (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Id alterno</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_alt"
              value={estadoForma.id_alt}
              disabled
            />
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Financiador</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_financiador"
            value={estadoForma.id_financiador}
            disabled={Boolean(idProyecto)}
          >
            {financiadoresDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Coparte</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            value={estadoForma.id_coparte}
            name="id_coparte"
            disabled={Boolean(idProyecto) || Boolean(idCoparte)}
          >
            {copartesDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Responsable</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_responsable"
            value={estadoForma.id_responsable}
            disabled={!modoEditar}
          >
            {/* <option value="0" disabled>
              Selecciona usuario
            </option> */}
            {usuariosCoparteDB.map(
              ({ id, id_usuario, nombre, apellido_paterno }) => (
                <option key={id} value={id_usuario}>
                  {nombre} {apellido_paterno}
                </option>
              )
            )}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de financiamiento</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo_financiamiento"
            value={estadoForma.i_tipo_financiamiento}
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
            value={estadoForma.id_tema_social}
            disabled={!modoEditar}
          >
            {temas_sociales.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Monto total</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="f_monto_total"
            value={estadoForma.f_monto_total}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Beneficiados</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_beneficiados"
            value={estadoForma.i_beneficiados}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion Ministraciones */}
        <div className="col-12 mb-3 d-flex justify-content-between">
          <h4 className="color1 mb-0">Ministraciones</h4>
          {showBtnNuevaMinistracion && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={mostrarFormaMinistracion}
            >
              Nueva ministración +
            </button>
          )}
        </div>
        <TablaMinistraciones
          modoEditar={modoEditar}
          ministraciones={estadoForma.ministraciones}
          quitar={quitarMinistracion}
        />
        {showFormaMinistracion && (
          <FormaMinistracion
            agregarMinistracion={agregarMinistracion}
            setShowForma={setShowFormaMinistracion}
          />
        )}
        {modoEditar && (
          <div className="col-12 text-end">
            <button
              className="btn btn-secondary me-2"
              type="button"
              onClick={cancelar}
            >
              Cancelar
            </button>
            <button className="btn btn-secondary" type="submit">
              {idProyecto ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <>
          <Colaboradores
            colaboradores={estadoForma.colaboradores}
            id_responsable={estadoForma.id_responsable}
          />
          <Proveedores
            proveedores={estadoForma.proveedores}
            id_responsable={estadoForma.id_responsable}
          />
          <SolicitudesPresupuesto
            solicitudes={estadoForma.solicitudes_presupuesto}
            id_responsable={estadoForma.id_responsable}
          />
          <Notas notas={estadoForma.notas} refrescarNotas={refrescarNotas} />
        </>
      )}
    </RegistroContenedor>
  )
}

export { FormaProyecto }
