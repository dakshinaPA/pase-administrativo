import { useEffect, useReducer } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar, LinkAccion } from "./Botones"
import {
  epochAFecha,
  montoALocaleString,
  obtenerProveedores,
  obtenerProyectos,
} from "@assets/utils/common"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { useSesion } from "@hooks/useSesion"
import {
  Banner,
  EstadoInicialBannerProps,
  estadoInicialBanner,
  mensajesBanner,
} from "./Banner"
import { rolesUsuario, tiposProveedor } from "@assets/utils/constantes"

type ActionTypes =
  | "LOADING_ON"
  | "ERROR_API"
  | "SIN_PROYECTOS"
  | "CARGAR_PROYECTOS"
  | "CARGA_INICIAL"
  | "RELOAD"
  | "MODO_EDITAR_ON"
  | "CANCELAR_EDITAR"
  | "HANDLE_CHANGE"
  | "CAMBIO_CLABE"
  | "HANDLE_CHANGE_DIRECCION"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

interface EstadoProps {
  cargaInicial: ProveedorProyecto
  forma: ProveedorProyecto
  proyectosDB: ProyectoMin[]
  isLoading: boolean
  mensajeNota: string
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  modalidad: "CREAR" | "EDITAR"
}

const reducer = (state: EstadoProps, action: ActionDispatch): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "LOADING_ON":
      return {
        ...state,
        isLoading: true,
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
    case "SIN_PROYECTOS":
      return {
        ...state,
        isLoading: false,
        banner: {
          show: true,
          mensaje: mensajesBanner.sinProyectos,
          tipo: "warning",
        },
      }
    case "CARGAR_PROYECTOS":
      return {
        ...state,
        proyectosDB: payload,
        forma: {
          ...state.forma,
          id_proyecto: payload[0].id,
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
    case "RELOAD":
      return {
        ...state,
        forma: payload,
        cargaInicial: payload,
        isLoading: false,
        modoEditar: false,
      }
    case "MODO_EDITAR_ON":
      return {
        ...state,
        modoEditar: true,
      }
    case "CANCELAR_EDITAR":
      return {
        ...state,
        forma: { ...state.cargaInicial },
        modoEditar: false,
      }
    case "HANDLE_CHANGE":
      return {
        ...state,
        forma: {
          ...state.forma,
          [payload.name]: payload.value,
        },
      }
    case "CAMBIO_CLABE":
      return {
        ...state,
        forma: {
          ...state.forma,
          clabe: payload.clabe,
          id_banco: payload.id_banco,
        },
      }
    case "HANDLE_CHANGE_DIRECCION":
      return {
        ...state,
        forma: {
          ...state.forma,
          direccion: {
            ...state.forma.direccion,
            [payload.name]: payload.value,
          },
        },
      }
    default:
      return state
  }
}

const FormaProveedor = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idProyecto = Number(router.query.idP)
  const idProveedor = Number(router.query.idPv)

  const estadoInicialForma: ProveedorProyecto = {
    id_proyecto: 0,
    nombre: "",
    i_tipo: 1,
    clabe: "",
    id_banco: 0,
    telefono: "",
    email: "",
    rfc: "",
    bank: "",
    bank_branch_address: "",
    account_number: "",
    bic_code: "",
    intermediary_bank: "",
    routing_number: "",
    descripcion_servicio: "",
    direccion: {
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      municipio: "",
      cp: "",
      id_estado: 0,
      estado: "",
      pais: "",
    },
    historial_pagos: [],
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    proyectosDB: [],
    isLoading: true,
    mensajeNota: "",
    banner: estadoInicialBanner,
    modoEditar: !idProveedor,
    modalidad: idProveedor ? "EDITAR" : "CREAR",
  }

  const { estados, bancos } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const modalidad = idProveedor ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    try {
      if (modalidad === "CREAR") {
        const reProyectos = await obtenerProyectosDB()
        if (reProyectos.error) throw reProyectos

        const proyectosDB = reProyectos.data as ProyectoMin[]
        if (!proyectosDB.length) {
          dispatch({ type: "SIN_PROYECTOS" })
        } else {
          dispatch({
            type: "CARGAR_PROYECTOS",
            payload: proyectosDB,
          })
        }
      } else {
        const reProveedor = await obtenerProveedores(null, idProveedor)
        if (reProveedor.error) throw reProveedor
        dispatch({
          type: "CARGA_INICIAL",
          payload: reProveedor.data[0],
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

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const registrar = async () => {
    return ApiCall.post("/proveedores", estado.forma)
  }

  const editar = async () => {
    return ApiCall.put(`/proveedores/${idProveedor}`, estado.forma)
  }

  const cancelar = () => {
    if (modalidad === "EDITAR") {
      dispatch({ type: "CANCELAR_EDITAR" })
    } else {
      router.back()
    }
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    let { name, value } = ev.target

    if (name === "rfc_organizacion") name = "rfc"
    if (error.campo === name) {
      let campo = name
      if (campo === "nombre") campo = "proveedor"
      validarCampos({ [campo]: value })
    }

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const handleChangeClabe = (ev: ChangeEvent) => {
    const { value } = ev.target

    if (error.campo === "clabe") {
      validarCampos({ clabe: value })
    }

    const matchBanco = bancos.find((ban) => ban.clave === value.substring(0, 3))
    dispatch({
      type: "CAMBIO_CLABE",
      payload: { clabe: value, id_banco: matchBanco?.id || 0 },
    })
  }

  const validarForma = () => {
    const campos = {
      id_proyecto: estado.forma.id_proyecto,
      proveedor: estado.forma.nombre,
      clabe: estado.forma.clabe,
      id_banco: estado.forma.id_banco,
      rfc: estado.forma.rfc,
      rfc_organizacion: estado.forma.rfc,
      bank: estado.forma.bank,
      bank_branch_address: estado.forma.bank_branch_address,
      account_number: estado.forma.account_number,
      bic_code: estado.forma.bic_code,
      email: estado.forma.email,
      telefono: estado.forma.telefono,
      descripcion_servicio: estado.forma.descripcion_servicio,
      calle: estado.forma.direccion.calle,
      numero_ext: estado.forma.direccion.numero_ext,
      colonia: estado.forma.direccion.colonia,
      municipio: estado.forma.direccion.municipio,
      cp: estado.forma.direccion.cp,
      id_estado: estado.forma.direccion.id_estado,
      pais: estado.forma.direccion.pais,
    }

    if (estado.forma.i_tipo == tiposProveedor.EXTRANJERO) {
      delete campos.clabe
      delete campos.id_banco
      delete campos.rfc
      delete campos.rfc_organizacion
      delete campos.id_estado
    } else {
      delete campos.bank
      delete campos.bank_branch_address
      delete campos.account_number
      delete campos.bic_code
      delete campos.pais

      if (estado.forma.i_tipo == tiposProveedor.FISICA) {
        delete campos.rfc_organizacion
      } else {
        delete campos.rfc
      }
    }

    // console.log(campos)
    return validarCampos(campos)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
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
        router.push(
          //@ts-ignore
          `/proveedores/${data.idInsertado}`
        )
      } else {
        dispatch({
          type: "RELOAD",
          payload: data,
        })
      }
    }
  }

  const showBtnEditar =
    modalidad === "EDITAR" &&
    !estado.modoEditar &&
    (user.id == estado.forma.id_responsable ||
      user.id_rol == rolesUsuario.SUPER_USUARIO)

  const enableSlctItipo =
    modalidad === "CREAR" ||
    (estado.modoEditar && user.id_rol == rolesUsuario.SUPER_USUARIO)

  const totalHistorialPago = estado.forma.historial_pagos.reduce(
    (acum, { f_importe }) => acum + f_importe,
    0
  )

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
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Proveedor</h2>
            )}
          </div>
          {showBtnEditar && (
            <BtnEditar onClick={() => dispatch({ type: "MODO_EDITAR_ON" })} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Proyecto</label>
          {modalidad === "CREAR" ? (
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_proyecto"
              value={estado.forma.id_proyecto}
              disabled={!!idProyecto}
            >
              {estado.proyectosDB.map(({ id, id_alt, nombre }) => (
                <option key={id} value={id}>
                  {nombre} - {id_alt}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-control"
              type="text"
              value={estado.forma.proyecto}
              disabled
            />
          )}
          {error.campo == "id_proyecto" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-lg-8 mb-3">
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
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo"
            value={estado.forma.i_tipo}
            disabled={!enableSlctItipo}
          >
            <option value="1">Persona física</option>
            <option value="2">Persona moral</option>
            <option value="3">Extranjero</option>
          </select>
        </div>
        {estado.forma.i_tipo == tiposProveedor.EXTRANJERO ? (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bank"
                value={estado.forma.bank}
                disabled={!estado.modoEditar}
              />
              {error.campo == "bank" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Dirección del banco destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bank_branch_address"
                value={estado.forma.bank_branch_address}
                disabled={!estado.modoEditar}
              />
              {error.campo == "bank_branch_address" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cuenta de destino</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="account_number"
                value={estado.forma.account_number}
                disabled={!estado.modoEditar}
              />
              {error.campo == "account_number" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Código BIC/SWIFT</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="bic_code"
                value={estado.forma.bic_code}
                disabled={!estado.modoEditar}
              />
              {error.campo == "bic_code" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco Intermediario</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="intermediary_bank"
                value={estado.forma.intermediary_bank}
                disabled={!estado.modoEditar}
              />
              {error.campo == "intermediary_bank" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Número de ruta</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="routing_number"
                value={estado.forma.routing_number}
                disabled={!estado.modoEditar}
              />
              {error.campo == "routing_number" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        ) : (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CLABE</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeClabe}
                name="clabe"
                value={estado.forma.clabe}
                disabled={!estado.modoEditar}
              />
              {error.campo == "clabe" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco</label>
              <select
                className="form-control"
                value={estado.forma.id_banco}
                disabled
              >
                <option value="0" disabled></option>
                {bancos.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
              {error.campo == "id_banco" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">RFC</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name={estado.forma.i_tipo == 1 ? "rfc" : "rfc_organizacion"}
                value={estado.forma.rfc}
                disabled={!estado.modoEditar}
              />
              {error.campo ==
                (estado.forma.i_tipo == tiposProveedor.FISICA
                  ? "rfc"
                  : "rfc_organizacion") && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        )}
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
        <div className="col-12 mb-3">
          <label className="form-label">
            Descripción de la compra o servicio
          </label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="descripcion_servicio"
            value={estado.forma.descripcion_servicio}
            disabled={!estado.modoEditar}
          />
          {error.campo == "descripcion_servicio" && (
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
        {estado.forma.i_tipo == tiposProveedor.EXTRANJERO ? (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Estado</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
                name="estado"
                value={estado.forma.direccion.estado}
                disabled={!estado.modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">País</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
                name="pais"
                value={estado.forma.direccion.pais}
                disabled={!estado.modoEditar}
              />
              {error.campo == "pais" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          </>
        ) : (
          <div className="col-12 col-md-6 col-lg-3 mb-3">
            <label className="form-label">Estado</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE_DIRECCION")}
              name="id_estado"
              value={estado.forma.direccion.id_estado}
              disabled={!estado.modoEditar}
            >
              <option value="0" disabled>
                Selecciona un estado
              </option>
              {estados.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
            {error.campo == "id_estado" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
        )}
        {estado.modoEditar && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <div className="row mb-5">
          <div className="col-12 mb-3">
            <hr className="my-0" />
          </div>
          <div className="col-12 mb-3">
            <h4 className="color1 mb-0">Historial de pagos</h4>
          </div>
          <div
            className="col-12 table-responsive"
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            <table className="table">
              <thead className="table-light">
                <tr className="color1">
                  <th>Tipo de gasto</th>
                  <th>Rubro presupuestal</th>
                  <th>Descripción</th>
                  <th>Fecha de pago</th>
                  <th>Importe</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {estado.forma.historial_pagos.map((hp) => (
                  <tr key={hp.id}>
                    <td>{hp.tipo_gasto}</td>
                    <td>{hp.rubro}</td>
                    <td>{hp.descripcion_gasto}</td>
                    <td>{hp.dt_pago ? epochAFecha(hp.dt_pago) : "-"}</td>
                    <td>{montoALocaleString(hp.f_importe)}</td>
                    <td>
                      <LinkAccion
                        margin={false}
                        icono="bi-eye-fill"
                        ruta={`/solicitudes-presupuesto/${hp.id}`}
                        title="ver solicitud"
                      />
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="fw-bold">
                    Total
                  </td>
                  <td className="fw-bold">
                    {montoALocaleString(totalHistorialPago)}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </RegistroContenedor>
  )
}

export { FormaProveedor }
