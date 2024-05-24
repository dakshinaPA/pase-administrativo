import { useEffect, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Usuario } from "@models/usuario.model"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { obtenerCopartes, obtenerUsuarios } from "@assets/utils/common"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { useSesion } from "@hooks/useSesion"
import { Banner, EstadoInicialBannerProps, estadoInicialBanner } from "./Banner"
import { rolesUsuario } from "@assets/utils/constantes"

interface EstadoProps {
  cargaInicial: Usuario
  forma: Usuario
  copartesDB: CoparteMin[]
  isLoading: boolean
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  modalidad: "CREAR" | "EDITAR"
}

type ActionTypes =
  | "LOADING_ON"
  | "LOADING_OFF"
  | "ERROR_API"
  | "CARGAR_COPARTES"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "HANDLE_CHANGE_COPARTE"
  | "MODO_EDITAR_ON"
  | "CANCELAR_EDITAR"

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
    case "LOADING_OFF":
      return {
        ...state,
        isLoading: false,
        modoEditar: false,
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
    case "CARGAR_COPARTES":
      const copartesDB = payload

      return {
        ...state,
        copartesDB: copartesDB,
        forma: {
          ...state.forma,
          coparte: {
            ...state.forma.coparte,
            id_coparte: copartesDB[0]?.id,
          },
        },
        isLoading: false,
      }
    case "CARGA_INICIAL":
      return {
        ...state,
        forma: payload,
        cargaInicial: payload,
        isLoading: false,
      }
    case "HANDLE_CHANGE":
      return {
        ...state,
        forma: {
          ...state.forma,
          [payload.name]: payload.value,
        },
      }
    case "HANDLE_CHANGE_COPARTE":
      return {
        ...state,
        forma: {
          ...state.forma,
          coparte: {
            ...state.forma.coparte,
            [payload.name]: payload.value,
          },
        },
      }
    case "MODO_EDITAR_ON":
      return {
        ...state,
        modoEditar: true,
      }
    case "CANCELAR_EDITAR":
      return {
        ...state,
        forma: {
          ...state.cargaInicial,
        },
        modoEditar: false,
      }
    default:
      return state
  }
}

const estadoInicialForma: Usuario = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  password: "",
  id_rol: 3,
  coparte: {
    id_coparte: 0,
    cargo: "",
  },
}

const FormaUsuario = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == rolesUsuario.COPARTE) {
    router.push("/")
    return null
  }
  const idCoparte = Number(router.query.idC)
  const idUsuario = Number(router.query.id)

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    copartesDB: [],
    isLoading: true,
    banner: estadoInicialBanner,
    modoEditar: !idUsuario,
    modalidad: idUsuario ? "EDITAR" : "CREAR",
  }

  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const modalidad = idUsuario ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    try {
      if (modalidad === "CREAR") {
        let queries: QueriesCoparte = {}

        if (idCoparte) {
          queries = { id: idCoparte }
        } else if (user.id_rol == rolesUsuario.ADMINISTRADOR) {
          queries = { id_admin: user.id }
        }

        const reCopartes = await obtenerCopartes(queries)
        if (reCopartes.error) throw reCopartes

        const copartes = reCopartes.data as CoparteMin[]

        dispatch({
          type: "CARGAR_COPARTES",
          payload: copartes,
        })
      } else {
        const reUsuario = await obtenerUsuarios({ id: idUsuario })
        if (reUsuario.error) throw reUsuario

        const usuario = reUsuario.data[0] as Usuario
        dispatch({
          type: "CARGA_INICIAL",
          payload: usuario,
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

  const registrar = async () => {
    return ApiCall.post("/usuarios", estado.forma)
  }

  const editar = async () => {
    return ApiCall.put(`/usuarios/${idUsuario}`, estado.forma)
  }

  const cancelar = () => {
    if (modalidad === "EDITAR") {
      dispatch({ type: "CANCELAR_EDITAR" })
    } else {
      router.push("/usuarios")
    }
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    if (error.campo === ev.target.name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: ev.target,
    })
  }

  const validarForma = () => {
    const campos = {
      nombre: estado.forma.nombre,
      apellido_paterno: estado.forma.apellido_paterno,
      apellido_materno: estado.forma.apellido_materno,
      email: estado.forma.email,
      telefono: estado.forma.telefono,
      password: estado.forma.password,
      id_coparte: estado.forma.coparte?.id_coparte,
      cargo: estado.forma.coparte?.cargo,
    }

    if (
      [rolesUsuario.SUPER_USUARIO, rolesUsuario.ADMINISTRADOR].includes(
        Number(estado.forma.id_rol)
      )
    ) {
      delete campos.id_coparte
      delete campos.cargo
    }

    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    if (!validarForma()) return
    console.log(estado.forma)

    dispatch({ type: "LOADING_ON" })
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/usuarios/${data.idInsertado}`)
      } else {
        dispatch({ type: "LOADING_OFF" })
      }
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
            <BtnBack navLink="/usuarios" />
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar usuario</h2>
            )}
          </div>
          {modalidad === "EDITAR" && !estado.modoEditar && (
            <BtnEditar onClick={() => dispatch({ type: "MODO_EDITAR_ON" })} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
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
          {error.campo == "nombre" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido paterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="apellido_paterno"
            value={estado.forma.apellido_paterno}
            disabled={!estado.modoEditar}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="apellido_materno"
            value={estado.forma.apellido_materno}
            disabled={!estado.modoEditar}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="email"
            value={estado.forma.email}
            disabled={!estado.modoEditar}
          />
          {error.campo == "email" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Teléfono</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="telefono"
            value={estado.forma.telefono}
            disabled={!estado.modoEditar}
          />
          {error.campo == "telefono" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="password"
            value={estado.forma.password}
            disabled={!estado.modoEditar}
          />
          {error.campo == "password" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Rol</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_rol"
            value={estado.forma.id_rol}
            disabled={
              Boolean(idUsuario) || Boolean(idCoparte) || user.id_rol == 2
            }
          >
            <option value="1">Super usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div>
        {estado.forma.id_rol == 3 && (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Coparte</label>
              {modalidad === "CREAR" ? (
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE_COPARTE")}
                  name="id_coparte"
                  value={estado.forma.coparte.id_coparte}
                  disabled={Boolean(idUsuario) || Boolean(idCoparte)}
                >
                  {estado.copartesDB.map(({ id, id_alt, nombre_corto }) => (
                    <option key={id} value={id}>
                      {id_alt} - {nombre_corto}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  type="text"
                  value={estado.forma.coparte.coparte}
                  disabled
                />
              )}
              {error.campo == "id_coparte" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cargo</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE_COPARTE")}
                name="cargo"
                value={estado.forma.coparte.cargo}
                disabled={!estado.modoEditar}
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
    </RegistroContenedor>
  )
}

export { FormaUsuario }
