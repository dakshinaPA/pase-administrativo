import { QueriesProyecto } from "@models/proyecto.model"
import { ApiCall } from "./apiCalls"
import { QueriesCoparte } from "@models/coparte.model"
import { QueriesUsuario } from "@models/usuario.model"
import {
  IMetodosPAgo,
  MetodosPAgo,
  QueriesSolicitud,
} from "@models/solicitud-presupuesto.model"
import { text } from "stream/consumers"

const aMinuscula = (clave: string) => clave.toLowerCase()

const montoALocaleString = (f_monto: number) => {
  return Number(Number(f_monto)).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  })
  // return Number(f_monto).toFixed(2)
}

const epochAFecha = (epoch: string): string => {
  let fecha_registro = new Date(Number(epoch) * 1000)
  return fecha_registro.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

const inputDateAformato = (fecha: string): string => {
  const [anio, mes, dia] = fecha.split("-")
  return `${dia}/${mes}/${anio}`
}

const inputDateAEpoch = (InputDate: string): number => {
  const InputDateAFecha = new Date(InputDate).valueOf() / 1000
  return InputDateAFecha
}

const fechaActualAEpoch = () => {
  const fechaHoyEpoch = Date.now()
  const fechaEpoch = (fechaHoyEpoch / 1000).toFixed()
  return fechaEpoch
}

const fechaActualInputDate = () => {
  //regresa la fecha actual para input date
  const dt = new Date()
  const dtFormatoMX = dt.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  const [dia, mes, anio] = dtFormatoMX.split("/")
  const dtAformatoInput = `${anio}-${mes}-${dia}`
  return dtAformatoInput
}

const fechaMasDiasFutuosString = (dt_inicio: string, dias: number) => {
  const dtInicio = new Date(dt_inicio)
  //agregar 1 dia
  dtInicio.setDate(dtInicio.getDate() + (dias + 1))
  const dtAString = dtInicio.toLocaleDateString("es-MX", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
  const [dia, mes, anio] = dtAString.split("/")
  const dtAFormatoInput = `${anio}-${mes}-${dia}`
  return dtAFormatoInput
}

const fechaMasMesesFutuosString = (dt_inicio: string, meses: number) => {
  const dtInicio = new Date(dt_inicio)
  dtInicio.setDate(dtInicio.getDate() + 1)
  dtInicio.setMonth(dtInicio.getMonth() + meses)
  const dtAString = dtInicio.toLocaleDateString("es-MX", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
  const [dia, mes, anio] = dtAString.split("/")
  const dtAFormatoInput = `${anio}-${mes}-${dia}`
  return dtAFormatoInput
}

const obtenerUsuarios = (queries: QueriesUsuario) => {
  const { id, id_rol, id_coparte, min = false } = queries

  let url = "/usuarios"

  if (id) {
    url += `/${id}`
  } else if (id_rol) {
    url += `?id_rol=${id_rol}`
  } else if (id_coparte) {
    url += `?id_coparte=${id_coparte}`
  }

  if (min) {
    url += "&min=true"
  }

  return ApiCall.get(url)
}

const obtenerCopartes = (queries: QueriesCoparte) => {
  const { id, id_admin, min = true } = queries

  let url = "/copartes"

  if (id) {
    url += `/${id}`
  } else if (id_admin) {
    url += `?id_admin=${id_admin}`
  }

  if (min) {
    url += `${id_admin ? "&" : "?"}min=true`
  }
  return ApiCall.get(url)
}

const obtenerFinanciadores = (min = true) => {
  let url = "/financiadores"
  if (min) {
    url += "?min=true"
  }
  return ApiCall.get(url)
}

const obtenerProyectos = (queries: QueriesProyecto) => {
  const {
    id,
    id_coparte,
    id_responsable,
    id_admin,
    min = true,
  } = queries
  let url = `/proyectos`

  if (id) {
    url += `/${id}`
  } else if (id_coparte) {
    url += `?id_coparte=${id_coparte}`
  } else if (id_responsable) {
    url += `?id_responsable=${id_responsable}`
  } else if (id_admin) {
    url += `?id_admin=${id_admin}`
  }

  if (min) {
    if (id) {
      url += "?min=true"
    } else {
      url += "&min=true"
    }
  }
  return ApiCall.get(url)
}

const obtenerMinistraciones = (id_proyecto: number) => {
  let url = `/proyectos/${id_proyecto}/ministraciones`
  return ApiCall.get(url)
}

const obtenerColaboradores = (id_proyecto?: number, id?: number) => {
  let url = ""

  if (id) {
    url = `/colaboradores/${id}`
  } else if (id_proyecto) {
    url = `/proyectos/${id_proyecto}/colaboradores`
  }

  return ApiCall.get(url)
}

const obtenerProveedores = (id_proyecto?: number, id?: number) => {
  let url = ""

  if (id) {
    url = `/proveedores/${id}`
  } else if (id_proyecto) {
    url = `/proyectos/${id_proyecto}/proveedores`
  }

  return ApiCall.get(url)
}

const obtenerSolicitudes = (queries: QueriesSolicitud) => {
  const {
    id,
    id_coparte,
    id_proyecto,
    id_responsable,
    id_admin,
    i_estatus,
    titular,
    dt_inicio,
    dt_fin,
    limit,
  } = queries
  let url = "/solicitudes-presupuesto"

  if (id) {
    url += `/${id}`
  }

  url += "?default=0"

  if (id_coparte) {
    url += `&id_coparte=${id_coparte}`
  } else if (id_proyecto) {
    url += `&id_proyecto=${id_proyecto}`
  }

  if (id_responsable) {
    url += `&id_responsable=${id_responsable}`
  }
  if (id_admin) {
    url += `&id_admin=${id_admin}`
  }
  if (i_estatus) {
    url += `&i_estatus=${i_estatus}`
  }
  if (titular) {
    url += `&titular=${titular}`
  }
  if (dt_inicio) {
    url += `&dt_inicio=${dt_inicio}`
  }
  if (dt_fin) {
    url += `&dt_fin=${dt_fin}`
  }
  if (limit) {
    url += `&limit=${limit}`
  }

  return ApiCall.get(url)
}

const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const obtenerBadgeStatusSolicitud = (i_status: number) => {
  switch (Number(i_status)) {
    case 1:
      return "primary"
    case 2:
      return "success"
    case 3:
      return "danger"
    case 4:
      return "info"
    case 5:
      return "warning"
  }
}

const obtenerEstatusSolicitud = (i_estatus: number) => {
  switch (Number(i_estatus)) {
    case 1:
      return "Revisión"
    case 2:
      return "Autorizada"
    case 3:
      return "Rechazada"
    case 4:
      return "Procesada"
    case 5:
      return "Devolución"
  }
}

const obtenerMetodoPago = (i_metodo_pago: IMetodosPAgo): MetodosPAgo => {
  return i_metodo_pago == 1 ? "PUE" : "PPD"
}

const quitarAcentos = (texto: string) =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

const textoAmasyuscula = (texto: string) =>
  texto.toUpperCase()

const textoMayusculaSinAcentos = (texto: string) => {
  const txtSinAcento = quitarAcentos(texto)
  const txtMayuscula = textoAmasyuscula(txtSinAcento)
  return txtMayuscula.trim()
} 

export {
  meses,
  aMinuscula,
  epochAFecha,
  fechaActualAEpoch,
  inputDateAformato,
  obtenerUsuarios,
  obtenerFinanciadores,
  obtenerCopartes,
  obtenerProyectos,
  obtenerColaboradores,
  obtenerProveedores,
  obtenerSolicitudes,
  obtenerMinistraciones,
  fechaActualInputDate,
  obtenerBadgeStatusSolicitud,
  obtenerEstatusSolicitud,
  montoALocaleString,
  inputDateAEpoch,
  fechaMasDiasFutuosString,
  fechaMasMesesFutuosString,
  obtenerMetodoPago,
  textoMayusculaSinAcentos
}
