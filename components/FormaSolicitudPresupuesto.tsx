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
import {
  RegistroContenedor,
  FormaContenedor,
  Contenedor,
} from "@components/Contenedores"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"
import { BtnAccion, BtnCancelar, BtnEditar, BtnRegistrar } from "./Botones"
import {
  ComprobanteSolicitud,
  NotaSolicitud,
  SolicitudPresupuesto,
} from "@models/solicitud-presupuesto.model"
import {
  epochAFecha,
  meses,
  montoALocaleString,
  obtenerBadgeStatusSolicitud,
  obtenerEstatusSolicitud,
  obtenerProyectos,
  obtenerSolicitudes,
} from "@assets/utils/common"
import { Toast } from "./Toast"
import { useErrores } from "@hooks/useErrores"
import { MensajeError } from "./Mensajes"
import Link from "next/link"
import { useSesion } from "@hooks/useSesion"
import {
  Banner,
  EstadoInicialBannerProps,
  estadoInicialBanner,
  mensajesBanner,
} from "./Banner"
import {
  estatusSolicitud,
  rolesUsuario,
  tiposGasto,
  tiposTitularesSolicitud,
} from "@assets/utils/constantes"

type ActionTypes =
  | "ERROR_API"
  | "CARGAR_PROYECTOS"
  | "NO_PROYECTOS"
  | "CARGA_INICIAL"
  | "HANDLE_CHANGE"
  | "AGREGAR_FACTURA"
  | "QUITAR_FACTURA"
  | "CAMBIO_TIPO_GASTO"
  | "CAMBIO_PARTIDA_PRESUPUESTAL"
  | "CAMBIO_TITULAR"
  | "CAMBIO_ESTATUS"
  | "CAMBIO_PROYECTO"
  | "NUEVO_REGISTRO"
  | "RECARGAR_NOTAS"

interface ActionProps {
  type: ActionTypes
  payload?: any
}

interface EstadoProps {
  cargaInicial: SolicitudPresupuesto
  forma: SolicitudPresupuesto
  proyectosDB: ProyectoMin[]
  dataProyecto: DataProyecto
  aceptarTerminos: boolean
  toast: {
    show: boolean
    mensaje: string
  }
  isLoading: boolean
  banner: EstadoInicialBannerProps
  modoEditar: boolean
  // mensajeNota: string
}

// interface DataTipoGasto {
//   partidas_presupuestales: RubroMinistracion[]
//   titulares: (ColaboradorProyecto | ProveedorProyecto)[]
// }

const reducer = (state: EstadoProps, action: ActionProps): EstadoProps => {
  const { type, payload } = action

  switch (type) {
    case "ERROR_API":
      return {
        ...state,
        banner: {
          show: true,
          mensaje: payload,
          tipo: "error",
        },
        isLoading: false,
      }
    case "CARGAR_PROYECTOS":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_proyecto: payload[0].id,
        },
        proyectosDB: payload,
        isLoading: false,
      }
    case "NO_PROYECTOS":
      return {
        ...state,
        banner: {
          show: true,
          mensaje: mensajesBanner.sinProyectos,
          tipo: "warning",
        },
        isLoading: false,
      }
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
        forma: {
          ...state.forma,
          comprobantes: [...state.forma.comprobantes, payload],
        },
      }
    case "QUITAR_FACTURA":
      const comprobantesFiltrados = state.forma.comprobantes.filter(
        (comp) => comp.folio_fiscal !== payload
      )

      return {
        ...state,
        forma: {
          ...state.forma,
          comprobantes: comprobantesFiltrados,
        },
      }
    case "CAMBIO_PROYECTO":
      return {
        ...state,
        forma: {
          ...state.forma,
          i_tipo_gasto: 0,
          id_partida_presupuestal: 0,
          titular_cuenta: "",
          descripcion_gasto: "",
          comprobantes: [],
        },
      }
    case "CAMBIO_TIPO_GASTO":
      return {
        ...state,
        forma: {
          ...state.forma,
          id_partida_presupuestal: payload.id_partida_presupuestal,
          titular_cuenta: "",
          descripcion_gasto: payload.descripcion_gasto,
          comprobantes: [],
        },
      }
    case "CAMBIO_PARTIDA_PRESUPUESTAL":
      return {
        ...state,
        forma: {
          ...state.forma,
          titular_cuenta: "",
          comprobantes: [],
        },
      }
    case "CAMBIO_TITULAR":
      return {
        ...state,
        clabe: payload.clabe,
        banco: payload.banco,
        proveedor: payload.proveedor,
      }
    case "CAMBIO_ESTATUS":
      return {
        ...state,
        forma: {
          ...state.forma,
          i_estatus: payload.i_estatus,
          estatus: payload.estatus,
        },
      }
    case "RECARGAR_NOTAS":
      return {
        ...state,
        forma: {
          ...state.forma,
          notas: payload,
        },
      }
    default:
      return state
  }
}

