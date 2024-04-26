import { useEffect, useRef, useReducer } from "react"
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
import { rolesUsuario } from "@assets/utils/constantes"
import { AjusteProyecto } from "@models/proyecto.model"
import { obtenerDataProyecto } from "@assets/utils/common"

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
  cargaInicial: AjusteProyecto
  forma: AjusteProyecto
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

const FormaAjuste = () => {
  const { user, status } = useSesion()
  const router = useRouter()
  if (
    status !== "authenticated" ||
    !user ||
    user.id_rol == rolesUsuario.COPARTE
  ) {
    router.push("/")
    return null
  }

  const idProyecto = Number(router.query.id)
  const idAjuste = Number(router.query.idA)

  const estadoInicialForma: AjusteProyecto = {
    id: idAjuste,
    id_proyecto: idProyecto,
    proyecto: "",
    id_partida_presupuestal: 0,
    i_tipo: 1,
    titular_cuenta: "",
    clabe: "",
    concepto: "",
    f_total: 0,
    dt_ajuste: "",
    notas: [],
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    isLoading: false,
    mensajeNota: "",
    banner: estadoInicialBanner,
    modoEditar: !idAjuste,
    modalidad: idAjuste ? "EDITAR" : "CREAR",
  }

  // const { estados, paises } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const inputNota = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    try {
      const reProyecto = await obtenerDataProyecto(idProyecto)
      if (reProyecto.error) throw reProyecto
      
      if (estado.modalidad === "EDITAR") {
        const reAjuste = await obtener()
        if (reAjuste.error) throw reAjuste
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
    return ApiCall.get(`/ajustes/${idAjuste}`)
  }

  const registrar = () => {
    return ApiCall.post(`/proyectos/${idProyecto}/ajustes`, estado.forma)
  }

  const editar = () => {
    return ApiCall.put(`/ajustes/${idAjuste}`, estado.forma)
  }

  const cancelar = () => {
    if (estado.modalidad === "EDITAR") {
      dispatch({
        type: "CANCELAR_EDITAR",
      })
    } else {
      router.push(`/proyectos/${idProyecto}`)
    }
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    if (error.campo === ev.target.name) {
      validarCampos({ [name]: value })
    }

    dispatch({
      type: "HANDLE_CHANGE",
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
    dispatch({ type: "MODO_EDITAR_ON" })
  }

  const validarForma = () => {
    const campos = {
      id_partida_presupuestal: estado.forma.id_partida_presupuestal,
      titular_cuenta: estado.forma.titular_cuenta,
      clabe: estado.forma.clabe,
      concepto: estado.forma.concepto,
      f_total: estado.forma.f_total,
      dt_ajuste: estado.forma.dt_ajuste,
    }

    // if (estado.forma.direccion.id_pais == 1) {
    //   delete campos.estado
    // }

    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    // if (!validarForma()) return
    console.log(estado.forma)

    dispatch({ type: "LOADING_ON" })

    const { error, data, mensaje } =
      estado.modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
      dispatch({
        type: "ERROR_API",
        payload: mensaje,
      })
    } else {
      // if (estado.modalidad === "EDITAR") {
      //   dispatch({ type: "EDITAR_SUCCESS" })
      // } else {
      //   //@ts-ignore
      //   router.push(`/financiadores/${data.idInsertado}`)
      // }
    }
  }

  const agregarNota = async () => {
    if (estado.mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/ajustes/${idAjuste}/notas`, {
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
      const re = await ApiCall.get(`/ajustes/${idAjuste}/notas`)
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
            {!idAjuste && (
              <h2 className="color1 mb-0">
                Registrar ajuste de saldo de proyecto
              </h2>
            )}
          </div>
          {!estado.modoEditar && idAjuste && (
            <BtnEditar onClick={modoEditarOn} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Proyecto</label>
          <input
            className="form-control"
            type="text"
            value={estado.forma.proyecto}
            disabled
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Partida presupuestal</label>
          <select
            className="form-control"
            name="id_partida_presupuestal"
            value={estado.forma.id_partida_presupuestal}
            onChange={(e) => handleChange(e)}
            // disabled={true}
          >
            {[].map((rubro) => (
              <option key={rubro.id} value={rubro.id}>
                {rubro.nombre}
              </option>
            ))}
          </select>
          {error.campo == "id_partida_presupuestal" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            name="i_tipo"
            value={estado.forma.id_partida_presupuestal}
            onChange={(e) => handleChange(e)}
            // disabled={true}
          >
            <option value="1">Reintegro</option>
            <option value="2">Acreedores</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Titular de la cuenta</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e)}
            name="titular_cuenta"
            value={estado.forma.titular_cuenta}
            disabled={!estado.modoEditar}
          />
          {error.campo == "titular_cuenta" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">CLABE</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e)}
            name="clabe"
            value={estado.forma.clabe}
            disabled={!estado.modoEditar}
          />
          {error.campo == "clabe" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Concepto</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e)}
            name="concepto"
            value={estado.forma.concepto}
            disabled={!estado.modoEditar}
          />
          {error.campo == "concepto" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Monto</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e)}
            name="f_total"
            value={estado.forma.f_total}
            disabled={!estado.modoEditar}
          />
          {error.campo == "f_total" && <MensajeError mensaje={error.mensaje} />}
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

export { FormaAjuste }
