import { useEffect, useReducer, useRef, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  MinistracionProyecto,
  NotaProyecto,
  Proyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { useCatalogos } from "@contexts/catalogos.context"
import {
  fechaMasDiasFutuosString,
  inputDateAformato,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerCopartes,
  obtenerFinanciadores,
  obtenerProyectos,
  obtenerUsuarios,
} from "@assets/utils/common"
import {
  BtnAccion,
  BtnCancelar,
  BtnEditar,
  BtnNeutro,
  BtnRegistrar,
} from "./Botones"
import {
  ActionTypes,
  ProyectoProvider,
  useProyecto,
} from "@contexts/proyecto.context"
import { FormaMinistracion } from "./FromaMinistracion"
import { TooltipInfo } from "./Tooltip"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import { Toast } from "./Toast"
import { useToast } from "@hooks/useToasts"
import { UsuarioMin } from "@models/usuario.model"

const TablaMinistraciones = () => {
  const {
    user,
    estadoForma,
    quitarMinistracion,
    editarMinistracion,
    modoEditar,
  } = useProyecto()

  const showAcciones =
    (user.id == estadoForma.id_administrador || user.id_rol == 1) && modoEditar

  const sumaRubros = estadoForma.ministraciones.reduce(
    (acum, min) =>
      acum +
      min.rubros_presupuestales.reduce(
        (acum, rp) => acum + Number(rp.f_monto),
        0
      ),
    0
  )

  return (
    <div className="col-12 col-md table-responsive mb-3">
      <table className="table">
        <thead className="table-light">
          <tr>
            <th>Número</th>
            <th>Grupo</th>
            <th>Fecha de recepción</th>
            <th>Rubros</th>
            <th>Monto</th>
            {showAcciones && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {estadoForma.ministraciones.map(
            ({
              id,
              i_numero,
              i_grupo,
              dt_recepcion,
              rubros_presupuestales,
            }) => {
              const f_monto = rubros_presupuestales.reduce(
                (acum, rp) => acum + Number(rp.f_monto),
                0
              )

              return (
                <tr key={i_numero}>
                  <td>{i_numero}</td>
                  <td>{i_grupo}</td>
                  <td>{inputDateAformato(dt_recepcion)}</td>
                  <td>
                    <table className="table table-bordered mb-0">
                      <tbody>
                        {rubros_presupuestales.map(
                          ({ id_rubro, rubro, f_monto }) => {
                            // const nombre_corto = `${rubro.substring(0, 20)}...`

                            return (
                              <tr key={id_rubro}>
                                <td>{rubro}</td>
                                <td className="w-25">
                                  {montoALocaleString(Number(f_monto))}
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </td>
                  <td>{montoALocaleString(f_monto)}</td>
                  {showAcciones && (
                    <td>
                      {id ? (
                        <BtnAccion
                          margin={false}
                          icono="bi-pencil"
                          onclick={() => editarMinistracion(id)}
                          title="editar ministración"
                        />
                      ) : (
                        <BtnAccion
                          margin={false}
                          icono="bi-x-circle"
                          onclick={() => quitarMinistracion(i_numero)}
                          title="editar ministración"
                        />
                      )}
                    </td>
                  )}
                </tr>
              )
            }
          )}
          <tr>
            <td colSpan={4}></td>
            <td>{montoALocaleString(sumaRubros)}</td>
            {showAcciones && <td></td>}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const Saldos = () => {
  const { estadoForma } = useProyecto()

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Saldo</h3>
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Monto total</th>
              <th>Transferido</th>
              <th>Solicitado</th>
              <th>Comprobado</th>
              <th>Por comprobar</th>
              <th>ISR (35%)</th>
              <th>Retenciones</th>
              <th>PA</th>
              <th>Total ejecutado</th>
              <th>Remanente</th>
              <th>Avance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{montoALocaleString(estadoForma.saldo.f_monto_total)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_transferido)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_solicitado)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_comprobado)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_por_comprobar)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_isr)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_retenciones)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_pa)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_ejecutado)}</td>
              <td>{montoALocaleString(estadoForma.saldo.f_remanente)}</td>
              <td>{estadoForma.saldo.p_avance}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Colaboradores = () => {
  const { estadoForma, idProyecto, user } = useProyecto()
  const router = useRouter()

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Colaboradores</h3>
        {user.id == estadoForma.id_responsable && (
          <BtnNeutro
            texto="Registrar +"
            onclick={() =>
              router.push(`/proyectos/${idProyecto}/colaboradores/registro`)
            }
            margin={false}
            width={false}
          />
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Id empleado</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>Clabe</th>
              <th>Banco</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadoForma.colaboradores.map(
              ({
                id,
                id_empleado,
                nombre,
                apellido_paterno,
                tipo,
                telefono,
                email,
                clabe,
                banco,
              }) => (
                <tr key={id}>
                  <td>{id_empleado}</td>
                  <td>
                    {nombre} {apellido_paterno}
                  </td>
                  <td>{tipo}</td>
                  <td>{email}</td>
                  <td>{clabe}</td>
                  <td>{banco}</td>
                  <td>{telefono}</td>
                  <td>
                    <BtnAccion
                      margin={false}
                      icono="bi bi-eye-fill"
                      onclick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/colaboradores/${id}`
                        )
                      }
                      title="ver colaborador"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Proveedores = () => {
  const { estadoForma, idProyecto, user } = useProyecto()
  const router = useRouter()

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Proveedores</h3>
        {user.id == estadoForma.id_responsable && (
          <BtnNeutro
            texto="Registrar +"
            onclick={() =>
              router.push(`/proyectos/${idProyecto}/proveedores/registro`)
            }
            margin={false}
            width={false}
          />
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Servicio</th>
              <th>Teléfono</th>
              <th>RFC</th>
              <th>CLABE</th>
              <th>Banco</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadoForma.proveedores.map(
              ({
                id,
                nombre,
                tipo,
                descripcion_servicio,
                telefono,
                rfc,
                clabe,
                banco,
              }) => (
                <tr key={id}>
                  <td>{nombre}</td>
                  <td>{tipo}</td>
                  <td>{descripcion_servicio}</td>
                  <td>{telefono}</td>
                  <td>{rfc}</td>
                  <td>{clabe}</td>
                  <td>{banco}</td>
                  <td>
                    <BtnAccion
                      margin={false}
                      icono="bi bi-eye-fill"
                      onclick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/proveedores/${id}`
                        )
                      }
                      title="ver proveedor"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SolicitudesPresupuesto = () => {
  const { estadoForma, idProyecto, user } = useProyecto()
  const router = useRouter()

  return (
    <div className="row mb-5">
      <div className="col-12 mb-3 d-flex justify-content-between">
        <h3 className="color1 mb-0">Solicitudes de presupuesto</h3>
        {user.id == estadoForma.id_responsable && (
          <BtnNeutro
            texto="Registrar +"
            onclick={() =>
              router.push(
                `/proyectos/${idProyecto}/solicitudes-presupuesto/registro`
              )
            }
            margin={false}
            width={false}
          />
        )}
      </div>
      <div className="col-12 table-responsive">
        <table className="table">
          <thead className="table-light">
            <tr>
              <th>Tipo gasto</th>
              <th>Partida presupuestal</th>
              <th>Descripción gasto</th>
              <th>Proveedor</th>
              <th>Titular cuenta</th>
              <th>Importe</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estadoForma.solicitudes_presupuesto.map(
              ({
                id,
                tipo_gasto,
                rubro,
                descripcion_gasto,
                proveedor,
                titular_cuenta,
                f_importe,
                saldo,
                i_estatus,
                estatus,
              }) => (
                <tr key={id}>
                  <td>{tipo_gasto}</td>
                  <td>{rubro}</td>
                  <td>{descripcion_gasto}</td>
                  <td>{proveedor}</td>
                  <td>{titular_cuenta}</td>
                  <td>{montoALocaleString(f_importe)}</td>
                  <td>
                    <span
                      className={`badge bg-${obtenerBadgeStatusSolicitud(
                        i_estatus
                      )}`}
                    >
                      {estatus}
                    </span>
                  </td>
                  <td>
                    <BtnAccion
                      margin={false}
                      icono="bi bi-eye-fill"
                      onclick={() =>
                        router.push(
                          `/proyectos/${idProyecto}/solicitudes-presupuesto/${id}`
                        )
                      }
                      title="ver proveedor"
                    />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const Notas = () => {
  const { estadoForma, idProyecto, user, dispatch } = useProyecto()
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const inputNota = useRef(null)

  const agregar = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(`/proyectos/${idProyecto}/notas`, {
      id_usuario: user.id,
      mensaje: mensajeNota,
    })

    if (cr.error) {
      console.log(cr.data)
    } else {
      refrescarNotas()
      //limpiar el input
      setMensajeNota("")
    }
  }

  const refrescarNotas = async () => {
    const re = await ApiCall.get(`/proyectos/${idProyecto}/notas`)

    if (re.error) {
      console.log(re.data)
    } else {
      const notasDB = re.data as NotaProyecto[]
      dispatch({
        type: "RECARGAR_NOTAS",
        payload: notasDB,
      })
    }
  }

  return (
    <div className="row">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Notas</h3>
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
            {estadoForma.notas.map(({ id, usuario, mensaje, dt_registro }) => (
              <tr key={id}>
                <td>{usuario}</td>
                <td>{mensaje}</td>
                <td>{dt_registro}</td>
              </tr>
            ))}
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
        <BtnNeutro
          texto="Agregar nota +"
          onclick={agregar}
          margin={false}
          width={false}
        />
      </div>
    </div>
  )
}

const FormaProyecto = () => {
  const {
    estadoForma,
    dispatch,
    idProyecto,
    idCoparte,
    user,
    modalidad,
    showFormaMinistracion,
    setShowFormaMinistracion,
    setFormaMinistracion,
    estaInicialFormaMinistracion,
    modoEditar,
    setModoEditar,
  } = useProyecto()

  const router = useRouter()
  const { temas_sociales, estados } = useCatalogos()
  const [financiadoresDB, setFinanciadoresDB] = useState<FinanciadorMin[]>([])
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosCoparteDB, setUsuariosCoparteDB] = useState<UsuarioMin[]>([])
  const { error, validarCampos, formRef } = useErrores()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { toastState, mostrarToast, cerrarToast } = useToast()

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarUsuariosCoparte()
  }, [estadoForma.id_coparte])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      if (modalidad == "CREAR") {
        const queryCopartes: QueriesCoparte = {}
        if (idCoparte) {
          queryCopartes.id = idCoparte
        } else if (user.id_rol == 2) {
          queryCopartes.id_admin = user.id
        }

        const promesas = [
          obtenerFinanciadores(),
          obtenerCopartes(queryCopartes),
        ]

        const resCombinadas = await Promise.all(promesas)

        for (const rc of resCombinadas) {
          if (rc.error) throw rc.data
        }

        const financiaodresDB = resCombinadas[0].data as FinanciadorMin[]
        const copartesAdminDB = resCombinadas[1].data as CoparteMin[]

        setFinanciadoresDB(financiaodresDB)
        setCopartesDB(copartesAdminDB)

        dispatch({
          type: "SET_IDS_DEPENDENCIAS",
          payload: {
            id_coparte: copartesAdminDB[0]?.id ?? 0,
            id_financiador: financiaodresDB[0]?.id ?? 0,
          },
        })
      } else {
        const reProyecto = await obtenerProyectos({
          id: idProyecto,
          min: false,
        })
        if (reProyecto.error) throw reProyecto.data

        const proyecto = reProyecto.data as Proyecto
        dispatch({
          type: "CARGA_INICIAL",
          payload: proyecto,
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarUsuariosCoparte = async () => {
    const idCoparte = estadoForma.id_coparte
    if (!idCoparte) return

    setIsLoading(true)

    const reUsCoDB = await obtenerUsuarios({ id_coparte: idCoparte, min: true })

    if (reUsCoDB.error) {
      console.log(reUsCoDB.data)
    } else {
      const usuariosCoparte = reUsCoDB.data as UsuarioMin[]
      setUsuariosCoparteDB(usuariosCoparte)

      if (modalidad === "CREAR") {
        //setear al primer usuario de la lista
        dispatch({
          type: "HANDLE_CHANGE",
          payload: {
            name: "id_responsable",
            value: usuariosCoparte[0].id,
          },
        })
      }
    }

    setIsLoading(false)
  }

  const registrar = () => {
    return ApiCall.post("/proyectos", estadoForma)
  }

  const editar = () => {
    return ApiCall.put(`/proyectos/${idProyecto}`, estadoForma)
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/proyectos")
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

  const mostrarFormaMinistracion = () => {
    //cuando se vaya a agregar una nueva ministracion hay que limpiar la forma
    //hay que calcular el numero automaticamente
    setFormaMinistracion((prevState) => ({
      ...estaInicialFormaMinistracion,
      i_numero:
        Number(
          estadoForma.ministraciones[estadoForma.ministraciones.length - 1]
            ?.i_numero || 0
        ) + 1,
    }))
    setShowFormaMinistracion(true)
  }

  const calcularDtMinFin = () => {
    return estadoForma.dt_inicio
      ? fechaMasDiasFutuosString(estadoForma.dt_inicio, 1)
      : ""
  }

  const validarForma = () => {
    const campos = {
      nombre: estadoForma.nombre,
      id_financiador: estadoForma.id_financiador,
      id_coparte: estadoForma.id_coparte,
      id_responsable: estadoForma.id_responsable,
      sector_beneficiado: estadoForma.sector_beneficiado,
      municipio: estadoForma.municipio,
      dt_inicio: estadoForma.dt_inicio,
      dt_fin: estadoForma.dt_fin,
      i_beneficiados: estadoForma.i_beneficiados,
      descripcion: estadoForma.descripcion,
    }

    // console.log(campos)
    return validarCampos(campos)
  }

  const validarMinistraciones = () => {
    if (estadoForma.ministraciones.length > 0) {
      return true
    }

    mostrarToast("Agregar ministración")
    return false
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    if (!validarMinistraciones()) return
    console.log(estadoForma)

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        // router.push(
        //   //@ts-ignore
        //   `/copartes/${estadoForma.id_coparte}/proyectos/${data.idInsertado}`
        // )
        router.push("/proyectos")
      } else {
        const reProyectoActualizado = await obtenerProyectos({
          id: idProyecto,
          min: false,
        })
        if (reProyectoActualizado.error) {
          console.log(reProyectoActualizado.data)
        } else {
          const proyectoActualizado = reProyectoActualizado.data as Proyecto
          dispatch({
            type: "CARGA_INICIAL",
            payload: proyectoActualizado,
          })
          setModoEditar(false)
        }
      }
    }
    setIsLoading(false)
  }

  const showBtnNuevaMinistracion =
    modoEditar &&
    !showFormaMinistracion &&
    (estadoForma.i_tipo_financiamiento >= 3 ||
      (estadoForma.i_tipo_financiamiento <= 2 &&
        !(estadoForma.ministraciones.length > 0)))

  const showBtnEditar =
    !modoEditar &&
    idProyecto &&
    !showFormaMinistracion &&
    (estadoForma.id_administrador == user.id || user.id_rol == 1)

  if (isLoading) {
    return <Loader />
  }

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div className="d-flex align-items-center">
            <BtnBack navLink="/proyectos" />
            {!idProyecto && <h2 className="color1 mb-0">Registrar proyecto</h2>}
          </div>
          {showBtnEditar && <BtnEditar onClick={() => setModoEditar(true)} />}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
        {modalidad === "EDITAR" && (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Id alterno</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_alt"
              value={estadoForma.id_alt}
              disabled
            />
            {error.campo == "id_alt" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
        )}
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
          <label className="form-label">Financiador</label>
          {modalidad === "CREAR" ? (
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_financiador"
              value={estadoForma.id_financiador}
              disabled={Boolean(idProyecto)}
            >
              {financiadoresDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-control"
              type="text"
              value={estadoForma.financiador}
              disabled
            />
          )}
          {error.campo == "id_financiador" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Coparte</label>
          {modalidad === "CREAR" ? (
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              value={estadoForma.id_coparte}
              name="id_coparte"
              disabled={Boolean(idProyecto) || Boolean(idCoparte)}
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
              value={estadoForma.coparte}
              disabled
            />
          )}
          {error.campo == "id_coparte" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Responsable</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_responsable"
            value={estadoForma.id_responsable}
            disabled={!modoEditar}
          >
            {usuariosCoparteDB.map(({ id, nombre, apellido_paterno }) => (
              <option key={id} value={id}>
                {nombre} {apellido_paterno}
              </option>
            ))}
            {error.campo == "id_responsable" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de financiamiento</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo_financiamiento"
            value={estadoForma.i_tipo_financiamiento}
            disabled={Boolean(idProyecto)}
          >
            <option value="1">Estipendio</option>
            <option value="2">Única ministración</option>
            <option value="3">Varias Ministraciones</option>
            <option value="4">Multi anual</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tema social</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_tema_social"
            value={estadoForma.id_tema_social}
            disabled={!modoEditar}
          >
            {temas_sociales.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Sector beneficiado</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="sector_beneficiado"
            value={estadoForma.sector_beneficiado}
            disabled={!modoEditar}
          />
          {error.campo == "sector_beneficiado" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label me-1">Estado</label>
          <TooltipInfo texto="Estado de acción del proyecto" />
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_estado"
            value={estadoForma.id_estado}
            disabled={!modoEditar}
          >
            {estados.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label me-1">Municipio</label>
          <TooltipInfo texto="Municipio de acción del proyecto" />
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="municipio"
            value={estadoForma.municipio}
            disabled={!modoEditar}
          />
          {error.campo == "municipio" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label me-1">Fecha inicio</label>
          <TooltipInfo texto="Inicio de la ejecución del proyecto" />
          <input
            className="form-control"
            type="date"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="dt_inicio"
            value={estadoForma.dt_inicio}
            disabled={!modoEditar}
          />
          {error.campo == "dt_inicio" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label me-1">Fecha fin</label>
          <TooltipInfo texto="Fin de la ejecución del proyecto" />
          <input
            className="form-control"
            type="date"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="dt_fin"
            value={estadoForma.dt_fin}
            min={calcularDtMinFin()}
            disabled={!modoEditar}
          />
          {error.campo == "dt_fin" && <MensajeError mensaje={error.mensaje} />}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Beneficiados</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_beneficiados"
            value={estadoForma.i_beneficiados}
            disabled={!modoEditar}
          />
          {error.campo == "i_beneficiados" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12 mb-3">
          <label className="form-label me-1">Descricpción</label>
          <textarea
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="descripcion"
            value={estadoForma.descripcion}
            disabled={!modoEditar}
          />
          {error.campo == "descripcion" && (
            <MensajeError mensaje={error.mensaje} />
          )}
        </div>
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion Ministraciones */}
        <div className="col-12 mb-3 d-flex justify-content-between">
          <h4 className="color1 mb-0">Ministraciones</h4>
          {showBtnNuevaMinistracion && (
            <BtnNeutro
              margin={false}
              texto="Nueva ministración +"
              width={false}
              onclick={mostrarFormaMinistracion}
            />
          )}
        </div>
        <TablaMinistraciones />
        {showFormaMinistracion && <FormaMinistracion />}
        {modoEditar && !showFormaMinistracion && (
          <div className="col-12 text-end">
            <BtnCancelar onclick={cancelar} margin={"r"} />
            <BtnRegistrar modalidad={modalidad} margin={false} />
          </div>
        )}
      </FormaContenedor>
      <Toast estado={toastState} cerrar={cerrarToast} />
      {/* <Toast estado={toastState} cerrar={cerrarToast} /> */}
      {modalidad === "EDITAR" && (
        <>
          <Saldos />
          <Colaboradores />
          <Proveedores />
          <SolicitudesPresupuesto />
          {user.id_rol != 3 && <Notas />}
        </>
      )}
    </RegistroContenedor>
  )
}

const RegistroProyecto = () => {
  return (
    <ProyectoProvider>
      <FormaProyecto />
    </ProyectoProvider>
  )
}

export { RegistroProyecto }
