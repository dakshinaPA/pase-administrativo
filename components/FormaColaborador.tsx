import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ColaboradorProyecto,
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
import {
  BtnAccion,
  BtnCancelar,
  BtnEditar,
  BtnNeutro,
  BtnRegistrar,
  LinkAccion,
} from "./Botones"
import {
  epochAFecha,
  fechaMasDiasFutuosString,
  fechaMasMesesFutuosString,
  inputDateAformato,
  montoALocaleString,
  obtenerColaboradores,
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
import { rolesUsuario, tiposColaborador } from "@assets/utils/constantes"

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
  | "HANDLE_CHANGE_PERIODO"
  | "AGREGAR_PERIODO"
  | "QUITAR_PERIODO"

interface ActionDispatch {
  type: ActionTypes
  payload?: any
}

interface EstadoProps {
  cargaInicial: ColaboradorProyecto
  forma: ColaboradorProyecto
  proyectosDB: ProyectoMin[]
  isLoading: boolean
  mensajeNota: string
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  modalidad: "CREAR" | "EDITAR"
}

const estadoInicialForma: ColaboradorProyecto = {
  id_proyecto: 0,
  i_tipo: 1,
  id_empleado: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  clabe: "",
  id_banco: 0,
  telefono: "",
  email: "",
  rfc: "",
  curp: "",
  direccion: {
    calle: "",
    numero_ext: "",
    numero_int: "",
    colonia: "",
    municipio: "",
    cp: "",
    id_estado: 1,
  },
  periodos_servicio: [
    {
      i_numero_ministracion: 1,
      f_monto: 0,
      servicio: "",
      descripcion: "",
      dt_inicio: "",
      dt_fin: "",
      cp: "",
    },
  ],
  historial_pagos: [],
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
    case "AGREGAR_PERIODO":
      const ultimoPeriodo =
        state.forma.periodos_servicio[state.forma.periodos_servicio.length - 1]

      return {
        ...state,
        forma: {
          ...state.forma,
          periodos_servicio: [
            ...state.forma.periodos_servicio,
            {
              ...estadoInicialForma.periodos_servicio[0],
              i_numero_ministracion: ultimoPeriodo.i_numero_ministracion + 1,
              cp: ultimoPeriodo.cp,
            },
          ],
        },
      }
    case "QUITAR_PERIODO":
      const nuevaLista = state.forma.periodos_servicio.filter(
        (periodo, index) => index != payload
      )

      return {
        ...state,
        forma: {
          ...state.forma,
          periodos_servicio: nuevaLista,
        },
      }
    case "HANDLE_CHANGE_PERIODO":
      const nuevosPeriodos = state.forma.periodos_servicio.map((ps, index) => {
        if (payload.index == index) {
          return {
            ...ps,
            [payload.name]: payload.value,
          }
        }
        return ps
      })

      return {
        ...state,
        forma: {
          ...state.forma,
          periodos_servicio: nuevosPeriodos,
        },
      }
    default:
      return state
  }
}

