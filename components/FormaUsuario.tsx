import { useEffect, useState, useReducer } from "react"
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
import { Banner, estadoInicialBanner } from "./Banner"

type ActionTypes = "CARGA_INICIAL" | "HANDLE_CHANGE" | "HANDLE_CHANGE_COPARTE"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (state: Usuario, action: ActionDispatch): Usuario => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "HANDLE_CHANGE_COPARTE":
      return {
        ...state,
        coparte: {
          ...state.coparte,
          [payload.name]: payload.value,
        },
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
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }
  const idCoparte = Number(router.query.idC)
  const idUsuario = Number(router.query.id)
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const { error, validarCampos, formRef } = useErrores()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)
  const [modoEditar, setModoEditar] = useState<boolean>(!idUsuario)
  const modalidad = idUsuario ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      if (modalidad === "CREAR") {
        let queries: QueriesCoparte = {}

        if (idCoparte) {
          queries = { id: idCoparte }
        } else if (user.id_rol == 2) {
          queries = { id_admin: user.id }
        }

        const reCopartes = await obtenerCopartes(queries)
        if (reCopartes.error) throw reCopartes

        const copartes = reCopartes.data as CoparteMin[]
        setCopartesDB(copartes)
        dispatch({
          type: "HANDLE_CHANGE_COPARTE",
          payload: {
            name: "id_coparte",
            value: copartes[0]?.id || 0,
          },
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
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const registrar = async () => {
    return ApiCall.post("/usuarios", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/usuarios/${idUsuario}`, estadoForma)
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/usuarios")
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
      nombre: estadoForma.nombre,
      apellido_paterno: estadoForma.apellido_paterno,
      apellido_materno: estadoForma.apellido_materno,
      email: estadoForma.email,
      telefono: estadoForma.telefono,
      password: estadoForma.password,
      id_coparte: estadoForma.coparte?.id_coparte,
      cargo: estadoForma.coparte?.cargo,
    }

    if ([1, 2].includes(Number(estadoForma.id_rol))) {
      delete campos.id_coparte
      delete campos.cargo
    }

    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    if (!validarForma()) return
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/usuarios/${data.idInsertado}`)
      } else {
        setModoEditar(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (showBanner.show) {
    return (
      <Contenedor>
        <Banner tipo={showBanner.tipo} mensaje={showBanner.mensaje} />
      </Contenedor>
    )
  }
  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/usuarios" />
            {!idUsuario && <h2 className="color1 mb-0">Registrar usuario</h2>}
          </div>
          {!modoEditar && idUsuario && (
            <BtnEditar onClick={() => setModoEditar(true)} />
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
            value={estadoForma.nombre}
            disabled={!modoEditar}
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
            value={estadoForma.apellido_paterno}
            disabled={!modoEditar}
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
            value={estadoForma.apellido_materno}
            disabled={!modoEditar}
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
            value={estadoForma.email}
            disabled={!modoEditar}
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
            value={estadoForma.telefono}
            disabled={!modoEditar}
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
            value={estadoForma.password}
            disabled={!modoEditar}
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
            value={estadoForma.id_rol}
            disabled={
              Boolean(idUsuario) || Boolean(idCoparte) || user.id_rol == 2
            }
          >
            <option value="1">Super usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div>
        {estadoForma.id_rol == 3 && (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Coparte</label>
              {modalidad === "CREAR" ? (
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE_COPARTE")}
                  name="id_coparte"
                  value={estadoForma.coparte.id_coparte}
                  disabled={Boolean(idUsuario) || Boolean(idCoparte)}
                >
                  {copartesDB.map(({ id, nombre }) => (
                    <option key={id} value={id}>
                      {nombre}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-control"
                  type="text"
                  value={estadoForma.coparte.coparte}
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
                value={estadoForma.coparte.cargo}
                disabled={!modoEditar}
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
    </RegistroContenedor>
  )
}

export { FormaUsuario }
