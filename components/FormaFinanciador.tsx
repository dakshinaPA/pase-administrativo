import { useEffect, useRef, useState, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Financiador, NotaFinanciador } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { useSesion } from "@hooks/useSesion"
import { Banner, EstadoInicialBannerProps, estadoInicialBanner } from "./Banner"

type ActionTypes =
  | "ERROR_API"
  | "CARGA_INICIAL"
  | "CANCELAR_EDITAR"
  | "HANDLE_CHANGE"
  | "HANDLE_CHANGE_DIRECCION"
  | "HANDLE_CHANGE_ENLACE"
  | "HANDLE_CHANGE_PAIS"
  | "HANDLE_CHANGE_NOTA"
  | "RECARGAR_NOTAS"
  | "MODO_EDITAR_ON"
  | "LOADING_ON"
  | "EDITAR_SUCCESS"

interface ActionProps {
  type: ActionTypes
  payload?: any
}

interface EstadoProps {
  cargaInicial: Financiador
  forma: Financiador
  isLoading: boolean
  mensajeNota: string
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  modalidad: "CREAR" | "EDITAR"
}

const reducer = (state: EstadoProps, action: ActionProps): EstadoProps => {
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
    case "CARGA_INICIAL":
      return {
        ...state,
        isLoading: false,
        cargaInicial: payload,
        forma: payload,
      }
    case "CANCELAR_EDITAR":
      return {
        ...state,
        modoEditar: false,
        forma: {
          ...state.cargaInicial,
        },
      }
    case "HANDLE_CHANGE":
      let clave = payload.clave
      if (clave == "nombre_financiador") clave = "nombre"
      return {
        ...state,
        forma: {
          ...state.forma,
          [clave]: payload.valor,
        },
      }
    case "HANDLE_CHANGE_DIRECCION":
      return {
        ...state,
        forma: {
          ...state.forma,
          direccion: {
            ...state.forma.direccion,
            [payload.clave]: payload.valor,
          },
        },
      }
    case "HANDLE_CHANGE_ENLACE":
      return {
        ...state,
        forma: {
          ...state.forma,
          enlace: {
            ...state.forma.enlace,
            [payload.clave]: payload.valor,
          },
        },
      }
    case "HANDLE_CHANGE_NOTA":
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
    case "HANDLE_CHANGE_PAIS":
      let estado = state.forma.direccion.estado
      let id_estado = 1

      if (payload == 1) {
        estado = ""
      } else {
        id_estado = 0
      }

      return {
        ...state,
        forma: {
          ...state.forma,
          direccion: {
            ...state.forma.direccion,
            id_estado,
            estado,
          },
        },
      }
    case "MODO_EDITAR_ON":
      return {
        ...state,
        modoEditar: true,
      }
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
      }
    case "EDITAR_SUCCESS":
      return {
        ...state,
        isLoading: false,
        modoEditar: false,
      }
    default:
      return state
  }
}

