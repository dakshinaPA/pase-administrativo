import { createContext, useContext, useEffect, useState } from "react"
// import { useRouter } from "next/router"
import { ApiCall } from "@assets/utils/apiCalls"
import {
  PaisDB,
  EstadoDB,
  TemasSocialesDB,
  RubrosPresupuestalesDB,
} from "@api/models/catalogos.model"

const CatalogosContext = createContext(null)

interface CatalogosDB {
  estados: EstadoDB[]
  paises: PaisDB[]
  temas_sociales: TemasSocialesDB[]
  rubros_presupuestales: RubrosPresupuestalesDB[]
}

const CatalogosProvider = ({ children }) => {
  const estadoInicialCatalogos: CatalogosDB = {
    estados: [],
    paises: [],
    temas_sociales: [],
    rubros_presupuestales: [],
  }

  const [catalogos, setCatalogos] = useState(estadoInicialCatalogos)

  useEffect(() => {
    obtenerTodos()
  }, [])

  const obtenerTodos = async () => {
    const estados = ApiCall.get("/catalogos/estados")
    const paises = ApiCall.get("/catalogos/paises")
    const temas_sociales = ApiCall.get("/catalogos/temas_sociales")
    const rubros_presupuestales = ApiCall.get(
      "/catalogos/rubros_presupuestales"
    )

    const resCombinadas = await Promise.all([
      estados,
      paises,
      temas_sociales,
      rubros_presupuestales,
    ])

    let error = false

    for (const rc of resCombinadas) {
      if (rc.error) {
        error = true
        console.log(rc.data)
      }
    }

    if (!error) {
      setCatalogos({
        estados: resCombinadas[0].data as EstadoDB[],
        paises: resCombinadas[1].data as PaisDB[],
        temas_sociales: resCombinadas[2].data as TemasSocialesDB[],
        rubros_presupuestales: resCombinadas[3]
          .data as RubrosPresupuestalesDB[],
      })
    }
  }

  return (
    <CatalogosContext.Provider value={catalogos}>
      {children}
    </CatalogosContext.Provider>
  )
}

const useCatalogos = () => {
  const catalogos = useContext(CatalogosContext)
  return catalogos
}

export { CatalogosProvider, useCatalogos }
