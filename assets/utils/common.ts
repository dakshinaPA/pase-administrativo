import { ApiCall } from "./apiCalls"

const determinarNombreArchivo = (archivo) => {
  if (!archivo) {
    return { nombre: "" }
  }

  const { name, type } = archivo
  const [tipo, extension] = type.split("/")
  const nombreArchivo =
    name.length > 10 ? `${name.substring(0, 10)}...${extension}` : name
  const icono = tipo === "image" ? "bi-file-image" : "bi-filetype-pdf"

  return {
    nombre: nombreArchivo,
    icono,
  }
}

const aMinuscula = (clave: string) => clave.toLowerCase()

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

const fechaActualAEpoch = () => {
  const fechaHoyEpoch = Date.now()
  const fechaEpoch = (fechaHoyEpoch / 1000).toFixed()
  return fechaEpoch
}

const obtenerCopartesAdmin = async (id_admin: number, min = true) => {
  let url = `/copartes?id_admin=${id_admin}`
  if (min) {
    url += "&min=true"
  }
  return await ApiCall.get(url)
}

const obtenerCopartes = async (id_coparte: number, min = true) => {
  let url = "/copartes"

  if(id_coparte){
    url += `/${id_coparte}`
  }

  if (min) {
    url += "?min=true"
  }
  return await ApiCall.get(url)
}

const obtenerFinanciadores = async (min = true) => {
  let url = "/financiadores"
  if (min) {
    url += "?min=true"
  }
  return await ApiCall.get(url)
}

const obtenerProyectosUsuario = async (id_responsable: number, min = true) => {
  let url = `/proyectos?id_responsable=${id_responsable}`
  if (min) {
    url += "&min=true"
  }
  return await ApiCall.get(url)
}

const estadosRepublica = [
  { id: 1, nombre: "Aguascalientes" },
  { id: 2, nombre: "Baja California" },
  { id: 3, nombre: "Baja California Sur" },
  { id: 4, nombre: "Campeche" },
  { id: 5, nombre: "Coahuila" },
  { id: 6, nombre: "Colima" },
  { id: 7, nombre: "Chiapas" },
  { id: 8, nombre: "Chihuahua" },
  { id: 9, nombre: "Durango" },
  { id: 10, nombre: "Distrito Federal" },
  { id: 11, nombre: "Guanajuato" },
  { id: 12, nombre: "Guerrero" },
  { id: 13, nombre: "Hidalgo" },
  { id: 14, nombre: "Jalisco" },
  { id: 15, nombre: "México" },
  { id: 16, nombre: "Michoacán" },
  { id: 17, nombre: "Morelos" },
  { id: 18, nombre: "Nayarit" },
  { id: 19, nombre: "Nuevo León" },
  { id: 20, nombre: "Oaxaca" },
  { id: 21, nombre: "Puebla" },
  { id: 22, nombre: "Querétaro" },
  { id: 23, nombre: "Quintana Roo" },
  { id: 24, nombre: "San Luis Potosí," },
  { id: 25, nombre: "Sinaloa" },
  { id: 26, nombre: "Sonora" },
  { id: 27, nombre: "Tabasco" },
  { id: 28, nombre: "Tamaulipas" },
  { id: 29, nombre: "Tlaxcala" },
  { id: 30, nombre: "Veracruz" },
  { id: 31, nombre: "Yucatán" },
  { id: 32, nombre: "Zacatecas" },
]

export {
  determinarNombreArchivo,
  estadosRepublica,
  aMinuscula,
  epochAFecha,
  fechaActualAEpoch,
  inputDateAformato,
  obtenerCopartesAdmin,
  obtenerFinanciadores,
  obtenerCopartes,
  obtenerProyectosUsuario
}
