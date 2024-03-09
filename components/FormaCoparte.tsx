import { useEffect, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Coparte, NotaCoparte } from "@models/coparte.model"
import { UsuarioMin } from "@models/usuario.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import {
  BtnAccion,
  BtnCancelar,
  BtnEditar,
  BtnNeutro,
  BtnRegistrar,
  LinkAccion,
} from "./Botones"
import { obtenerCopartes, obtenerUsuarios } from "@assets/utils/common"
import { TooltipInfo } from "./Tooltip"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { useSesion } from "@hooks/useSesion"
import Link from "next/link"
import { Banner, EstadoInicialBannerProps, estadoInicialBanner } from "./Banner"
import { rolesUsuario } from "@assets/utils/constantes"

interface EstadoProps {
  cargaInicial: Coparte
  forma: Coparte
  administradoresDB: UsuarioMin[]
  isLoading: boolean
  mensajeNota: string
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  modalidad: "CREAR" | "EDITAR"
}

type ActionTypes =
  | "LOADING_ON"
  | "MODO_EDITAR_ON"
  | "ERROR_API"
  | "CARGAR_ADMINISTRADORES"
  | "CARGA_INICIAL"
  | "RELOAD"
  | "CANCELAR_EDITAR"
  | "HANDLE_CHANGE"
  | "DIRECCION"
  | "ENLACE"
  | "SET_MENSAJE_NOTA"
  | "RECARGAR_NOTAS"
  | "CAMBIO_ESTATUS_LEGAL"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
      }
    case "MODO_EDITAR_ON":
      return {
        ...state,
        modoEditar: true,
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
    case "CARGAR_ADMINISTRADORES":
      const administradoresDB = payload

      return {
        ...state,
        forma: {
          ...state.forma,
          id_administrador: administradoresDB[0]?.id || 0,
        },
        administradoresDB,
        isLoading: false,
      }
    case "CARGA_INICIAL":
      return {
        ...state,
        forma: payload.coparteDB,
        cargaInicial: payload.coparteDB,
        administradoresDB: payload.administradoresDB,
        isLoading: false,
      }
    case "RELOAD":
      return {
        ...state,
        forma: payload,
        cargaInicial: payload,
        isLoading: false,
        modoEditar: false,
      }
    case "CANCELAR_EDITAR":
      return {
        ...state,
        forma: { ...state.cargaInicial },
        modoEditar: false,
      }
    case "HANDLE_CHANGE":
      let clave = payload[0]
      let valor = payload[1]

      if (clave == "nombre_coparte") clave = "nombre"
      if (clave == "rfc_organizacion") clave = "rfc"

      return {
        ...state,
        forma: {
          ...state.forma,
          [clave]: valor,
        },
      }
    case "DIRECCION":
      return {
        ...state,
        forma: {
          ...state.forma,
          direccion: {
            ...state.forma.direccion,
            [payload[0]]: payload[1],
          },
        },
      }
    case "ENLACE":
      return {
        ...state,
        forma: {
          ...state.forma,
          enlace: {
            ...state.forma.enlace,
            [payload[0]]: payload[1],
          },
        },
      }
    case "SET_MENSAJE_NOTA":
      return {
        ...state,
        mensajeNota: payload,
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        forma: {
          ...state.forma,
          notas: payload,
        },
        mensajeNota: "",
      }
    case "CAMBIO_ESTATUS_LEGAL":
      const i_estatus_legal = payload
      return {
        ...state,
        forma: {
          ...state.forma,
          i_estatus_legal,
          representante_legal: "",
          rfc: "",
        },
      }
    default:
      return { ...state }
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
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == rolesUsuario.COPARTE) {
    router.push("/")
    return null
  }

  const idCoparte = Number(router.query.idC)

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    administradoresDB: [],
    isLoading: true,
    mensajeNota: "",
    banner: estadoInicialBanner,
    modoEditar: !idCoparte,
    modalidad: idCoparte ? "EDITAR" : "CREAR",
  }

  const { estados } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const modalidad = idCoparte ? "EDITAR" : "CREAR"
  const inputNota = useRef(null)
  const TblProyectos = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    try {
      const reUsuarios = await obtenerUsuarios({ id_rol: 2, min: true })
      if (reUsuarios.error) throw reUsuarios

      const administradoresDB = reUsuarios.data

      if (modalidad === "CREAR") {
        dispatch({
          type: "CARGAR_ADMINISTRADORES",
          payload: administradoresDB,
        })
      } else {
        const coparteDB = await obtener()
        dispatch({
          type: "CARGA_INICIAL",
          payload: { coparteDB, administradoresDB },
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

  const obtener = async () => {
    const reCoparte = await obtenerCopartes({ id: idCoparte, min: false })
    if (reCoparte.error) throw reCoparte
    return reCoparte.data[0] as Coparte
  }

  const registrar = async () => {
    const res = await ApiCall.post("/copartes", estado.forma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/copartes/${idCoparte}`, estado.forma)
    return res
  }

  const cancelar = () => {
    if (modalidad === "EDITAR") {
      dispatch({ type: "CANCELAR_EDITAR" })
    } else {
      router.push("/copartes")
    }
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

  const handleChangeEstatusLegal = (ev: ChangeEvent) => {
    const i_estatus = Number(ev.target.value)
    dispatch({
      type: "CAMBIO_ESTATUS_LEGAL",
      payload: i_estatus,
    })
  }

  const setMensajeNota = (ev: ChangeEvent) => {
    dispatch({
      type: "SET_MENSAJE_NOTA",
      payload: ev.target.value,
    })
  }

  const agregarNota = async () => {
    if (estado.mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    try {
      const cr = await ApiCall.post(`/copartes/${idCoparte}/notas`, {
        id_usuario: user.id,
        mensaje: estado.mensajeNota,
      })
      if (cr.error) throw cr

      const re = await ApiCall.get(`/copartes/${idCoparte}/notas`)
      if (re.error) throw re

      const notasDB = re.data as NotaCoparte[]
      dispatch({
        type: "RECARGAR_NOTAS",
        payload: notasDB,
      })
    } catch ({ data, mensaje }) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    }
  }

  const validarForma = () => {
    const campos = {
      id_alt: estado.forma.id_alt,
      nombre_coparte: estado.forma.nombre,
      nombre_corto: estado.forma.nombre_corto,
      representante_legal: estado.forma.representante_legal,
      rfc_organizacion: estado.forma.rfc,
      id_administrador: estado.forma.id_administrador,
      calle: estado.forma.direccion.calle,
      numero_ext: estado.forma.direccion.numero_ext,
      colonia: estado.forma.direccion.colonia,
      municipio: estado.forma.direccion.municipio,
      cp: estado.forma.direccion.cp,
      nombre: estado.forma.enlace?.nombre,
      apellido_paterno: estado.forma.enlace?.apellido_paterno,
      apellido_materno: estado.forma.enlace?.apellido_materno,
      email: estado.forma.enlace?.email,
      telefono: estado.forma.enlace?.telefono,
      password: estado.forma.enlace?.password,
      cargo: estado.forma.enlace?.cargo,
    }

    if (estado.forma.i_estatus_legal == 2) {
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
    console.log(estado.forma)

    dispatch({ type: "LOADING_ON" })

    try {
      const action = modalidad === "EDITAR" ? await editar() : await registrar()
      if (action.error) throw action

      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/copartes/${action.data.idInsertado}`)
      } else {
        const coparteDB = await obtener()
        dispatch({
          type: "RELOAD",
          payload: coparteDB,
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
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/copartes" />
            {!idCoparte && <h2 className="color1 mb-0">Registrar coparte</h2>}
          </div>
          {modalidad === "EDITAR" &&
            !estado.modoEditar &&
            (estado.forma.id_administrador == user.id ||
              user.id_rol == rolesUsuario.SUPER_USUARIO) && (
              <BtnEditar onClick={() => dispatch({ type: "MODO_EDITAR_ON" })} />
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
            value={estado.forma.id_alt}
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
            value={estado.forma.nombre}
            disabled={!estado.modoEditar}
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
            value={estado.forma.nombre_corto}
            disabled={!estado.modoEditar}
          />
          {error.campo == "nombre_corto" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Estatus legal</label>
          <select
            className="form-control"
            onChange={handleChangeEstatusLegal}
            value={estado.forma.i_estatus_legal}
            disabled={!estado.modoEditar}
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
            value={estado.forma.representante_legal}
            disabled={!estado.modoEditar || estado.forma.i_estatus_legal != 1}
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
            value={estado.forma.rfc}
            disabled={!estado.modoEditar || estado.forma.i_estatus_legal != 1}
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
            value={estado.forma.id_administrador}
            disabled={!estado.modoEditar}
          >
            {estado.administradoresDB.map(
              ({ id, nombre, apellido_paterno }) => (
                <option key={id} value={id}>
                  {nombre} {apellido_paterno}
                </option>
              )
            )}
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
            value={estado.forma.direccion.calle}
            disabled={!estado.modoEditar}
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
            value={estado.forma.direccion.numero_ext}
            disabled={!estado.modoEditar}
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
            value={estado.forma.direccion.numero_int}
            disabled={!estado.modoEditar}
          />
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Colonia</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="colonia"
            value={estado.forma.direccion.colonia}
            disabled={!estado.modoEditar}
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
            value={estado.forma.direccion.municipio}
            disabled={!estado.modoEditar}
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
            value={estado.forma.direccion.cp}
            disabled={!estado.modoEditar}
          />
          {error.campo == "cp" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "DIRECCION")}
            name="id_estado"
            value={estado.forma.direccion.id_estado}
            disabled={!estado.modoEditar}
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
                value={estado.forma.enlace.nombre}
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
                value={estado.forma.enlace.apellido_paterno}
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
                value={estado.forma.enlace.apellido_materno}
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
                value={estado.forma.enlace.email}
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
                value={estado.forma.enlace.telefono}
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
                value={estado.forma.enlace.password}
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
                value={estado.forma.enlace.cargo}
              />
              {error.campo == "cargo" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        )}
        {estado.modoEditar && (
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
              {(estado.forma.id_administrador == user.id ||
                user.id_rol == 1) && (
                <Link
                  href={`/copartes/${idCoparte}/usuarios/registro`}
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
                    <th>Cargo</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Enlace</th>
                    <th>Ver</th>
                  </tr>
                </thead>
                <tbody>
                  {estado.forma.usuarios.map(
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
                          <LinkAccion
                            margin={false}
                            icono="bi-eye-fill"
                            ruta={`/usuarios/${id}`}
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
              {estado.forma.id_administrador == user.id ||
                (user.id_rol == 1 && (
                  <Link
                    href={`/copartes/${idCoparte}/proyectos/registro`}
                    className="btn btn-outline-secondary"
                  >
                    Registrar +
                  </Link>
                ))}
            </div>
            <div className="col-12 table-responsive">
              <table className="table" ref={TblProyectos}>
                <thead className="table-light">
                  <tr className="color1">
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
                  {estado.forma.proyectos.map(
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
                          <LinkAccion
                            margin={false}
                            icono="bi-eye-fill"
                            ruta={`/copartes/${idCoparte}/proyectos/${id}`}
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
                  <tr className="color1">
                    <th>Usuario</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {estado.forma.notas.map(
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
                value={estado.mensajeNota}
                onChange={setMensajeNota}
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
