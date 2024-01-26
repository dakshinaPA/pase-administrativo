import { useEffect, useRef, useState, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { Toast, estadoInicialToast } from "./Toast"
import { Usuario } from "@models/usuario.model"
import { useSesion } from "@hooks/useSesion"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "HANDLE_CHANGE_DIRECCION"
  | "HANDLE_CHANGE_ENLACE"
  | "HANDLE_CHANGE_COPARTE"
  | "RECARGAR_NOTAS"
  | "HANDLE_CHANGE_PAIS"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (state: Financiador, action: ActionDispatch): Financiador => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      let clave = payload.clave
      if (clave == "nombre_financiador") clave = "nombre"
      return {
        ...state,
        [clave]: payload.valor,
      }
    case "HANDLE_CHANGE_DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [payload.clave]: payload.valor,
        },
      }
    case "HANDLE_CHANGE_ENLACE":
      return {
        ...state,
        enlace: {
          ...state.enlace,
          [payload.clave]: payload.valor,
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        notas: payload,
      }
    case "HANDLE_CHANGE_PAIS":
      let estado = state.direccion.estado
      let id_estado = 1

      if (payload == 1) {
        estado = ""
      } else {
        id_estado = 0
      }

      return {
        ...state,
        direccion: {
          ...state.direccion,
          id_estado,
          estado,
        },
      }
    default:
      return state
  }
}

const estadoInicialForma: Financiador = {
  id_alt: "",
  nombre: "",
  rfc: "",
  i_tipo: 1,
  actividad: "",
  representante_legal: "",
  rfc_representante_legal: "",
  pagina_web: "",
  dt_constitucion: "",
  enlace: {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
  },
  direccion: {
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    municipio: "",
    cp: "",
    id_estado: 1,
    estado: "",
    id_pais: 1,
  },
  notas: [],
}

