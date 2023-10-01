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
import {
  BtnAccion,
  BtnCancelar,
  BtnEditar,
  BtnNeutro,
  BtnRegistrar,
} from "./Botones"
import { useAuth } from "@contexts/auth.context"
import {
  montoALocaleString,
  obtenerCopartes,
  obtenerUsuarios,
} from "@assets/utils/common"
import { TooltipInfo } from "./Tooltip"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"

type ActionTypes =
  | "CARGAR_DATA"
  | "HANDLE_CHANGE"
  | "DIRECCION"
  | "ENLACE"
  | "RECARGAR_NOTAS"
  | "CAMBIO_ESTATUS_LEGAL"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

const reducer = (state: Coparte, action: ActionDispatch): Coparte => {
  const { type, payload } = action

  switch (type) {
    case "CARGAR_DATA":
      return payload
    case "HANDLE_CHANGE":
      let clave = payload[0]
      let valor = payload[1]

      if (clave == "nombre_coparte") clave = "nombre"
      if (clave == "rfc_organizacion") clave = "rfc"

      return {
        ...state,
        [clave]: valor,
      }
    case "DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [payload[0]]: payload[1],
        },
      }
    case "ENLACE":
      return {
        ...state,
        enlace: {
          ...state.enlace,
          [payload[0]]: payload[1],
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: payload,
      }
    case "CAMBIO_ESTATUS_LEGAL":
      if (state.i_estatus_legal == 2) {
        return {
          ...state,
          representante_legal: "",
          rfc: "",
        }
      }
      return state
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
  id_administrador: 0,
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
  const { error, validarCampos, formRef } = useErrores()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idCoparte)
  const modalidad = idCoparte ? "EDITAR" : "CREAR"
  const inputNota = useRef(null)
  const TblProyectos = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    dispatch({
      type: "CAMBIO_ESTATUS_LEGAL",
    })
  }, [estadoForma.i_estatus_legal])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerUsuarios({ id_rol: 2 })]
      if (modalidad === "EDITAR") {
        promesas.push(obtenerCopartes({ id: Number(idCoparte), min: false }))
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
          payload: dataCoparte,
        })
      } else {
        //setear en el select a primer admin en la lista
        dispatch({
          type: "HANDLE_CHANGE",
          payload: ["id_administrador", adminsDB[0]?.id || 0],
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
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

    if (error.campo === ev.target.name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: [name, value],
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
          payload: notasDB,
        })
      }
    }
  }

  const validarForma = () => {
    const campos = {
      id_alt: estadoForma.id_alt,
      nombre_coparte: estadoForma.nombre,
      nombre_corto: estadoForma.nombre_corto,
      representante_legal: estadoForma.representante_legal,
      rfc_organizacion: estadoForma.rfc,
      id_administrador: estadoForma.id_administrador,
      calle: estadoForma.direccion.calle,
      numero_ext: estadoForma.direccion.numero_ext,
      colonia: estadoForma.direccion.colonia,
      municipio: estadoForma.direccion.municipio,
      cp: estadoForma.direccion.cp,
      nombre: estadoForma.enlace?.nombre,
      apellido_paterno: estadoForma.enlace?.apellido_paterno,
      apellido_materno: estadoForma.enlace?.apellido_materno,
      email: estadoForma.enlace?.email,
      telefono: estadoForma.enlace?.telefono,
      password: estadoForma.enlace?.password,
      cargo: estadoForma.enlace?.cargo,
    }

    if (estadoForma.i_estatus_legal == 2) {
      delete campos.representante_legal
      delete campos.rfc_organizacion
    }

    if (modalidad === "EDITAR") {
      delete campos.nombre
      delete campos.apellido_paterno
      delete campos.apellido_materno
      delete campos.email
      delete campos.telefono
      delete campos.password
      delete campos.cargo
    }

    return validarCampos(campos)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    console.log(estadoForma)

    setIsLoading(true)
    const res = modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (res.error) {
      console.log(res.data)
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/copartes/${res.data.idInsertado}`)
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
            (estadoForma.id_administrador == user.id || user.id_rol == 1) && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">ID alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled={Boolean(idCoparte)}
          />
          {error.campo == "id_alt" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="nombre_coparte"
            value={estadoForma.nombre}
            disabled={!modoEditar}
          />
          {error.campo == "nombre_coparte" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "nombre_corto" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          <label className="form-label me-1">Representante legal</label>
          <TooltipInfo texto="Nombre completo del representante legal" />
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="representante_legal"
            value={estadoForma.representante_legal}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
          {error.campo == "representante_legal" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label me-1">RFC</label>
          <TooltipInfo texto="RFC de la organización" />
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc_organizacion"
            value={estadoForma.rfc}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
          {error.campo == "rfc_organizacion" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Administrador</label>
          <select
            className="form-control"
            name="id_administrador"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            value={estadoForma.id_administrador}
            disabled={!modoEditar}
          >
            {administardoresDB.map(({ id, nombre, apellido_paterno }) => (
              <option key={id} value={id}>
                {nombre} {apellido_paterno}
              </option>
            ))}
          </select>
          {error.campo == "id_administrador" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "calle" && <MensajeError mensaje={error.mensaje} />}
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
          {error.campo == "numero_ext" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "colonia" && <MensajeError mensaje={error.mensaje} />}
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
          {error.campo == "municipio" && (
            <MensajeError mensaje={error.mensaje} />
          )}
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
          {error.campo == "cp" && <MensajeError mensaje={error.mensaje} />}
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
              {error.campo == "nombre" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "apellido_paterno" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "apellido_materno" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "email" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "telefono" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label me-1">Password</label>
              <TooltipInfo texto="Para ingresar a la plataforma" />
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "ENLACE")}
                name="password"
                value={estadoForma.enlace.password}
              />
              {error.campo == "password" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {error.campo == "cargo" && (
                <MensajeError mensaje={error.mensaje} />
              )}
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
              {(estadoForma.id_administrador == user.id ||
                user.id_rol == 1) && (
                <BtnNeutro
                  margin={false}
                  texto="Registrar +"
                  width={false}
                  onclick={() =>
                    router.push(`/copartes/${idCoparte}/usuarios/registro`)
                  }
                />
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
                      nombre,
                      apellido_paterno,
                      apellido_materno,
                      email,
                      telefono,
                      coparte,
                    }) => (
                      <tr key={id}>
                        <td>
                          {nombre} {apellido_paterno} {apellido_materno}
                        </td>
                        <td>{coparte.cargo}</td>
                        <td>{email}</td>
                        <td>{telefono}</td>
                        <td className="icono-enlace">
                          {coparte.b_enlace ? (
                            <i className="bi bi-check"></i>
                          ) : (
                            <i className="bi bi-x"></i>
                          )}
                        </td>
                        <td>
                          <BtnAccion
                            margin={false}
                            icono="bi bi-eye-fill"
                            onclick={() => router.push(`/usuarios/${id}`)}
                            title="ver usuario"
                          />
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
              {estadoForma.id_administrador == user.id && (
                <BtnNeutro
                  margin={false}
                  texto="Registrar +"
                  width={false}
                  onclick={() =>
                    router.push(`/copartes/${idCoparte}/proyectos/registro`)
                  }
                />
              )}
            </div>
            <div className="col-12 table-responsive">
              <table className="table" ref={TblProyectos}>
                <thead className="table-light">
                  <tr>
                    <th>Id Alt</th>
                    <th>Nombre</th>
                    <th>Financiador</th>
                    <th>Responsable</th>
                    <th>Descripción</th>
                    <th>Municipio</th>
                    <th>Beneficiados</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {estadoForma.proyectos.map(
                    ({
                      id,
                      id_alt,
                      nombre,
                      financiador,
                      responsable,
                      descripcion,
                      municipio,
                      i_beneficiados,
                    }) => (
                      <tr key={id}>
                        <td>{id_alt}</td>
                        <td>{nombre}</td>
                        <td>{financiador}</td>
                        <td>{responsable}</td>
                        <td>{descripcion}</td>
                        <td>{municipio}</td>
                        <td>{i_beneficiados}</td>
                        <td>
                          <BtnAccion
                            margin={false}
                            icono="bi bi-eye-fill"
                            onclick={() =>
                              router.push(
                                `/copartes/${idCoparte}/proyectos/${id}`
                              )
                            }
                            title="ver proyecto"
                          />
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
              <BtnNeutro
                margin={false}
                texto="Agregar nota +"
                width={false}
                onclick={agregarNota}
              />
            </div>
          </div>
        </>
      )}
    </RegistroContenedor>
  )
}

export { FormaCoparte }
