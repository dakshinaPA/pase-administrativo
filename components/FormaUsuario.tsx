import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Usuario } from "@models/usuario.model"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { Validaciones, obtenerCopartes } from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"

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

const estaInicialErrores = {
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  email: "",
  telefono: "",
  password: "",
  cargo: "",
  id_coparte: "",
}

const FormaUsuario = () => {
  const { user } = useAuth()
  if (!user || user.id_rol == 3) return null
  const router = useRouter()
  const idCoparte = Number(router.query.idC)
  const idUsuario = Number(router.query.id)
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [errores, setErrores] = useState(estaInicialErrores)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idUsuario)
  const modalidad = idUsuario ? "EDITAR" : "CREAR"
  const formRef = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      let reCopartes: Promise<ApiCallRes>

      if (idCoparte) {
        reCopartes = obtenerCopartes({ id: idCoparte })
      } else {
        const queryCopartes: QueriesCoparte =
          user.id_rol == 2 ? { id_admin: user.id } : {}

        reCopartes = obtenerCopartes(queryCopartes)
      }

      const promesas = [reCopartes]

      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const copartesDB = resCombinadas[0].data as CoparteMin[]
      setCopartesDB(copartesDB)

      if (modalidad === "EDITAR") {
        dispatch({
          type: "CARGA_INICIAL",
          payload: resCombinadas[1].data[0] as Usuario,
        })
      } else {
        dispatch({
          type: "HANDLE_CHANGE_COPARTE",
          payload: {
            name: "id_coparte",
            value: copartesDB[0]?.id || 0,
          },
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    return ApiCall.get(`/usuarios/${idUsuario}`)
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
    dispatch({
      type,
      payload: ev.target,
    })
  }

  const validarCampos = () => {
    try {
      const camposForma = Object.entries(estadoForma).filter(
        (campo, index) => index <= 5
      )

      for (const cf of camposForma) {
        const [campo, valor] = cf
        const validacion = Validaciones.metodos[campo](valor)
        if (!validacion.pasa) throw [campo, validacion.mensaje]
      }

      if (estadoForma.coparte.id_coparte == 0)
        throw ["id_coparte", "Selecciona una coparte"]

      const cargo = Validaciones.texto(estadoForma.coparte.cargo)
      if (!cargo.pasa) throw ["cargo", cargo.mensaje]

      setErrores(estaInicialErrores)
      return true
    } catch (error) {
      const [campo, mensaje] = error
      formRef.current
        .querySelector(`input[name=${campo}], select[name=${campo}]`)
        .focus()
      setErrores({ ...estaInicialErrores, [campo]: mensaje })
      return false
    }
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    if (!validarCampos()) return
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
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
    return <Loader />
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
          {errores.nombre && (
            <small className="mensaje_error">{errores.nombre}</small>
          )}
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
          {errores.apellido_paterno && (
            <small className="mensaje_error">{errores.apellido_paterno}</small>
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
          {errores.apellido_materno && (
            <small className="mensaje_error">{errores.apellido_materno}</small>
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
          {errores.email && (
            <small className="mensaje_error">{errores.email}</small>
          )}
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
          {errores.telefono && (
            <small className="mensaje_error">{errores.telefono}</small>
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
          {errores.password && (
            <small className="mensaje_error">{errores.password}</small>
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
              {errores.id_coparte && (
                <small className="mensaje_error">{errores.id_coparte}</small>
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
              {errores.cargo && (
                <small className="mensaje_error">{errores.cargo}</small>
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