const FormaFinanciador = () => {
  const router = useRouter()
  const { data: sesion, status } = useSesion()
  if (status !== "authenticated") return null
  const user = sesion.user as Usuario
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const { estados, paises } = useCatalogos()
  const idFinanciador = router.query.id
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [toastState, setToastState] = useState(estadoInicialToast)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const { error, validarCampos, formRef } = useErrores()
  const [modoEditar, setModoEditar] = useState<boolean>(!idFinanciador)
  const modalidad = idFinanciador ? "EDITAR" : "CREAR"
  const inputNota = useRef(null)

  useEffect(() => {
    if (modalidad === "EDITAR") {
      cargarData()
    }
  }, [])

  useEffect(() => {
    dispatch({
      type: "HANDLE_CHANGE_PAIS",
      payload: estadoForma.direccion.id_pais,
    })
  }, [estadoForma.direccion.id_pais])

  const cargarData = async () => {
    setIsLoading(true)

    const { error, data } = await obtener()

    if (error) {
      console.log(error)
    } else {
      const dataFinanciador = data[0] as Financiador
      dispatch({
        type: "CARGA_INICIAL",
        payload: dataFinanciador,
      })
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/financiadores/${idFinanciador}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/financiadores", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(
      `/financiadores/${idFinanciador}`,
      estadoForma
    )
    return res
  }

  const cancelar = () => {
    idFinanciador ? setModoEditar(false) : router.push("/financiadores")
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    if (error.campo === ev.target.name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type,
      payload: { clave: name, valor: value },
    })
  }

  const validarForma = () => {
    const campos = {
      id_alt: estadoForma.id_alt,
      nombre_financiador: estadoForma.nombre,
      // rfc: estadoForma.rfc,
      actividad: estadoForma.actividad,
      representante_legal: estadoForma.representante_legal,
      rfc_representante_legal: estadoForma.rfc_representante_legal,
      dt_constitucion: estadoForma.dt_constitucion,
      calle: estadoForma.direccion.calle,
      numero_ext: estadoForma.direccion.numero_ext,
      colonia: estadoForma.direccion.colonia,
      municipio: estadoForma.direccion.municipio,
      cp: estadoForma.direccion.cp,
      estado: estadoForma.direccion.estado,
      nombre: estadoForma.enlace.nombre,
      apellido_paterno: estadoForma.enlace.apellido_paterno,
      apellido_materno: estadoForma.enlace.apellido_materno,
      email: estadoForma.enlace.email,
      telefono: estadoForma.enlace.telefono,
    }

    if (estadoForma.direccion.id_pais == 1) {
      delete campos.estado
    }

    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    if (!validarForma()) return
    console.log(estadoForma)

    setIsLoading(true)
    const res = modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (res.error) {
      console.log(res.data)
      setToastState({
        show: true,
        mensaje: res.mensaje,
      })
    } else {
      if (modalidad === "EDITAR") {
        setModoEditar(false)
      } else {
        //@ts-ignore
        router.push(`/financiadores/${res.data.idInsertado}`)
      }
    }
  }

  const agregarNota = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/financiadores/${idFinanciador}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })
    if (cr.error) {
      console.log(cr.data)
    } else {
      //limpiar el input
      setMensajeNota("")

      const re = await ApiCall.get(`/financiadores/${idFinanciador}/notas`)
      if (re.error) {
        console.log(re.data)
      } else {
        const notasDB = re.data as NotaFinanciador[]
        dispatch({
          type: "RECARGAR_NOTAS",
          payload: notasDB,
        })
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
            <BtnBack navLink="/financiadores" />
            {!idFinanciador && (
              <h2 className="color1 mb-0">Registrar financiador</h2>
            )}
          </div>
          {!modoEditar && idFinanciador && user.id_rol == 1 && (
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
            disabled={Boolean(idFinanciador)}
          />
          {error.campo == "id_alt" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="nombre_financiador"
            value={estadoForma.nombre}
            disabled={!modoEditar}
          />
          {error.campo == "nombre_financiador" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc"
            value={estadoForma.rfc}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo"
            value={estadoForma.i_tipo}
            disabled={!modoEditar}
          >
            <option value="1">Aliado</option>
            <option value="2">Independiente</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Objeto social</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="actividad"
            value={estadoForma.actividad}
            disabled={!modoEditar}
          />
          {error.campo == "actividad" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Representante legal</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="representante_legal"
            value={estadoForma.representante_legal}
            disabled={!modoEditar}
          />
          {error.campo == "representante_legal" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC Representante</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc_representante_legal"
            value={estadoForma.rfc_representante_legal}
            placeholder="del representante legal"
            disabled={!modoEditar}
          />
          {error.campo == "rfc_representante_legal" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Página web</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="pagina_web"
            value={estadoForma.pagina_web}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Fecha de constitución</label>
          <input
            className="form-control"
            type="date"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="dt_constitucion"
            value={estadoForma.dt_constitucion}
            disabled={!modoEditar}
          />
          {error.campo == "dt_constitucion" && (
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="cp"
            value={estadoForma.direccion.cp}
            disabled={!modoEditar}
          />
          {error.campo == "cp" && <MensajeError mensaje={error.mensaje} />}
        </div>
        {estadoForma.direccion.id_pais == 1 ? (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
        ) : (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
              name="estado"
              value={estadoForma.direccion.estado}
              disabled={!modoEditar}
            />
            {error.campo == "estado" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">País</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="id_pais"
            value={estadoForma.direccion.id_pais}
            disabled={!modoEditar}
          >
            {paises.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="nombre"
            value={estadoForma.enlace.nombre}
            disabled={!modoEditar}
          />
          {error.campo == "nombre" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Apellido paterno</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="apellido_paterno"
            value={estadoForma.enlace.apellido_paterno}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="apellido_materno"
            value={estadoForma.enlace.apellido_materno}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="email"
            value={estadoForma.enlace.email}
            disabled={!modoEditar}
          />
          {error.campo == "email" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Teléfono</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="telefono"
            value={estadoForma.enlace.telefono}
            disabled={!modoEditar}
          />
          {error.campo == "telefono" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        {modoEditar && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <div className="row my-3">
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
      )}
      <Toast
        estado={toastState}
        cerrar={() =>
          setToastState((prevState) => ({ ...prevState, show: false }))
        }
      />
    </RegistroContenedor>
  )
}

export { FormaFinanciador }
