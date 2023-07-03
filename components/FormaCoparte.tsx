import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Coparte, NotaCoparte } from "@models/coparte.model"
import { UsuarioMin } from "@models/usuario.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { useAuth } from "@contexts/auth.context"
import { obtenerUsuariosXRol } from "@assets/utils/common"

type ActionTypes =
  | "CARGAR_DATA"
  | "HANDLE_CHANGE"
  | "ADMINISTRADOR"
  | "DIRECCION"
  | "ENLACE"
  | "RECARGAR_NOTAS"

interface ActionDispatch {
  type: ActionTypes
  value: any
}

const reducer = (state: Coparte, action: ActionDispatch): Coparte => {
  const { type, value } = action

  switch (type) {
    case "CARGAR_DATA":
      return value
    case "HANDLE_CHANGE":
      return {
        ...state,
        [value[0]]: value[1],
      }
    case "ADMINISTRADOR":
      return {
        ...state,
        administrador: {
          id: value[1],
        },
      }
    case "DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [value[0]]: value[1],
        },
      }
    case "ENLACE":
      return {
        ...state,
        enlace: {
          ...state.enlace,
          [value[0]]: value[1],
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: value,
      }
    default:
      return state
  }
}

const estadoInicialForma: Coparte = {
  nombre: "",
  nombre_corto: "",
  id_alt: "",
  i_estatus_legal: 1,
  representante_legal: "",
  rfc: "",
  administrador: {
    id: 0,
  },
  direccion: {
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    municipio: "",
    cp: "",
    id_estado: 1,
  },
  enlace: {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    password: "",
    cargo: "",
  },
  usuarios: [],
  proyectos: [],
  notas: [],
}

