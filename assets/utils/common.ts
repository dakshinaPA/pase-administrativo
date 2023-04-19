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

export { determinarNombreArchivo, estadosRepublica, aMinuscula }
