import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  MinistracionProyecto,
  Proyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import { CoparteMin, CoparteUsuarioMin } from "@models/coparte.model"
import { useCatalogos } from "@contexts/catalogos.context"
import {
  inputDateAformato,
  obtenerCopartes,
  obtenerCopartesAdmin,
  obtenerFinanciadores,
  obtenerUsuariosCoparte,
} from "@assets/utils/common"
import { BtnEditar } from "./Botones"
import { RubrosPresupuestalesDB } from "@api/models/catalogos.model"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "QUITAR_MINISTRACION"
  | "AGREGAR_MINISTRACION"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (state: Proyecto, action: ActionDispatch): Proyecto => {
  const { type, payload } = action

  switch (type) {
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
    default:
      return state
  }
}

const FormaProyecto = () => {
  const { user } = useAuth()
  if (!user) return null

  const { rubros_presupuestales, temas_sociales } = useCatalogos()
  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idProyecto = Number(router.query.idP)

  const estadoInicialForma: Proyecto = {
    id_coparte: idCoparte || 0,
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
  }

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

  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [formaMinistracion, setFormaMinistracion] = useState(
    estaInicialdFormaMinistracion
  )
  const [formaRubros, setFormaRubros] = useState(estadoInicialdFormaRubros)
  const [financiadoresDB, setFinanciadoresDB] = useState<FinanciadorMin[]>([])
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosCoparteDB, setUsuariosCoparteDB] = useState<
    CoparteUsuarioMin[]
  >([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"
  
  const selectRubro = useRef(null)
  const inputMontoRubro = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarUsuariosCoparte()
  }, [estadoForma.id_coparte])

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

  // useEffect(() => {
  //   setFormaMinistracion({
  //     ...estaInicialdFormaMinistracion,
  //     i_numero: estadoForma.ministraciones.length + 1,
  //   })
  // }, [estadoForma.ministraciones.length])

  useEffect(() => {
    // switch (Number(estadoForma.i_tipo_financiamiento)) {
    //   case 1:
    //   case 2:
    //     setFormaMinistracion({
    //       ...formaMinistracion,
    //       i_numero: 1,
    //       f_monto: estadoForma.f_monto_total,
    //     })
    //     break
    //   case 3:
    //   case 4:
    //     setFormaMinistracion(estaInicialdFormaMinistracion)
    //     break
    //   default:
    //     setFormaMinistracion(estaInicialdFormaMinistracion)
    // }
    //limpiar lista ministraciones si hay un cambio de tipo financiamiento
    // if (modalidad === "CREAR") {
    //   setEstadoForma({
    //     ...estadoForma,
    //     ministraciones: [],
    //   })
    // }
  }, [estadoForma.i_tipo_financiamiento])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const reCopartes = idCoparte
        ? obtenerCopartes(idCoparte)
        : obtenerCopartesAdmin(user.id)

      const promesas = [obtenerFinanciadores(), reCopartes]

      if (modalidad === "EDITAR") {
        promesas.push(obtener())
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
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_coparte",
            value: copartesAdminDB[0].id,
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
    if (!idCoparte || modalidad === "EDITAR") return

    const reUsCoDB = await obtenerUsuariosCoparte(idCoparte)

    if (reUsCoDB.error) {
      console.log(reUsCoDB.data)
    } else {
      const usuariosCoparte = reUsCoDB.data as CoparteUsuarioMin[]
      setUsuariosCoparteDB(usuariosCoparte)
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

  const obtener = async () => {
    const res = await ApiCall.get(`/proyectos/${idProyecto}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/proyectos", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/proyectos/${idProyecto}`, estadoForma)
    return res
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

    if(formaRubros.id_rubro == 0){
      selectRubro.current.focus()
      return
    }

    if(!formaRubros.f_monto){
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
    // const nuevaLista = estadoForma.rubros.filter(
    //   (rubro) => rubro.id_rubro != id_rubro
    // )
    // setEstadoForma({
    //   ...estadoForma,
    //   rubros: nuevaLista,
    // })
  }

  const handleChangeMinistracion = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setFormaMinistracion({
      ...formaMinistracion,
      [name]: value,
    })
  }

  const agregarMinistracion = () => {
    // setEstadoForma({
    //   ...estadoForma,
    //   ministraciones: [
    //     ...estadoForma.ministraciones,
    //     {
    //       ...formaMinistracion,
    //       f_monto:
    //         estadoForma.i_tipo_financiamiento <= 2
    //           ? estadoForma.f_monto_total
    //           : formaMinistracion.f_monto,
    //     },
    //   ],
    // })
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

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    console.log(estadoForma)
    return

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

  const rubrosNoSeleccionados = () => {
    const rubros: RubrosPresupuestalesDB[] = []
    const idsRubrosForma = formaMinistracion.rubros_presupuestales.map(({ id_rubro }) =>
      Number(id_rubro)
    )

    for (const rp of rubros_presupuestales) {
      if (!idsRubrosForma.includes(rp.id)) {
        rubros.push(rp)
      }
    }

    return rubros
  }

  const montoTotalProyecto = estadoForma.ministraciones.reduce(
    (acum, el) => acum + Number(el.f_monto),
    0
  )

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
          {!modoEditar && idProyecto && user.id_rol == 2 && (
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
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Ministraciones</h4>
        </div>
        {modoEditar && (
          <div className="col-12">
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
                    </tr>
                  </thead>
                  <tbody>
                    {formaMinistracion.rubros_presupuestales.map(
                      ({ id_rubro, nombre, f_monto }) => (
                        <tr key={id_rubro}>
                          <td>{nombre}</td>
                          <td>{f_monto}</td>
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
                    <option value="0" disabled>Selecciona rubro</option>
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
                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={agregarRubro}
                  >
                    Agregar rubro +
                  </button>
                </div>
              </div>
            </div>
            {/* <div className="text-end">
              <button
                className="btn btn-secondary"
                type="button"
                onClick={agregarMinistracion}
                disabled={
                  estadoForma.i_tipo_financiamiento <= 2 &&
                  estadoForma.ministraciones.length > 0
                }
              >
                Agregar +
              </button>
            </div> */}
          </div>
        )}
        <div className="col-12 col-md table-responsive mb-3">
          <label className="form-label">
            Ministraciones{" "}
            {modalidad === "CREAR" ? "a registrar" : "registradas"}
          </label>
          <table className="table">
            <thead className="table-light">
              <tr>
                <th>Número</th>
                <th>Monto</th>
                <th>Grupo</th>
                <th>Fecha de recepción</th>
                <th>Rubros</th>
                {modoEditar && (
                  <th>
                    <i className="bi bi-trash"></i>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {estadoForma.ministraciones.map(
                ({ id, i_numero, f_monto, i_grupo, dt_recepcion }) => (
                  <tr key={i_numero}>
                    <td>{i_numero}</td>
                    <td>{f_monto}</td>
                    <td>{i_grupo}</td>
                    <td>{inputDateAformato(dt_recepcion)}</td>
                    {modoEditar && (
                      <td>
                        {!id && (
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() => quitarMinistracion(i_numero)}
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
          {/* Seccion Colaboradores */}
          <div className="row mb-5">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h3 className="color1 mb-0">Colaboradores</h3>
              {user.id_rol == 3 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    router.push(
                      `/proyectos/${idProyecto}/colaboradores/registro`
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
                  {estadoForma.colaboradores.map(
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
          {/* Seccion Proveedores */}
          <div className="row mb-5">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h3 className="color1 mb-0">Proveedores</h3>
              {user.id_rol == 3 && (
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
                  {estadoForma.proveedores.map(
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
          {/* Seccion solicitudes */}
          <div className="row mb-3">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h3 className="color1 mb-0">Solicitudes de presupuesto</h3>
              {user.id_rol == 3 && (
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
                  {estadoForma.solicitudes_presupuesto.map(
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
        </>
      )}
    </RegistroContenedor>
  )
}

export { FormaProyecto }