const FormaColaborador = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idColaborador = Number(router.query.idC)

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    proyectosDB: [],
    isLoading: true,
    mensajeNota: "",
    banner: estadoInicialBanner,
    modoEditar: !idColaborador,
    modalidad: idColaborador ? "EDITAR" : "CREAR",
  }

  const { estados, bancos } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  const modalidad = idColaborador ? "EDITAR" : "CREAR"
  const tBodyPeriodos = useRef(null)

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
        const reColaborador = await obtenerColaboradores(null, idColaborador)
        if (reColaborador.error) throw reColaborador
        dispatch({
          type: "CARGA_INICIAL",
          payload: reColaborador.data[0],
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
    return ApiCall.post("/colaboradores", estado.forma)
  }

  const editar = async () => {
    return ApiCall.put(`/colaboradores/${idColaborador}`, estado.forma)
  }

  const cancelar = () => {
    if (modalidad === "EDITAR") {
      dispatch({ type: "CANCELAR_EDITAR" })
    } else {
      router.back()
    }
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    if (error.campo === name) {
      validarCampos({ [name]: value })
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

  const handleChangePeriodo = (ev: ChangeEvent, index: number) => {
    let { name, value } = ev.target
    dispatch({
      type: "HANDLE_CHANGE_PERIODO",
      payload: { index, name, value },
    })
  }

  const quitarPeriodoServicio = (index: number) => {
    dispatch({
      type: "QUITAR_PERIODO",
      payload: index,
    })
  }

  const agregarPeriodo = () => {
    dispatch({ type: "AGREGAR_PERIODO" })
  }

  const determinarMinDataFinPeriodoServicio = (dt_inicio: string) => {
    if (!dt_inicio) return ""
    const dtInicioMasDia = fechaMasDiasFutuosString(dt_inicio, 1)
    return dtInicioMasDia
  }

  // const determinarMaxDataFinPeriodoServicio = (dt_inicio: string) => {
  //   if (!dt_inicio || estadoForma.i_tipo > 1) return ""
  //   const dtInicioMasSeisMeses = fechaMasMesesFutuosString(dt_inicio, 6)
  //   return dtInicioMasSeisMeses
  // }

  const validarPeriodos = (): boolean => {
    if (estado.forma.i_tipo == tiposColaborador.SIN_PAGO) return true
    try {
      estado.forma.periodos_servicio.forEach((periodo, index) => {
        if (!Number(periodo.i_numero_ministracion))
          throw { index, campo: "i_numero_ministracion" }
        if (!Number(periodo.f_monto)) throw { index, campo: "f_monto" }
        if (!periodo.servicio) throw { index, campo: "servicio" }
        if (!periodo.descripcion) throw { index, campo: "descripcion" }
        if (!Number(periodo.cp) || periodo.cp.length != 5)
          throw { index, campo: "cp" }
        if (!periodo.dt_inicio) throw { index, campo: "dt_inicio" }
        if (!periodo.dt_fin) throw { index, campo: "dt_fin" }
      })
      return true
    } catch (error) {
      const tRows = tBodyPeriodos.current.querySelectorAll("tr")
      const rowError = tRows[error.index]
      const inputError = rowError.querySelector(`input[name=${error.campo}]`)
      inputError.focus()
      return false
    }
  }

  const validarForma = () => {
    const campos = {
      id_proyecto: estado.forma.id_proyecto,
      nombre: estado.forma.nombre,
      apellido_paterno: estado.forma.apellido_paterno,
      apellido_materno: estado.forma.apellido_materno,
      clabe: estado.forma.clabe,
      id_banco: estado.forma.id_banco,
      email: estado.forma.email,
      telefono: estado.forma.telefono,
      rfc: estado.forma.rfc,
      curp: estado.forma.curp,
      calle: estado.forma.direccion.calle,
      numero_ext: estado.forma.direccion.numero_ext,
      colonia: estado.forma.direccion.colonia,
      municipio: estado.forma.direccion.municipio,
      cp: estado.forma.direccion.cp,
    }

    // console.log(campos)
    return validarCampos(campos)
  }

  const handleSubmit = async () => {
    if (!validarForma()) return
    if (!validarPeriodos()) return
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
          `/colaboradores/${data.idInsertado}`
        )
      } else {
        dispatch({
          type: "RELOAD",
          payload: data,
        })
      }
    }
  }

  const showBtnEliminarPeriodo = estado.forma.periodos_servicio.length > 1
  const showBtnEditar =
    modalidad === "EDITAR" &&
    !estado.modoEditar &&
    (user.id == estado.forma.id_responsable ||
      user.id_rol == rolesUsuario.SUPER_USUARIO)
  const enableSlctTipo =
    modalidad === "CREAR" ||
    (estado.modoEditar && user.id_rol === rolesUsuario.SUPER_USUARIO)

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
          <div>
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Colaborador</h2>
            )}
          </div>
          {showBtnEditar && (
            <BtnEditar onClick={() => dispatch({ type: "MODO_EDITAR_ON" })} />
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
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
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="i_tipo"
                value={estado.forma.i_tipo}
                disabled={!enableSlctTipo}
              >
                <option value="1">Asimilado</option>
                <option value="2">Honorarios</option>
                <option value="3">Sin pago</option>
              </select>
            </div>
            {modalidad === "EDITAR" && (
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">ID empleado</label>
                <input
                  className="form-control"
                  type="text"
                  value={estado.forma.id_empleado}
                  disabled
                />
              </div>
            )}
          </div>
        </div>
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
          <label className="form-label">CLABE</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeClabe}
            value={estado.forma.clabe}
            disabled={!estado.modoEditar}
          />
          {error.campo == "clabe" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Banco</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_banco"
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
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="rfc"
            value={estado.forma.rfc}
            disabled={!estado.modoEditar}
          />
          {error.campo == "rfc" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">CURP</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="curp"
            value={estado.forma.curp}
            disabled={!estado.modoEditar}
          />
          {error.campo == "curp" && <MensajeError mensaje={error.mensaje} />}
        </div>
        {estado.forma.i_tipo != tiposColaborador.SIN_PAGO && (
          <>
            <div className="col-12">
              <hr />
            </div>
            <div className="col-12">
              <div className="row">
                <div className="col-12 col-sm-6 col-lg-8 col-xl-10 mb-3">
                  <h4 className="color1 mb-0">Periodos de servicio</h4>
                </div>
                {estado.modoEditar && (
                  <div className="col mb-3">
                    <BtnNeutro
                      margin={false}
                      width={true}
                      texto="Agregar +"
                      onclick={agregarPeriodo}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 table-responsive">
              <table className="table">
                <thead className="table-light">
                  <tr className="color1">
                    <th># Ministración</th>
                    <th style={{ minWidth: "90px" }}>Monto</th>
                    <th style={{ minWidth: "200px" }}>Servicio</th>
                    <th style={{ minWidth: "300px" }}>Descricpión</th>
                    <th style={{ minWidth: "100px" }}>
                      CP
                      <i
                        title="Código postal de la constancia situación fiscal"
                        className="bi bi-info-circle ms-1"
                      ></i>
                    </th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    {estado.modoEditar && (
                      <th>
                        <i className="bi bi-trash"></i>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody ref={tBodyPeriodos}>
                  {estado.forma.periodos_servicio.map((periodo, index) => {
                    const {
                      id,
                      i_numero_ministracion,
                      f_monto,
                      servicio,
                      descripcion,
                      cp,
                      dt_inicio,
                      dt_fin,
                    } = periodo

                    if (estado.modoEditar) {
                      return (
                        <tr key={id || `periodo_${index}`}>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              name="i_numero_ministracion"
                              value={i_numero_ministracion}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              name="f_monto"
                              value={f_monto}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              name="servicio"
                              value={servicio}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              name="descripcion"
                              value={descripcion}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              name="cp"
                              value={cp}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              name="dt_inicio"
                              value={dt_inicio}
                              onChange={(e) => handleChangePeriodo(e, index)}
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              name="dt_fin"
                              min={determinarMinDataFinPeriodoServicio(
                                dt_inicio
                              )}
                              // max={determinarMaxDataFinPeriodoServicio(
                              //   dt_inicio
                              // )}
                              onChange={(e) => handleChangePeriodo(e, index)}
                              value={dt_fin}
                            />
                          </td>
                          <td>
                            {showBtnEliminarPeriodo && !id && (
                              <BtnAccion
                                margin={false}
                                icono="bi-x-circle"
                                onclick={() => quitarPeriodoServicio(index)}
                                title="eliminar usuario"
                              />
                            )}
                          </td>
                        </tr>
                      )
                    }

                    //mostrar tabla sin inputs si no esta en modo edicion
                    return (
                      <tr key={id || `periodo_${index}`}>
                        <td>{i_numero_ministracion}</td>
                        <td>{montoALocaleString(f_monto)}</td>
                        <td>{servicio}</td>
                        <td>{descripcion}</td>
                        <td>{cp}</td>
                        <td>{inputDateAformato(dt_inicio)}</td>
                        <td>{inputDateAformato(dt_fin)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
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

export { FormaColaborador }
