import { useEffect, useState, useReducer, useRef } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import {
  ColaboradorProyecto,
  DataProyecto,
  ProveedorProyecto,
  ProyectoMin,
  QueriesProyecto,
  RubroMinistracion,
} from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import {
  ComprobanteSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import { useAuth } from "@contexts/auth.context"
import {
  meses,
  obtenerBadgeStatusSolicitud,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"

type ActionTypes =
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "AGREGAR_FACTURA"
  | "QUITAR_FACTURA"
  | "CAMBIO_TIPO_GASTO"
  | "CAMBIO_TITULAR"
  // | "LIMPIAR_DATOS_TITULAR"
  | "CAMBIO_PROYECTO"
  | "NUEVO_REGISTRO"

interface ActionDispatch {
  type: ActionTypes
  payload: any
}

const reducer = (
  state: SolicitudPresupuesto,
  action: ActionDispatch
): SolicitudPresupuesto => {
  const { type, payload } = action

  switch (type) {
    case "CARGA_INICIAL":
    case "NUEVO_REGISTRO":
      return payload
    case "HANDLE_CHANGE":
      return {
        ...state,
        [payload.name]: payload.value,
      }
    case "AGREGAR_FACTURA":
      return {
        ...state,
        comprobantes: [...state.comprobantes, payload],
      }
    case "QUITAR_FACTURA":
      const comprobantesFiltrados = state.comprobantes.filter(
        (comp) => comp.folio_fiscal !== payload
      )

      return {
        ...state,
        comprobantes: comprobantesFiltrados,
      }
    case "CAMBIO_PROYECTO":
      return {
        ...state,
        i_tipo_gasto: 0,
        id_partida_presupuestal: 0,
        titular_cuenta: "",
        descripcion_gasto: "",
      }
    case "CAMBIO_TIPO_GASTO":
      return {
        ...state,
        id_partida_presupuestal: payload.id_partida_presupuestal,
        titular_cuenta: "",
        descripcion_gasto: payload.descripcion_gasto,
      }
    case "CAMBIO_TITULAR":
      return {
        ...state,
        clabe: payload.clabe,
        id_banco: payload.id_banco,
        proveedor: payload.proveedor,
      }
    // case "LIMPIAR_DATOS_TITULAR":
    //   return {
    //     ...state,
    //     clabe: "",
    //     id_banco: 1,
    //     proveedor: "",
    //   }
    default:
      return state
  }
}

const estadoInicialDataProyecto: DataProyecto = {
  colaboradores: [],
  proveedores: [],
  rubros_presupuestales: [],
}

interface DataTipoGasto {
  partidas_presupuestales: RubroMinistracion[]
  titulares: ColaboradorProyecto[] | ProveedorProyecto[]
}

const estadoInicialDataTipoGasto: DataTipoGasto = {
  partidas_presupuestales: [],
  titulares: [],
}

const FormaSolicitudPresupuesto = () => {
  const { user } = useAuth()
  if (!user || user.id_rol != 3) return null
  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idSolicitud = Number(router.query.idS)

  const estadoInicialForma: SolicitudPresupuesto = {
    id_proyecto: 0,
    i_tipo_gasto: 0,
    titular_cuenta: "",
    clabe: "",
    id_banco: 1,
    email: "",
    proveedor: "",
    descripcion_gasto: "",
    id_partida_presupuestal: 0,
    f_importe: "0",
    comprobantes: [],
  }

  const { bancos, formas_pago } = useCatalogos()
  const [estadoForma, dispatch] = useReducer(reducer, estadoInicialForma)
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [dataProyecto, setDataProyecto] = useState(estadoInicialDataProyecto)
  const [dataTipoGasto, setDataTipoGasto] = useState(estadoInicialDataTipoGasto)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idSolicitud)
  const modalidad = idSolicitud ? "EDITAR" : "CREAR"
  const fileInput = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    cargarDataProyecto()

    if (modalidad === "CREAR") {
      dispatch({
        type: "CAMBIO_PROYECTO",
        payload: null,
      })
    }
  }, [estadoForma.id_proyecto])

  useEffect(() => {
    if (!estadoForma.i_tipo_gasto) return

    let partidas_presupuestales = []
    let titulares = []
    // let id_partida_presupuestal = 0
    const payload = {
      id_partida_presupuestal: 0,
      descripcion_gasto: "",
    }

    switch (Number(estadoForma.i_tipo_gasto)) {
      case 1:
      case 5:
        //muestra todos colaboradores
        titulares = dataProyecto.colaboradores.map((colaborador) => ({
          ...colaborador,
          nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
        }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != 2
        )
        break
      case 2:
        //muestra todos los proveedores
        titulares = dataProyecto.proveedores
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro != 2
        )
        break
      case 3:
        //muestra solo colaboradores registrados como asimilados
        titulares = dataProyecto.colaboradores
          .filter((col) => col.i_tipo == 1)
          .map((colaborador) => ({
            ...colaborador,
            nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
          }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == 2
        )
        payload.id_partida_presupuestal = 2
        payload.descripcion_gasto = "Enero"
        break
      case 4:
        //muestra solo colaboradores registrados como asimilados
        titulares = dataProyecto.colaboradores
          .filter((col) => col.i_tipo == 2)
          .map((colaborador) => ({
            ...colaborador,
            nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
          }))
        partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
          (rp) => rp.id_rubro == 3
        )
        payload.id_partida_presupuestal = 3
        payload.descripcion_gasto = "Enero"
        break
      case 5:
        break
      default:
    }

    setDataTipoGasto({
      partidas_presupuestales,
      titulares,
    })

    // dispatch({
    //   type: "CAMBIO_TIPO_GASTO",
    //   payload,
    // })
  }, [estadoForma.i_tipo_gasto])

  // useEffect(() => {
  //   dispatch({
  //     type: "CAMBIO_TIPO_GASTO",
  //     payload: {
  //       id_partida_presupuestal:
  //         dataTipoGasto.partidas_presupuestales[0]?.id_rubro || 0,
  //       id_titular: dataTipoGasto.titulares[0]?.id || 0,
  //     },
  //   })
  // }, [dataTipoGasto])

  useEffect(() => {
    if (!estadoForma.titular_cuenta) {
      dispatch({
        type: "CAMBIO_TITULAR",
        payload: {
          clabe: "",
          id_banco: 1,
          proveedor: "",
        },
      })
      return
    }

    const matchTitular = dataTipoGasto.titulares.find(
      (titular_cuenta) => titular_cuenta.nombre == estadoForma.titular_cuenta
    )

    if (!matchTitular) {
      console.log(matchTitular)
      return
    }

    const payload = {
      clabe: matchTitular.clabe,
      id_banco: matchTitular.id_banco,
      proveedor: "",
    }

    switch (Number(estadoForma.i_tipo_gasto)) {
      case 2:
      case 3:
      case 4:
        payload.proveedor = matchTitular.nombre
        break
    }

    dispatch({
      type: "CAMBIO_TITULAR",
      payload,
    })
  }, [estadoForma.titular_cuenta])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerProyectosDB()]
      // if (modalidad === "EDITAR") {
      //   promesas.push(obtenerSolicitudes(null, idSolicitud))
      // }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      const proyectosDB = resCombinadas[0].data as ProyectoMin[]
      setProyectosDB(proyectosDB)

      dispatch({
        type: "HANDLE_CHANGE",
        payload: {
          name: "id_proyecto",
          value: idProyecto || proyectosDB[0]?.id || 0,
        },
      })

      // if (modalidad === "EDITAR") {
      //   const solicitud = resCombinadas[1].data[0] as SolicitudPresupuesto

      //   dispatch({
      //     type: "CARGA_INICIAL",
      //     payload: solicitud,
      //   })
      // } else {
      //   dispatch({
      //     type: "HANDLE_CHANGE",
      //     payload: {
      //       name: "id_proyecto",
      //       value: proyectosDB[0]?.id || 0,
      //     },
      //   })
      // }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const cargarDataProyecto = async () => {
    const idProyecto = estadoForma.id_proyecto
    if (!idProyecto) return

    const reDataProyecto = await obtenerProyectos({
      id: idProyecto,
      registro_solicitud: true,
      min: false,
    })

    if (reDataProyecto.error) {
      console.log(reDataProyecto.data)
    } else {
      const dataProyecto = reDataProyecto.data as DataProyecto
      setDataProyecto(dataProyecto)
    }
  }

  useEffect(() => {
    //validar que ya haya informacion de proyecto
    if (!dataProyecto.rubros_presupuestales.length) return

    if (modalidad === "EDITAR") {
      obtener()
    }
  }, [dataProyecto])

  const obtener = async () => {
    const re = await obtenerSolicitudes(null, idSolicitud)
    if (re.error) {
      console.log(re.data)
    } else {
      const solicitud = re.data[0] as SolicitudPresupuesto
      dispatch({
        type: "CARGA_INICIAL",
        payload: solicitud,
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
    return ApiCall.post("/solicitudes-presupuesto", estadoForma)
  }

  const editar = async () => {
    return ApiCall.put(`/solicitudes-presupuesto/${idSolicitud}`, estadoForma)
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.back()
  }

  const handleChange = (ev: ChangeEvent, type: ActionTypes) => {
    const { name, value } = ev.target

    dispatch({
      type,
      payload: { name, value },
    })
  }

  const asignarIMetodoPago = (metodo_pago: "PUE" | "PPD") => {
    return metodo_pago == "PUE" ? 1 : 2
  }

  const asignarIdFormaPAgo = (clave: string) => {
    const metodoMatch = formas_pago.find((mp) => mp.clave == clave)

    return {
      id: metodoMatch?.id || 0,
      nombre: metodoMatch?.nombre || "",
    }
  }

  const agregarFactura = (ev) => {
    const [file] = ev.target.files

    const reader = new FileReader()

    reader.onload = () => {
      const parser = new DOMParser()
      const xml = parser.parseFromString(
        reader.result as string,
        "application/xml"
      )

      // console.log(xml)

      const [comprobante] = xml.getElementsByTagName("cfdi:Comprobante")
      const [timbre] = xml.getElementsByTagName("tfd:TimbreFiscalDigital")

      // const [emisor] = comprobante.getElementsByTagName("cfdi:Emisor")

      const folio_fiscal = timbre.getAttribute("UUID")
      const metodo_pago = comprobante.getAttribute("MetodoPago") as
        | "PUE"
        | "PPD"
      const clave_forma_pago = comprobante.getAttribute("FormaPago")
      // const f_subtotal = comprobante.getAttribute("SubTotal")
      const f_retenciones = comprobante.getAttribute("Descuento")
      const f_total = comprobante.getAttribute("Total")
      // const regimen_fiscal = emisor.getAttribute("RegimenFiscal")

      const formaPago = asignarIdFormaPAgo(clave_forma_pago)

      //limpiar el input
      fileInput.current.value = ""

      //revisar que folio fiscal no se repita
      const marchFolioFiscal = estadoForma.comprobantes.find(
        (comprobante) => comprobante.folio_fiscal == folio_fiscal
      )
      if (marchFolioFiscal) {
        console.log("folio repetido")
        return
      }

      const dataComprobante: ComprobanteSolicitud = {
        folio_fiscal,
        i_metodo_pago: asignarIMetodoPago(metodo_pago),
        metodo_pago,
        id_forma_pago: formaPago.id,
        clave_forma_pago: clave_forma_pago || "",
        forma_pago: formaPago.nombre,
        f_total,
        f_retenciones: f_retenciones || "",
      }

      dispatch({
        type: "AGREGAR_FACTURA",
        payload: dataComprobante,
      })
    }

    reader.readAsText(file)
  }

  const quitarFactura = (folio: string) => {
    dispatch({
      type: "QUITAR_FACTURA",
      payload: folio,
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    console.log(estadoForma)

    // return

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      // if (modalidad === "CREAR") {
      //   router.push(
      //     //@ts-ignore
      //     `/proyectos/${estadoForma.id_proyecto}/solicitudes-presupuesto/${data.idInsertado}`
      //   )
      // } else {
      //   setModoEditar(false)
      // }
      dispatch({
        type: "NUEVO_REGISTRO",
        payload: {
          ...estadoInicialForma,
          id_proyecto: proyectosDB[0]?.id || 0,
        },
      })
    }
  }

  const montoComprobar = () => {
    const totalComprobaciones = estadoForma.comprobantes.reduce(
      (acum, actual) => acum + Number(actual.f_total),
      0
    )

    const totalAComprobar = Number(estadoForma.f_importe) - totalComprobaciones
    return totalAComprobar.toFixed(2)
  }

  if (isLoading) {
    return <Loader />
  }

  const inputFileReembolso =
    [1, 4].includes(Number(estadoForma.i_tipo_gasto)) &&
    estadoForma.comprobantes.length > 0
  const esGastoAsimilados = estadoForma.i_tipo_gasto == 3
  const noTipoGasto = !estadoForma.i_tipo_gasto
  const disableInputFile =
    !modoEditar || inputFileReembolso || esGastoAsimilados || noTipoGasto

  const disableInputProveedor = !modoEditar || estadoForma.i_tipo_gasto != 1

  const disableSelectPartidaPresupuestal =
    !modoEditar || [3, 4].includes(Number(estadoForma.i_tipo_gasto))

  const showTipoGastoAsimilados =
    dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 2) &&
    !!dataProyecto.colaboradores.filter((col) => col.i_tipo == 1).length

  const showTipoGastoHonorarios =
    dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 3) &&
    !!dataProyecto.colaboradores.filter((col) => col.i_tipo == 2).length

  return (
    <RegistroContenedor>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between">
          <div>
            {/* <BtnBack navLink="/solicitudes-presupuesto" /> */}
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">
                Registrar solicitud de presupuesto
              </h2>
            )}
          </div>
          {!modoEditar &&
            idSolicitud &&
            user.id === estadoForma.id_responsable && (
              <BtnEditar onClick={() => setModoEditar(true)} />
            )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        {modalidad === "EDITAR" && (
          <div className="col-12 mb-3">
            <h5>
              <span
                className={`badge bg-${obtenerBadgeStatusSolicitud(
                  estadoForma.i_estatus
                )}`}
              >
                {estadoForma.estatus}
              </span>
            </h5>
          </div>
        )}
        {modalidad === "CREAR" ? (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proyecto</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="id_proyecto"
              value={estadoForma.id_proyecto}
              disabled={Boolean(idProyecto)}
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
        ) : (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proyecto</label>
            <input
              className="form-control"
              type="text"
              value={estadoForma.proyecto}
              disabled
            />
          </div>
        )}
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de gasto</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="i_tipo_gasto"
            value={estadoForma.i_tipo_gasto}
            disabled={!modoEditar}
          >
            {/* <OptionsTipoGasto /> */}
            <option value="0" disabled>
              Selecciona una opción
            </option>
            {dataProyecto.colaboradores.length > 0 && (
              <option value="1">Reembolso</option>
            )}
            {dataProyecto.proveedores.length > 0 && (
              <option value="2">Pago a proveedor</option>
            )}
            {showTipoGastoAsimilados && (
              <option value="3">Asimilados a salarios</option>
            )}
            {showTipoGastoHonorarios && (
              <option value="4">
                Honorarios profesionales (colaboradores)
              </option>
            )}
            {dataProyecto.colaboradores.length > 0 && (
              <option value="5">Gastos por comprobar</option>
            )}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Partida presupuestal</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_partida_presupuestal"
            value={estadoForma.id_partida_presupuestal}
            disabled={disableSelectPartidaPresupuestal}
          >
            <option value="0" disabled>
              Selecciona una opción
            </option>
            {dataTipoGasto.partidas_presupuestales.map(
              ({ id_rubro, nombre }) => (
                <option key={id_rubro} value={id_rubro}>
                  {nombre}
                </option>
              )
            )}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Titular cuenta</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="titular_cuenta"
            value={estadoForma.titular_cuenta}
            disabled={!modoEditar}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {dataTipoGasto.titulares.map((titular_cuenta) => (
              <option key={titular_cuenta.id} value={titular_cuenta.nombre}>
                {titular_cuenta.nombre}
              </option>
            ))}
          </select>
          {/* <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="titular_cuenta"
            value={estadoForma.titular_cuenta}
            disabled={!modoEditar}
          /> */}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">CLABE</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="clabe"
            value={estadoForma.clabe}
            disabled
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Banco</label>
          <select
            className="form-control"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="id_banco"
            value={estadoForma.id_banco}
            disabled
          >
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
          <label className="form-label">Proveedor</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="proveedor"
            value={estadoForma.proveedor}
            disabled={disableInputProveedor}
            placeholder="emisor de la factura"
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Descricpión del gasto</label>
          {[3, 4].includes(Number(estadoForma.i_tipo_gasto)) ? (
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="descripcion_gasto"
              value={estadoForma.descripcion_gasto}
            >
              {meses.map((mes) => (
                <option key={mes} value={mes}>
                  {mes}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="descripcion_gasto"
              value={estadoForma.descripcion_gasto}
              disabled={!modoEditar}
            />
          )}
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Importe</label>
          <input
            className="form-control"
            type="text"
            onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
            name="f_importe"
            value={estadoForma.f_importe}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Monto a comprobar</label>
          <input
            className="form-control"
            type="text"
            name="f_monto_comprobar"
            value={montoComprobar()}
            disabled
          />
        </div>
        <div className="col-12">
          <hr />
        </div>
        {/* Seccion comprobantes */}
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Comprobantes</h4>
        </div>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Agregar factura</label>
          <input
            className="form-control"
            type="file"
            onChange={agregarFactura}
            name="comprobante"
            accept=".xml"
            ref={fileInput}
            disabled={disableInputFile}
          />
        </div>
        <div className="col-12 mb-3 table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Folio fiscal</th>
                <th>Método de pago</th>
                <th>Clave de pago</th>
                <th>Forma de pago</th>
                <th>Impuestos retenedios</th>
                <th>Total</th>
                <th>
                  <i className="bi bi-trash"></i>
                </th>
              </tr>
            </thead>
            <tbody>
              {estadoForma.comprobantes.map((comprobante) => {
                const {
                  id,
                  folio_fiscal,
                  metodo_pago,
                  clave_forma_pago,
                  forma_pago,
                  f_retenciones,
                  f_total,
                } = comprobante
                return (
                  <tr key={folio_fiscal}>
                    <td>{folio_fiscal}</td>
                    <td>{metodo_pago}</td>
                    <td>{clave_forma_pago}</td>
                    <td>{forma_pago}</td>
                    <td>{f_retenciones}</td>
                    <td>{f_total}</td>
                    <td>
                      {!id && (
                        <button
                          type="button"
                          className="btn btn-dark btn-sm"
                          onClick={() => quitarFactura(folio_fiscal)}
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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

export { FormaSolicitudPresupuesto }
