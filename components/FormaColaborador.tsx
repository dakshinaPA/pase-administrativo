import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ColaboradorProyecto,
  ProyectoMin,
  QueriesProyecto,
} from "@models/proyecto.model"
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
  inputDateAformato,
  montoALocaleString,
  obtenerColaboradores,
  obtenerProyectos,
} from "@assets/utils/common"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "HANDLE_CHANGE_DIRECCION"
  | "HANDLE_CHANGE_PERIODO"
  | "AGREGAR_PERIODO"
  | "QUITAR_PERIODO"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (
  state: ColaboradorProyecto,
  action: ActionDispatch
): ColaboradorProyecto => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "HANDLE_CHANGE_DIRECCION":
      return {
        ...state,
        direccion: {
          ...state.direccion,
          [payload.name]: payload.value,
        },
      }
    case "AGREGAR_PERIODO":
      return {
        ...state,
        periodos_servicio: [...state.periodos_servicio, payload],
      }
    case "QUITAR_PERIODO":
      const nuevaLista = state.periodos_servicio.filter(
        (periodo, index) => index != payload
      )

      return {
        ...state,
        periodos_servicio: nuevaLista,
      }
    case "HANDLE_CHANGE_PERIODO":
      return {
        ...state,
        periodos_servicio: payload,
      }
    default:
      return state
  }
}