const FormaCoparte = () => {
  const { user } = useAuth()
  if (!user || user.id_rol == 3) return null
  const { estados } = useCatalogos()
  const router = useRouter()
  const idCoparte = router.query.idC
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [administardoresDB, setAdministardoresDB] = useState<UsuarioMin[]>([])
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idCoparte)
  const modalidad = idCoparte ? "EDITAR" : "CREAR"
  const inputNota = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerUsuariosXRol(2)]
      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const adminsDB = resCombinadas[0].data as UsuarioMin[]
      setAdministardoresDB(adminsDB)

      if (modalidad === "EDITAR") {
        const dataCoparte = resCombinadas[1].data[0] as Coparte
        dispatch({
          type: "CARGAR_DATA",
          value: dataCoparte,
        })
      } else {
        //setear en el select a primer admin en la lista
        dispatch({
          type: "ADMINISTRADOR",
          value: [undefined, adminsDB[0].id],
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/copartes/${idCoparte}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/copartes", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/copartes/${idCoparte}`, estadoForma)
    return res
  }

  const cancelar = () => {
    idCoparte ? setModoEditar(false) : router.push("/copartes")
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    dispatch({
      type,
      value: [name, value],
    })
  }

  const agregarNota = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/copartes/${idCoparte}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })
    if (cr.error) {
      console.log(cr.data)
    } else {
      //limpiar el input
      setMensajeNota("")

      const re = await ApiCall.get(`/copartes/${idCoparte}/notas`)
      if (re.error) {
        console.log(re.data)
      } else {
        const notasDB = re.data as NotaCoparte[]
        dispatch({
          type: "RECARGAR_NOTAS",
          value: notasDB,
        })
      }
    }
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const res = modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (res.error) {
      console.log(res.data)
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/copartes/${res.data.idInsertadoCoparte}`)
      } else {
        setModoEditar(false)
      }
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/copartes" />
            {!idCoparte && <h2 className="color1 mb-0">Registrar coparte</h2>}
          </div>
          {!modoEditar &&
            idCoparte &&
            (estadoForma.administrador.id == user.id || user.id_rol == 1) && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">ID alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="nombre"
            value={estadoForma.nombre}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre corto</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="nombre_corto"
            value={estadoForma.nombre_corto}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Estatus legal</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_estatus_legal"
            value={estadoForma.i_estatus_legal}
            disabled={!modoEditar}
          >
            <option value="1">Constituida</option>
            <option value="2">No constituida</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Representante legal</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="representante_legal"
            value={estadoForma.representante_legal}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc"
            placeholder="de la organización"
            value={estadoForma.rfc}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Administrador</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "ADMINISTRADOR")}
            value={estadoForma.administrador.id}
            disabled={!modoEditar}
          >
            {administardoresDB.map(({ id, nombre, apellido_paterno }) => (
              <option key={id} value={id}>
                {nombre} {apellido_paterno}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12">
          <hr />
        </div>
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Dirección</h4>
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Calle</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="calle"
            value={estadoForma.direccion.calle}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número ext</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="numero_ext"
            value={estadoForma.direccion.numero_ext}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número int</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="numero_int"
            value={estadoForma.direccion.numero_int}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Colonia</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="colonia"
            value={estadoForma.direccion.colonia}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Municipio</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="municipio"
            value={estadoForma.direccion.municipio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">CP</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="cp"
            value={estadoForma.direccion.cp}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="id_estado"
            value={estadoForma.direccion.id_estado}
            disabled={!modoEditar}
          >
            {estados.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        {modalidad === "CREAR" && (
          <>
            <div className="col-12">
              <hr />
            </div>
            <div className="col-12 mb-3">
              <h4 className="color1 mb-0">Enlace</h4>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="nombre"
                value={estadoForma.enlace.nombre}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido paterno</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="apellido_paterno"
                value={estadoForma.enlace.apellido_paterno}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido materno</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="apellido_materno"
                value={estadoForma.enlace.apellido_materno}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="email"
                value={estadoForma.enlace.email}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="telefono"
                value={estadoForma.enlace.telefono}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="password"
                value={estadoForma.enlace.password}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cargo</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="cargo"
                value={estadoForma.enlace.cargo}
              />
            </div>
          </>
        )}
        {modoEditar && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <>
          {/* Seccion usuarios */}
          <div className="row mb-5">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h2 className="color1 mb-0">Usuarios</h2>
              {(estadoForma.administrador.id == user.id ||
                user.id_rol == 1) && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    router.push(`/copartes/${idCoparte}/usuarios/registro`)
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
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Enlace</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoForma.usuarios.map(
                    ({
                      id,
                      id_usuario,
                      nombre,
                      apellido_paterno,
                      apellido_materno,
                      email,
                      telefono,
                      cargo,
                      b_enlace,
                    }) => (
                      <tr key={id}>
                        <td>
                          {nombre} {apellido_paterno} {apellido_materno}
                        </td>
                        <td>{cargo}</td>
                        <td>{email}</td>
                        <td>{telefono}</td>
                        <td>
                          <i
                            className={b_enlace ? "bi bi-check" : "bi bi-x"}
                          ></i>
                        </td>
                        <td>
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() =>
                              router.push(`/usuarios/${id_usuario}`)
                            }
                            disabled={
                              estadoForma.administrador.id != user.id &&
                              user.id_rol != 1
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
          {/* Seccion Proyectos */}
          <div className="row mb-5">
            <div className="col-12 mb-3 d-flex justify-content-between">
              <h2 className="color1 mb-0">Proyectos</h2>
              {estadoForma.administrador.id == user.id && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    router.push(`/copartes/${idCoparte}/proyectos/registro`)
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
                    <th>#Id</th>
                    <th>Alt Id</th>
                    <th>Tipo de financiamiento</th>
                    <th>Financiador</th>
                    <th>Monto total</th>
                    <th># Beneficiados</th>
                    <th>Responsable</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoForma.proyectos.map(
                    ({
                      id,
                      id_alt,
                      tipo_financiamiento,
                      financiador,
                      f_monto_total,
                      i_beneficiados,
                      responsable,
                    }) => (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{id_alt}</td>
                        <td>{tipo_financiamiento}</td>
                        <td>{financiador}</td>
                        <td>{f_monto_total}</td>
                        <td>{i_beneficiados}</td>
                        <td>{responsable}</td>
                        <td>
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() =>
                              router.push(
                                `/copartes/${idCoparte}/proyectos/${id}`
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
          {/* Seccion notas */}
          <div className="row mb-3">
            <div className="col-12 mb-3">
              <h2 className="color1 mb-0">Notas</h2>
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
                  {estadoForma.notas.map(
                    ({ id, usuario, mensaje, dt_registro }) => (
                      <tr key={id}>
                        <td>{usuario}</td>
                        <td>{mensaje}</td>
                        <td>{dt_registro}</td>
                      </tr>
                    )
                  )}
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
              <button className="btn btn-secondary" onClick={agregarNota}>
                Agregar nota +
              </button>
            </div>
          </div>
        </>
      )}
    </RegistroContenedor>
  )
}

export { FormaCoparte }