// const estadoInicialDataProyecto: DataProyecto = {
//   colaboradores: [],
//   proveedores: [],
//   rubros_presupuestales: [],
// }

// const estadoInicialDataTipoGasto: DataTipoGasto = {
//   partidas_presupuestales: [],
//   titulares: [],
// }

const estadoInicialToast = {
  show: false,
  mensaje: "",
}

const FormaSolicitudPresupuesto = () => {
  const { user, status } = useSesion()
  if (status !== "authenticated" || !user) return null

  const router = useRouter()
  const idProyecto = Number(router.query.id)
  const idSolicitud = Number(router.query.idS)
  const modalidad = idSolicitud ? "EDITAR" : "CREAR"

  const estadoInicialForma: SolicitudPresupuesto = {
    id_proyecto: idProyecto || 0,
    proyecto: "",
    i_tipo_gasto: 0,
    // tipo_gasto: "",
    titular_cuenta: "",
    clabe: "",
    banco: "",
    email: "",
    proveedor: "",
    descripcion_gasto: "",
    id_partida_presupuestal: 0,
    // rubro: "",
    f_importe: 0,
    f_retenciones: 0,
    i_estatus: 1,
    comprobantes: [],
    notas: [],
  }

  const estadoInicial: EstadoProps = {
    cargaInicial: estadoInicialForma,
    forma: estadoInicialForma,
    proyectosDB: [],
    dataProyecto: {
      titulares: [],
      rubros_presupuestales: [],
    },
    aceptarTerminos: modalidad === "EDITAR",
    toast: estadoInicialToast,
    isLoading: true,
    banner: estadoInicialBanner,
    modoEditar: !idSolicitud,
  }

  const { formas_pago, regimenes_fiscales } = useCatalogos()
  const [estado, dispatch] = useReducer(reducer, estadoInicial)
  const { error, validarCampos, formRef } = useErrores()
  // const [estado.forma, dispatch] = useReducer(reducer, estadoInicialForma)
  // const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  // const [dataProyecto, setDataProyecto] = useState(estadoInicialDataProyecto)
  // const [dataTipoGasto, setDataTipoGasto] = useState(estadoInicialDataTipoGasto)
  // const [aceptarTerminos, setAceptarTerminos] = useState(Boolean(idSolicitud))
  // const [toastState, setToastState] = useState(estadoInicialToast)
  // const [isLoading, setIsLoading] = useState<boolean>(true)
  // const [estado.modoEditar, setModoEditar] = useState<boolean>(!idSolicitud)
  // const [showBanner, setShowBanner] = useState(estadoInicialBanner)
  // const estatusCarga = useRef(null)
  const fileInput = useRef(null)
  const cbAceptaTerminos = useRef(null)

  useEffect(() => {
    cargarData()
  }, [])

  // useEffect(() => {
  //   cargarDataProyecto()

  //   if (modalidad === "CREAR") {
  //     dispatch({
  //       type: "CAMBIO_PROYECTO",
  //       payload: null,
  //     })
  //   }
  // }, [estadoForma.id_proyecto])

  // useEffect(() => {
  //   if (!estadoForma.i_tipo_gasto) return

  //   let partidas_presupuestales = []
  //   let titulares = []

  //   const payload = {
  //     id_partida_presupuestal: 0,
  //     descripcion_gasto: "",
  //   }

  //   switch (Number(estadoForma.i_tipo_gasto)) {
  //     case 1:
  //     case 5:
  //       partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
  //         (rp) => ![1, 22].includes(rp.id_rubro)
  //       )
  //       break
  //     case 2:
  //       partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
  //         (rp) => rp.id_rubro != 2
  //       )
  //       break
  //     case 3:
  //       partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
  //         (rp) => rp.id_rubro == 2
  //       )
  //       payload.id_partida_presupuestal = 2
  //       payload.descripcion_gasto = "Enero"
  //       break
  //     case 4:
  //       partidas_presupuestales = dataProyecto.rubros_presupuestales.filter(
  //         (rp) => rp.id_rubro == 3
  //       )
  //       payload.id_partida_presupuestal = 3
  //       payload.descripcion_gasto = "Enero"
  //       break
  //     default:
  //   }

  //   setDataTipoGasto({
  //     partidas_presupuestales,
  //     titulares,
  //   })

  //   if (modalidad === "CREAR") {
  //     dispatch({
  //       type: "CAMBIO_TIPO_GASTO",
  //       payload,
  //     })
  //   }
  // }, [estadoForma.i_tipo_gasto])

  // useEffect(() => {
  //   if (!estadoForma.id_partida_presupuestal) return

  //   let titulares = []

  //   switch (Number(estadoForma.i_tipo_gasto)) {
  //     case 1:
  //     case 5:
  //       //muestra todos colaboradores
  //       titulares = dataProyecto.colaboradores.map((colaborador) => ({
  //         ...colaborador,
  //         nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
  //       }))
  //       break
  //     case 2:
  //       //muestra todos los proveedores
  //       titulares = dataProyecto.proveedores.filter(({ i_tipo }) =>
  //         estadoForma.id_partida_presupuestal == 22 ? i_tipo == 3 : i_tipo != 3
  //       )
  //       break
  //     case 3:
  //       //muestra solo colaboradores registrados como asimilados
  //       titulares = dataProyecto.colaboradores
  //         .filter((col) => col.i_tipo == 1)
  //         .map((colaborador) => ({
  //           ...colaborador,
  //           nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
  //         }))
  //       break
  //     case 4:
  //       //muestra solo colaboradores registrados como honorarios
  //       titulares = dataProyecto.colaboradores
  //         .filter((col) => col.i_tipo == 2)
  //         .map((colaborador) => ({
  //           ...colaborador,
  //           nombre: `${colaborador.nombre} ${colaborador.apellido_paterno} ${colaborador.apellido_materno}`,
  //         }))
  //       break
  //     default:
  //   }

  //   setDataTipoGasto((prevState) => ({
  //     ...prevState,
  //     titulares,
  //   }))

  //   if (modalidad == "CREAR") {
  //     dispatch({
  //       type: "CAMBIO_PARTIDA_PRESUPUESTAL",
  //       payload: null,
  //     })
  //   }
  // }, [estadoForma.id_partida_presupuestal])

  // useEffect(() => {
  //   if (!estadoForma.titular_cuenta) {
  //     dispatch({
  //       type: "CAMBIO_TITULAR",
  //       payload: {
  //         clabe: "",
  //         banco: "",
  //         proveedor: "",
  //       },
  //     })
  //     return
  //   }

  //   const matchTitular = dataTipoGasto.titulares.find(
  //     (titular_cuenta) => titular_cuenta.nombre == estadoForma.titular_cuenta
  //   )

  //   if (!matchTitular) {
  //     console.log(matchTitular)
  //     return
  //   }

  //   const payload = {
  //     // @ts-ignore
  //     clabe: matchTitular.clabe || matchTitular.account_number,
  //     // @ts-ignore
  //     banco: matchTitular.banco || matchTitular.bank,
  //     proveedor: "",
  //   }

  //   switch (Number(estadoForma.i_tipo_gasto)) {
  //     case 2:
  //     case 3:
  //     case 4:
  //       payload.proveedor = matchTitular.nombre
  //       break
  //   }

  //   dispatch({
  //     type: "CAMBIO_TITULAR",
  //     payload,
  //   })
  // }, [estadoForma.titular_cuenta])

  // useEffect(() => {
  //   // si es un reembolso el importe debe conincidir con las comprobaciones
  //   if (estadoForma.i_tipo_gasto == 1) {
  //     dispatch({
  //       type: "HANDLE_CHANGE",
  //       payload: {
  //         name: "f_importe",
  //         value: obtenerTotalComprobaciones().toFixed(2),
  //       },
  //     })
  //   }
  // }, [estadoForma.comprobantes.length])

  // useEffect(() => {
  //   //validar que se ejecute solo 1 vez antes de cargar la info de solicitud
  //   if (modalidad === "EDITAR" && !!dataProyecto.rubros_presupuestales.length) {
  //     obtener()
  //   }
  // }, [dataProyecto])

  const obtenerProyectosDB = () => {
    const queryProyectos: QueriesProyecto = idProyecto
      ? { id: idProyecto }
      : { id_responsable: user.id }

    return obtenerProyectos(queryProyectos)
  }

  const cargarData = async () => {
    if (modalidad === "CREAR") {
      const { error, data, mensaje } = await obtenerProyectosDB()
      if (error) {
        console.log(data)
        dispatch({
          type: "ERROR_API",
          payload: mensaje,
        })
      } else {
        const proyectosDB = data as ProyectoMin[]
        if (!proyectosDB.length) {
          dispatch({
            type: "NO_PROYECTOS",
          })
        } else {
          dispatch({
            type: "CARGAR_PROYECTOS",
            payload: proyectosDB,
          })
        }
      }
    }
  }

  // const cargarDataProyecto = async () => {
  //   const idProyecto = estadoForma.id_proyecto
  //   if (!idProyecto) return

  //   const { error, data, mensaje } = await obtenerProyectos({
  //     id: idProyecto,
  //     registro_solicitud: true,
  //     min: false,
  //   })

  //   if (error) {
  //     console.log(data)
  //     setShowBanner({
  //       mensaje,
  //       show: true,
  //       tipo: "error",
  //     })
  //   } else {
  //     const dataProyecto = data as DataProyecto
  //     setDataProyecto(dataProyecto)
  //   }
  // }

  // const obtener = async () => {
  //   setIsLoading(true)
  //   const { error, data, mensaje } = await obtenerSolicitudes({
  //     id: idSolicitud,
  //   })
  //   if (error) {
  //     console.log(data)
  //     setShowBanner({
  //       mensaje,
  //       show: true,
  //       tipo: "error",
  //     })
  //   } else {
  //     const solicitud = data[0] as SolicitudPresupuesto
  //     dispatch({
  //       type: "CARGA_INICIAL",
  //       payload: solicitud,
  //     })
  //     // para que se mantenga el badge
  //     estatusCarga.current = solicitud.i_estatus
  //   }
  //   setIsLoading(false)
  // }

  const registrar = async () => {
    return ApiCall.post("/solicitudes-presupuesto", estado.forma)
  }

  const editar = async () => {
    // cuando rol coparte hace una modificacion y su estatus es rechazada o devolucion,
    // el status debe cambiar a revision nuevamente
    let payload = estado.forma

    if (
      user.id_rol == rolesUsuario.COPARTE &&
      [estatusSolicitud.RECHAZADA, estatusSolicitud.DEVOLUCION].includes(
        estado.forma.i_estatus
      )
    ) {
      payload = {
        ...payload,
        i_estatus: estatusSolicitud.REVISION,
      }
    }
    return ApiCall.put(`/solicitudes-presupuesto/${idSolicitud}`, payload)
  }

  const cancelar = () => {
    // modalidad === "EDITAR" ? setModoEditar(false) : router.back()
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

  const obtenerRegimenXClave = (clave: string) => {
    const regimenMatch = regimenes_fiscales.find((rf) => rf.clave == clave)

    return {
      id: regimenMatch?.id || 0,
      nombre: regimenMatch?.nombre || "",
    }
  }

  const obtenerRegimenXId = (id: number) => {
    const regimenMatch = regimenes_fiscales.find((rf) => rf.id == id)

    return {
      clave: regimenMatch?.clave || "",
      nombre: regimenMatch?.nombre || "",
    }
  }

  const obtenerTotalComprobaciones = () => {
    const totalComprobaciones = estado.forma.comprobantes.reduce(
      (acum, actual) => acum + Number(actual.f_total),
      0
    )

    return totalComprobaciones
  }

  const agregarFactura = (ev) => {
    const [file] = ev.target.files

    const reader = new FileReader()

    reader.onload = async () => {
      const parser = new DOMParser()
      const xml = parser.parseFromString(
        reader.result as string,
        "application/xml"
      )

      //limpiar el input
      fileInput.current.value = ""

      const [comprobante] = xml.getElementsByTagName("cfdi:Comprobante")
      const [timbre] = xml.getElementsByTagName("tfd:TimbreFiscalDigital")
      const [emisor] = xml.getElementsByTagName("cfdi:Emisor")
      const [receptor] = xml.getElementsByTagName("cfdi:Receptor")
      const impuestos = xml.getElementsByTagName("cfdi:Impuestos")
      const [concepto] = xml.getElementsByTagName("cfdi:Concepto")

      const folio_fiscal = timbre?.getAttribute("UUID")
      const claveRegimenFiscalReceptor = receptor.getAttribute(
        "RegimenFiscalReceptor"
      )
      const usoCFDI = receptor.getAttribute("UsoCFDI")
      const f_total = comprobante?.getAttribute("Total")
      const f_claveProdServ = concepto?.getAttribute("ClaveProdServ")
      const clavesProdServCombustibles = ["15101514", "15101515", "15101505"]
      const metodo_pago = comprobante?.getAttribute("MetodoPago") as
        | "PUE"
        | "PPD"
      const clave_forma_pago = comprobante?.getAttribute("FormaPago")
      const formaPago = asignarIdFormaPAgo(clave_forma_pago)
      const claveRegimenFiscalEmisor = emisor?.getAttribute("RegimenFiscal")
      const rfcEmisor = emisor?.getAttribute("Rfc")
      const regimenFiscalEmisor = obtenerRegimenXClave(claveRegimenFiscalEmisor)
      const regimenFiscalReceptor = obtenerRegimenXClave(
        claveRegimenFiscalReceptor
      )

      try {
        if (!f_total) throw "Total de factura no identificado"
        if (!clave_forma_pago) throw "Forma de pago no identificado"
        if (!claveRegimenFiscalEmisor || !regimenFiscalEmisor.id)
          throw "Regimen fiscal de emisor no identificado"
        if (!folio_fiscal) throw "Folio fiscal no encontrado"
        if (!metodo_pago) throw "Método de pago no identificado"
        if (claveRegimenFiscalReceptor !== "603" || !regimenFiscalReceptor.id)
          throw "Regimen fiscal de receptor inválido"
        if (usoCFDI !== "G03") throw "Uso CFDI inválido"
        if (clave_forma_pago === "01" && Number(f_total) >= 2000)
          throw "Pago en efectivo mayor o igual a 2000 no permitido"
        if (
          clavesProdServCombustibles.includes(f_claveProdServ) &&
          clave_forma_pago === "01"
        )
          throw "Combustibles con pago en efectivo no permitido"

        //revisar que folio fiscal no se repita
        const matchFolioFiscal = estado.forma.comprobantes.find(
          (comprobante) => comprobante.folio_fiscal == folio_fiscal
        )
        if (matchFolioFiscal) throw "factura repetida"
      } catch (error) {
        console.log(error)
        // setToastState({
        //   show: true,
        //   mensaje: error,
        // })
        return
      }

      // buscar si el folio que se quiere subir ya existe en base de datos
      const reFactura = await ApiCall.get(
        `/solicitudes-presupuesto/buscar-factura?folio=${folio_fiscal}`
      )
      if (reFactura.error) {
        console.log(reFactura.data)
        return
      } else {
        if (reFactura.data) {
          // setToastState({
          //   show: true,
          //   mensaje: reFactura.mensaje,
          // })
          return
        }
      }

      let f_retenciones = ""
      let f_iva = ""
      let f_isr = ""

      //a veces impuestos es mas de un tag y hay que buscarlo
      for (const imp of impuestos) {
        const impuestos = imp.getAttribute("TotalImpuestosRetenidos")
        if (impuestos) {
          // dividir en IVA e ISR
          const retenciones = imp.getElementsByTagName("cfdi:Retencion")

          for (const ret of retenciones) {
            const tipoImpuesto = ret.getAttribute("Impuesto")
            const importe = ret.getAttribute("Importe")

            if (tipoImpuesto === "001") {
              f_isr = importe
            } else if (tipoImpuesto === "002") {
              f_iva = importe
            }
          }

          f_retenciones = impuestos
        }
      }

      // si hay rteenciones pero iva o isr no se calcularon correctamente
      if (f_retenciones && (!f_iva || !f_isr)) {
        console.log({ f_retenciones, f_iva, f_isr })
        // setToastState({
        //   show: true,
        //   mensaje: "Los impuestos no se han calculado correctamente",
        // })
        return
      }

      const dataComprobante: ComprobanteSolicitud = {
        folio_fiscal,
        rfc_emisor: rfcEmisor,
        id_regimen_fiscal_emisor: regimenFiscalEmisor.id,
        id_regimen_fiscal_receptor: regimenFiscalReceptor.id,
        i_metodo_pago: asignarIMetodoPago(metodo_pago),
        metodo_pago,
        id_forma_pago: formaPago.id,
        clave_forma_pago: clave_forma_pago,
        forma_pago: formaPago.nombre,
        f_total,
        f_retenciones: f_retenciones || "",
        f_iva,
        f_isr,
        uso_cfdi: usoCFDI,
      }

      console.log(dataComprobante)

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

  const aceptaTerminos = () => {
    let NoError = true

    if (modalidad === "CREAR" && !estado.aceptarTerminos) {
      NoError = false
      cbAceptaTerminos.current.focus()
    }

    return NoError
  }

  const validarForma = () => {
    const campos = {
      id_proyecto: estado.forma.id_proyecto,
      i_tipo_gasto: estado.forma.i_tipo_gasto,
      id_partida_presupuestal: estado.forma.id_partida_presupuestal,
      titular_cuenta: estado.forma.titular_cuenta,
      clabe_account: estado.forma.clabe,
      banco: estado.forma.banco,
      email: estado.forma.email,
      proveedor: estado.forma.proveedor,
      descripcion_gasto: estado.forma.descripcion_gasto,
      f_importe: estado.forma.f_importe,
      f_retenciones: estado.forma.f_retenciones,
      f_retenciones_extranjeros: estado.forma.f_retenciones,
    }

    if (estado.forma.i_tipo_gasto == tiposGasto.GASTOS_X_COMPROBAR) {
      delete campos.proveedor
    }

    if (
      [tiposGasto.ASIMILADOS, tiposGasto.HONORARIOS].includes(
        Number(estado.forma.i_tipo_gasto)
      )
    ) {
      delete campos.descripcion_gasto
    }

    if (user.id_rol == rolesUsuario.COPARTE || estado.forma.i_tipo_gasto != tiposGasto.ASIMILADOS) {
      delete campos.f_retenciones
    }

    if (user.id_rol == rolesUsuario.COPARTE || estado.forma.id_partida_presupuestal != 22) {
      delete campos.f_retenciones_extranjeros
    }

    return validarCampos(campos)
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    if (!validarForma()) return
    if (!aceptaTerminos()) return
    console.log(estado.forma)

    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()

    if (error) {
      console.log(data)
      // setShowBanner({
      //   mensaje,
      //   show: true,
      //   tipo: "error",
      // })
    } else {
      if (modalidad === "CREAR") {
        router.push(`/solicitudes-presupuesto`)
      } else {
        // estatusCarga.current = estadoForma.i_estatus
        // await obtener()
      }
    }
  }

  const disableInputImporte =
    !estado.modoEditar ||
    estado.forma.i_tipo_gasto == ti ||
    user.id_rol != 3 ||
    [2, 4].includes(estado.forma.i_estatus)

  const esGastoAsimilados = estado.forma.i_tipo_gasto == 3
  const noTipoGasto = !estado.forma.i_tipo_gasto
  const disableInputFile =
    !estado.modoEditar || (esGastoAsimilados && user.id_rol == 3) || noTipoGasto

  const disableInputProveedor =
    !estado.modoEditar ||
    estado.forma.i_tipo_gasto != 1 ||
    user.id_rol != 3 ||
    estado.forma.i_estatus != 1

  const disableSelectPartidaPresupuestal = [
    tiposGasto.ASIMILADOS,
    tiposGasto.HONORARIOS,
  ].includes(Number(estado.forma.i_tipo_gasto))

  const disableInputXEstatus =
    !estado.modoEditar || user.id_rol != 3 || estado.forma.i_estatus != 1

  const showTipoGastoAsimilados =
    estado.dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 2) &&
    !!estado.dataProyecto.titulares.filter(
      (tit) =>
        tit.i_tipo_titular === tiposTitularesSolicitud["COLABORADOR"] &&
        tit.i_tipo == 1
    ).length

  const showTipoGastoHonorarios =
    dataProyecto.rubros_presupuestales.some((rp) => rp.id_rubro == 3) &&
    !!dataProyecto.colaboradores.filter((col) => col.i_tipo == 2).length

  const showBtnEditar =
    !estado.modoEditar &&
    idSolicitud &&
    (user.id == estado.forma.id_responsable || [1, 2].includes(user.id_rol))

  const showRetenciones =
    user.id_rol != 3 &&
    (estado.forma.i_tipo_gasto == 3 ||
      estado.forma.id_partida_presupuestal == 22)
  // estado.forma.i_estatus == 1

  const total_comprobantes = estado.forma.comprobantes.reduce(
    (acum, { f_total }) => acum + Number(f_total),
    0
  )

  const showComprobantesNecesarios =
    estado.forma.i_tipo_gasto != 3 && estado.forma.id_partida_presupuestal != 22

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
    <>
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
            {showBtnEditar && <BtnEditar onClick={() => setModoEditar(true)} />}
          </div>
        </div>
        <FormaContenedor onSubmit={handleSubmit} formaRef={formRef}>
          {modalidad === "EDITAR" && estatusCarga.current && (
            <div className="col-12 mb-3">
              <h5>
                <span
                  className={`badge bg-${obtenerBadgeStatusSolicitud(
                    estatusCarga.current
                  )}`}
                >
                  {obtenerEstatusSolicitud(estatusCarga.current)}
                </span>
              </h5>
            </div>
          )}
          {modalidad === "CREAR" ? (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Proyecto</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="id_proyecto"
                  value={estado.forma.id_proyecto}
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
                {error.campo == "id_proyecto" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="i_tipo_gasto"
                  value={estado.forma.i_tipo_gasto}
                >
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
                {error.campo == "i_tipo_gasto" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <select
                  className="form-control"
                  onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                  name="id_partida_presupuestal"
                  value={estado.forma.id_partida_presupuestal}
                  disabled={disableSelectPartidaPresupuestal}
                >
                  <option value="0" disabled>
                    Selecciona una opción
                  </option>
                  {dataTipoGasto.partidas_presupuestales.map(
                    ({ id_rubro, rubro }) => (
                      <option key={id_rubro} value={id_rubro}>
                        {rubro}
                      </option>
                    )
                  )}
                </select>
                {error.campo == "id_partida_presupuestal" && (
                  <MensajeError mensaje={error.mensaje} />
                )}
              </div>
            </>
          ) : (
            <>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Proyecto</label>
                <input
                  className="form-control"
                  value={estado.forma.proyecto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Tipo de gasto</label>
                <input
                  className="form-control"
                  value={estado.forma.tipo_gasto}
                  disabled
                />
              </div>
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <label className="form-label">Partida presupuestal</label>
                <input
                  className="form-control"
                  value={estado.forma.rubro}
                  disabled
                />
              </div>
            </>
          )}
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Titular cuenta</label>
            <select
              className="form-control"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="titular_cuenta"
              value={estado.forma.titular_cuenta}
              disabled={disableInputXEstatus}
            >
              <option value="" disabled>
                Selecciona titular
              </option>
              {dataTipoGasto.titulares.map((titular_cuenta) => (
                <option key={titular_cuenta.id} value={titular_cuenta.nombre}>
                  {titular_cuenta.nombre}
                </option>
              ))}
            </select>
            {error.campo == "titular_cuenta" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">CLABE / cuenta</label>
            <input
              className="form-control"
              type="text"
              name="clabe_account"
              value={estado.forma.clabe}
              disabled
            />
            {error.campo == "clabe_account" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Banco</label>
            <input
              className="form-control"
              type="text"
              name="banco"
              value={estado.forma.banco}
              disabled
            />
            {error.campo == "banco" && <MensajeError mensaje={error.mensaje} />}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="email"
              value={estado.forma.email}
              disabled={disableInputXEstatus}
            />
            {error.campo == "email" && <MensajeError mensaje={error.mensaje} />}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Proveedor</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="proveedor"
              value={estado.forma.proveedor}
              disabled={disableInputProveedor}
              placeholder="emisor de la factura"
            />
            {error.campo == "proveedor" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Descripción del gasto</label>
            {[3, 4].includes(Number(estado.forma.i_tipo_gasto)) ? (
              <select
                className="form-control"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                name="descripcion_gasto"
                value={estado.forma.descripcion_gasto}
                disabled={disableInputXEstatus}
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
                value={estado.forma.descripcion_gasto}
                disabled={disableInputXEstatus}
              />
            )}
            {error.campo == "descripcion_gasto" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <label className="form-label">Importe</label>
            <input
              className="form-control"
              type="text"
              onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
              name="f_importe"
              value={estado.forma.f_importe}
              disabled={disableInputImporte}
            />
            {error.campo == "f_importe" && (
              <MensajeError mensaje={error.mensaje} />
            )}
          </div>
          {showRetenciones && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Retenciones</label>
              <input
                className="form-control"
                type="text"
                name="f_retenciones"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                value={estado.forma.f_retenciones}
                disabled={!estado.modoEditar || estado.forma.i_estatus != 1}
              />
              {error.campo == "f_retenciones" && (
                <MensajeError mensaje={error.mensaje} />
              )}
            </div>
          )}
          {showComprobantesNecesarios && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Monto a comprobar</label>
              <input
                className="form-control"
                type="text"
                value={(
                  Number(estado.forma.f_importe) - obtenerTotalComprobaciones()
                ).toFixed(2)}
                disabled
              />
            </div>
          )}
          {user.id_rol != 3 && (
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Estatus</label>
              <select
                className="form-control"
                name="i_estatus"
                onChange={(e) => handleChange(e, "HANDLE_CHANGE")}
                value={estado.forma.i_estatus}
                disabled={!estado.modoEditar}
              >
                <option value="1">En revisión</option>
                <option value="2">Autorizada</option>
                <option value="3">Rechazada</option>
                <option value="4">Procesada</option>
                <option value="5">Devolución</option>
              </select>
            </div>
          )}
          {modalidad === "CREAR" && (
            <div className="col-12 mb-3 d-flex justify-content-end">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  onChange={() => setAceptarTerminos(!aceptarTerminos)}
                  ref={cbAceptaTerminos}
                  checked={aceptarTerminos}
                />
                <label className="form-check-label">
                  Acepto los
                  <Link href="/legal" className="color1 fw-bold">
                    {" "}
                    términos y condiciones
                  </Link>
                </label>
              </div>
            </div>
          )}
          {/* Seccion comprobantes */}
          {showComprobantesNecesarios && (
            <>
              <div className="col-12">
                <hr />
              </div>
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
                  <thead className="table-light">
                    <tr className="color1">
                      <th>Folio fiscal</th>
                      <th>RFC emisor</th>
                      <th>Régimen fiscal emisor</th>
                      <th>Régimen fiscal receptor</th>
                      <th>Método de pago</th>
                      <th>Forma de pago</th>
                      <th>Uso de CFDI</th>
                      <th>Retención ISR</th>
                      <th>Retención IVA</th>
                      <th>Impuestos retenidos</th>
                      <th>Total</th>
                      {estado.modoEditar && (
                        <th>
                          <i className="bi bi-trash"></i>
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {estado.forma.comprobantes.map((comprobante) => {
                      const {
                        id,
                        folio_fiscal,
                        metodo_pago,
                        clave_forma_pago,
                        forma_pago,
                        uso_cfdi,
                        rfc_emisor,
                        id_regimen_fiscal_emisor,
                        id_regimen_fiscal_receptor,
                        f_iva,
                        f_isr,
                        f_retenciones,
                        f_total,
                      } = comprobante

                      const regimenFiscalEmisor = obtenerRegimenXId(
                        id_regimen_fiscal_emisor
                      )
                      const regimenFiscalReceptor = obtenerRegimenXId(
                        id_regimen_fiscal_receptor
                      )

                      return (
                        <tr key={folio_fiscal}>
                          <td>{folio_fiscal}</td>
                          <td>{rfc_emisor}</td>
                          <td>
                            {regimenFiscalEmisor.clave} -{" "}
                            {regimenFiscalEmisor.nombre}
                          </td>
                          <td>
                            {regimenFiscalReceptor.clave} -{" "}
                            {regimenFiscalReceptor.nombre}
                          </td>
                          <td>{metodo_pago}</td>
                          <td>
                            {clave_forma_pago} - {forma_pago}
                          </td>
                          <td>{uso_cfdi}</td>
                          <td>{montoALocaleString(Number(f_isr) || 0)}</td>
                          <td>{montoALocaleString(Number(f_iva) || 0)}</td>
                          <td>
                            {montoALocaleString(Number(f_retenciones) || 0)}
                          </td>
                          <td>{montoALocaleString(Number(f_total))}</td>
                          {estado.modoEditar && (
                            <td>
                              <BtnAccion
                                margin={false}
                                icono="bi-x-circle"
                                onclick={() => quitarFactura(folio_fiscal)}
                                title="eliminar factura"
                              />
                            </td>
                          )}
                        </tr>
                      )
                    })}
                    <tr>
                      <td colSpan={10}></td>
                      <td>{montoALocaleString(total_comprobantes)}</td>
                      {estado.modoEditar && <td></td>}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
          {estado.modoEditar && (
            <div className="col-12 text-end">
              <BtnCancelar onclick={cancelar} margin={"r"} />
              <BtnRegistrar modalidad={modalidad} margin={false} />
            </div>
          )}
          {modalidad === "EDITAR" && (
            <Notas notas={estado.forma.notas} dispatch={dispatch} user={user} />
          )}
        </FormaContenedor>
      </RegistroContenedor>
      <Toast
        estado={toastState}
        cerrar={() =>
          setToastState((prevState) => ({ ...prevState, show: false }))
        }
      />
    </>
  )
}

const Notas = ({ notas, dispatch, user }) => {
  const router = useRouter()
  const idSolicitud = Number(router.query.idS)
  const [mensajeNota, setMensajeNota] = useState<string>("")
  const inputNota = useRef(null)

  const agregarNota = async () => {
    if (mensajeNota.length < 10) {
      inputNota.current.focus()
      return
    }

    const cr = await ApiCall.post(
      `/solicitudes-presupuesto/${idSolicitud}/notas`,
      {
        id_usuario: user.id,
        mensaje: mensajeNota,
      }
    )
    if (cr.error) {
      console.log(cr.data)
    } else {
      //limpiar el input
      setMensajeNota("")

      const re = await ApiCall.get(
        `/solicitudes-presupuesto/${idSolicitud}/notas`
      )
      if (re.error) {
        console.log(re.data)
      } else {
        const notasDB = re.data as NotaSolicitud[]
        dispatch({
          type: "RECARGAR_NOTAS",
          payload: notasDB,
        })
      }
    }
  }

  return (
    <div className="row my-3">
      <div className="col-12 mb-3">
        <h3 className="color1 mb-0">Notas</h3>
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
            {notas.map(({ id, usuario, mensaje, dt_registro }) => (
              <tr key={id}>
                <td>{usuario}</td>
                <td>{mensaje}</td>
                <td>{epochAFecha(dt_registro)}</td>
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
        />
      </div>
      <div className="col-12 col-md-3 mb-3 text-end">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={agregarNota}
        >
          Agregar nota +
        </button>
      </div>
    </div>
  )
}

export { FormaSolicitudPresupuesto }