const FormaColaborador = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idColaborador = Number(router.query.idC)

  const estadoInicialForma: ColaboradorProyecto = {
    id_proyecto: idProyecto || 0,
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
  }

  const { estados, bancos } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idColaborador)
  const modalidad = idColaborador ? "EDITAR" : "CREAR"
  const estadoOriginalColaborador = useRef(null)
  const tBodyPeriodos = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    const payload =
      estadoForma.i_tipo == 3 ? [] : estadoInicialForma.periodos_servicio

    dispatch({
      type: "HANDLE_CHANGE_PERIODO",
      payload,
    })
  }, [estadoForma.i_tipo])

  useEffect(() => {
    //el banco depende de los primero 3 digios de la clabe
    if (estadoForma.clabe.length < 3 && estadoForma.id_banco > 0) {
      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "id_banco",
          value: 0,
        },
      })
    } else if (estadoForma.clabe.length == 3 && estadoForma.id_banco == 0) {
      const matchBanco = bancos.find(
        (banco) => banco.clave === estadoForma.clabe
      )
      if (matchBanco) {
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_banco",
            value: matchBanco.id,
          },
        })
      }
    }
  }, [estadoForma.clabe])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectosDB()]
      if (modalidad === "EDITAR") {
        promesas.push(obtenerColaboradores(null, idColaborador))
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const proyectosDB = resCombinadas[0].data as ProyectoMin[]
      setProyectosDB(proyectosDB)

      if (!idProyecto) {
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_proyecto",
            value: proyectosDB[0]?.id || 0,
          },
        })
      }

      if (modalidad === "EDITAR") {
        const colaborador = resCombinadas[1].data[0] as ColaboradorProyecto

        //mantener por si se cancela edicion
        estadoOriginalColaborador.current = colaborador

        dispatch({
          type: "CARGA_INICIAL",
          payload: colaborador,
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const registrar = async () => {
    return ApiCall.post("/colaboradores", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/colaboradores/${idColaborador}`, estadoForma)
  }

  const cancelar = () => {
    // modalidad === "EDITAR" ? setModoEditar(false) : router.back()
    if (modalidad === "EDITAR") {
      dispatch({
        type: "CARGA_INICIAL",
        payload: estadoOriginalColaborador.current,
      })
      setModoEditar(false)
    } else {
      router.back()
    }
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const handleChangePeriodo = (ev: ChangeEvent, index: number) => {
    const { name, value } = ev.target

    const copiaPeriodos = [...estadoForma.periodos_servicio]
    copiaPeriodos[index] = {
      ...copiaPeriodos[index],
      [name]: value,
    }

    dispatch({
      type: "HANDLE_CHANGE_PERIODO",
      payload: copiaPeriodos,
    })
  }

  // const dtInicioMasSeisMeses = () => {
  //   const dtInicio = new Date(estadoForma.dt_inicio_servicio)
  //   const dtFinEpoch = new Date(estadoForma.dt_inicio_servicio).setMonth(
  //     dtInicio.getMonth() + 6
  //   )

  //   const dtFin = new Date(0)
  //   dtFin.setUTCMilliseconds(dtFinEpoch)
  //   const [month, day, year] = dtFin
  //     .toLocaleDateString("en-US", {
  //       year: "numeric",
  //       month: "2-digit",
  //       day: "2-digit",
  //     })
  //     .split("/")

  //   const dtAFormatoInput = `${year}-${month}-${day}`

  //   return dtAFormatoInput
  // }

  const quitarPeriodoServicio = (index: number) => {
    dispatch({
      type: "QUITAR_PERIODO",
      payload: index,
    })
  }

  const agregarPeriodo = () => {
    const ultimoPeriodo =
      estadoForma.periodos_servicio[estadoForma.periodos_servicio.length - 1]
    const clacularNumeroMinistracion =
      Number(ultimoPeriodo?.i_numero_ministracion || 0) + 1

    dispatch({
      type: "AGREGAR_PERIODO",
      payload: {
        ...estadoInicialForma.periodos_servicio[0],
        i_numero_ministracion: clacularNumeroMinistracion,
        cp: ultimoPeriodo?.cp || "",
      },
    })
  }

  const validarPeriodos = (): boolean => {
    try {
      estadoForma.periodos_servicio.forEach((periodo, index) => {
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

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    if (!validarPeriodos()) return
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push(
          //@ts-ignore
          `/proyectos/${estadoForma.id_proyecto}/colaboradores/${data.idInsertado}`
        )
      } else {
        estadoOriginalColaborador.current = data
        dispatch({
          type: "CARGA_INICIAL",
          payload: data,
        })
        setModoEditar(false)
      }
    }
  }

  const showBtnEliminarPeriodo = estadoForma.periodos_servicio.length > 1

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div>
            {/* <BtnBack navLink="/colaboradores" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Colaborador</h2>
            )}
          </div>
          {!modoEditar &&
            idColaborador &&
            user.id === estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Proyecto</label>
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="id_proyecto"
                value={estadoForma.id_proyecto}
                disabled={!!idProyecto}
              >
                {proyectosDB.length > 0 ? (
                  proyectosDB.map(({ id, id_alt, nombre }) => (
                    <option key={id} value={id}>
                      {nombre} - {id_alt}
                    </option>
                  ))
                ) : (
                  <option value="0">No hay proyectos</option>
                )}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="i_tipo"
                value={estadoForma.i_tipo}
                disabled={!!idColaborador}
              >
                <option value="1">Asimilado</option>
                <option value="2">Honorarios</option>
                <option value="3">Sin pago</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">ID empleado</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="id_empleado"
                value={estadoForma.id_empleado}
                disabled={!modoEditar}
              />
            </div>
          </div>
          <div className="row">
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
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CLABE</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="clabe"
                value={estadoForma.clabe}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Banco</label>
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="id_banco"
                value={estadoForma.id_banco}
                // disabled={!modoEditar}
                disabled
              >
                <option value="0" disabled></option>
                {bancos.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
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
              <label className="form-label">CURP</label>
              <input
                className="form-control"
                type="text"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="curp"
                value={estadoForma.curp}
                disabled={!modoEditar}
              />
            </div>
          </div>
        </div>
        {estadoForma.i_tipo != 3 && (
          <>
            <div className="col-12">
              <hr />
            </div>
            <div className="col-12">
              <div className="row">
                <div className="col-12 col-sm-6 col-lg-8 col-xl-10 mb-3">
                  <h4 className="color1 mb-0">Periodos de servicio</h4>
                </div>
                {modoEditar && (
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
                <thead>
                  <tr>
                    <th># Ministración</th>
                    <th>Monto</th>
                    <th>Servicio</th>
                    <th style={{ width: "300px" }}>Descricpión</th>
                    <th>
                      CP
                      <i
                        title="Código postal de la constancia situación fiscal"
                        className="bi bi-info-circle ms-1"
                      ></i>
                    </th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    {modoEditar && (
                      <th>
                        <i className="bi bi-trash"></i>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody ref={tBodyPeriodos}>
                  {estadoForma.periodos_servicio.map((periodo, index) => {
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

                    if (modoEditar) {
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
                              value={dt_fin}
                              onChange={(e) => handleChangePeriodo(e, index)}
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
                      <tr key={id}>
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
            value={estadoForma.direccion.calle}
            disabled={!modoEditar}
          />
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
        </div>
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

export { FormaColaborador }