const FormaFinanciador = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const idFinanciador = Number(router.query.id)

  const estadoInicialForma: Financiador = {
    id: idFinanciador,
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

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    isLoading: !!idFinanciador,
    mensajeNota: "",
    banner: estadoInicialBanner,
    modoEditar: !idFinanciador,
    modalidad: idFinanciador ? "EDITAR" : "CREAR",
  }

  const { estados, paises } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const inputNota = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    dispatch({
      type: "HANDLE_CHANGE_PAIS",
      payload: estado.forma.direccion.id_pais,
    })
  }, [estado.forma.direccion.id_pais])

  const cargarData = async () => {
    if (estado.modalidad === "CREAR") return

    const { error, data, mensaje } = await obtener()

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      const dataFinanciador = data[0] as Financiador
      dispatch({
        type: "CARGA_INICIAL",
        payload: dataFinanciador,
      })
    }
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/financiadores/${idFinanciador}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/financiadores", estado.forma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(
      `/financiadores/${idFinanciador}`,
      estado.forma
    )
    return res
  }

  const cancelar = () => {
    if (estado.modalidad === "EDITAR") {
      dispatch({
        type: "CANCELAR_EDITAR",
      })
    } else {
      router.push("/financiadores")
    }
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

  const handleChangeNota = (ev: ChangeEvent) => {
    dispatch({
      type: "HANDLE_CHANGE_NOTA",
      payload: ev.target.value,
    })
  }

  const modoEditarOn = () => {
    dispatch({
      type: "MODO_EDITAR_ON",
    })
  }

  const validarForma = () => {
    const campos = {
      id_alt: estado.forma.id_alt,
      nombre_financiador: estado.forma.nombre,
      // rfc: estado.forma.rfc,
      actividad: estado.forma.actividad,
      representante_legal: estado.forma.representante_legal,
      rfc_representante_legal: estado.forma.rfc_representante_legal,
      dt_constitucion: estado.forma.dt_constitucion,
      calle: estado.forma.direccion.calle,
      numero_ext: estado.forma.direccion.numero_ext,
      colonia: estado.forma.direccion.colonia,
      municipio: estado.forma.direccion.municipio,
      cp: estado.forma.direccion.cp,
      estado: estado.forma.direccion.estado,
      nombre: estado.forma.enlace.nombre,
      apellido_paterno: estado.forma.enlace.apellido_paterno,
      apellido_materno: estado.forma.enlace.apellido_materno,
      email: estado.forma.enlace.email,
      telefono: estado.forma.enlace.telefono,
    }

    if (estado.forma.direccion.id_pais == 1) {
      delete campos.estado
    }

    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    if (!validarForma()) return
    console.log(estado.forma)

    dispatch({
      type: "LOADING_ON",
    })

    const { error, data, mensaje } =
      estado.modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      if (estado.modalidad === "EDITAR") {
        dispatch({
          type: "EDITAR_SUCCESS",
        })
      } else {
        //@ts-ignore
        router.push(`/financiadores/${data.idInsertado}`)
      }
    }
  }

  const agregarNota = async () => {
    if (estado.mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/financiadores/${idFinanciador}/notas`, {
      id_usuario: user.id,
      mensaje: estado.mensajeNota,
    })
    if (cr.error) {
      console.log(cr.data)
      dispatch({
        type: "ERROR_API",
        payload: cr.mensaje,
      })
    } else {
      const re = await ApiCall.get(`/financiadores/${idFinanciador}/notas`)
      if (re.error) {
        console.log(re.data)
        dispatch({
          type: "ERROR_API",
          payload: re.mensaje,
        })
      } else {
        const notasDB = re.data as NotaFinanciador[]
        dispatch({
          type: "RECARGAR_NOTAS",
          payload: notasDB,
        })
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
            <BtnBack navLink="/financiadores" />
            {!idFinanciador && (
              <h2 className="color1 mb-0">Registrar financiador</h2>
            )}
          </div>
          {!estado.modoEditar && idFinanciador && user.id_rol == 1 && (
            <BtnEditar onClick={modoEditarOn} />
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
            value={estado.forma.nombre}
            disabled={!estado.modoEditar}
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
            value={estado.forma.rfc}
            disabled={!estado.modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo"
            value={estado.forma.i_tipo}
            disabled={!estado.modoEditar}
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
            value={estado.forma.actividad}
            disabled={!estado.modoEditar}
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
            value={estado.forma.representante_legal}
            disabled={!estado.modoEditar}
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
            value={estado.forma.rfc_representante_legal}
            placeholder="del representante legal"
            disabled={!estado.modoEditar}
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
            value={estado.forma.pagina_web}
            disabled={!estado.modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Fecha de constitución</label>
          <input
            className="form-control"
            type="date"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="dt_constitucion"
            value={estado.forma.dt_constitucion}
            disabled={!estado.modoEditar}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
            name="cp"
            value={estado.forma.direccion.cp}
            disabled={!estado.modoEditar}
          />
          {error.campo == "cp" && <MensajeError mensaje={error.mensaje} />}
        </div>
        {estado.forma.direccion.id_pais == 1 ? (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
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
        ) : (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
              name="estado"
              value={estado.forma.direccion.estado}
              disabled={!estado.modoEditar}
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
            value={estado.forma.direccion.id_pais}
            disabled={!estado.modoEditar}
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
            value={estado.forma.enlace.nombre}
            disabled={!estado.modoEditar}
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
            value={estado.forma.enlace.apellido_paterno}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="apellido_materno"
            value={estado.forma.enlace.apellido_materno}
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
            onChange={(e) => handleChange(e, "HANDLE_CHANGE_ENLACE")}
            name="email"
            value={estado.forma.enlace.email}
            disabled={!estado.modoEditar}
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
            value={estado.forma.enlace.telefono}
            disabled={!estado.modoEditar}
          />
          {error.campo == "telefono" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        {estado.modoEditar && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={estado.modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
      {estado.modalidad === "EDITAR" && (
        <div className="row my-3">
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
              onChange={handleChangeNota}
              placeholder="mensaje de la nota"
              ref={inputNota}
            ></input>
          </div>
          <div className="col-12 col-md-3 mb-3 text-end">
            <button className="btn btn-secondary" onClick={agregarNota}>
              Agregar nota +
            </button>
          </div>
        </div>
      )}
    </RegistroContenedor>
  )
}

export { FormaFinanciador }
