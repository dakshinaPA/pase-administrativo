import { createContext, useContext, useEffect, useState } from "react"
// import { useRouter } from "next/router"
import { ApiCall } from "@assets/utils/apiCalls"
import {
  PaisDB,
  EstadoDB,
  TemasSocialesDB,
  RubrosPresupuestalesDB,
  BancosDB,
} from "@api/models/catalogos.model"

const CatalogosContext = createContext(null)

interface CatalogosDB {
  estados: EstadoDB[]
  paises: PaisDB[]
  temas_sociales: TemasSocialesDB[]
  rubros_presupuestales: RubrosPresupuestalesDB[]
  bancos: BancosDB[]
}

const CatalogosProvider = ({ children }) => {
  const estadoInicialCatalogos: CatalogosDB = {
    estados: [],
    paises: [],
    temas_sociales: [],
    rubros_presupuestales: [],
    bancos: [],
  }

  const [catalogos, setCatalogos] = useState(estadoInicialCatalogos)

  useEffect(() => {
    obtenerTodos()
  }, [])

  const obtenerTodos = async () => {
    const catalogos = await ApiCall.get("/catalogos")
    if (catalogos.error) {
      console.log(catalogos.data)
    } else {
      setCatalogos(catalogos.data as CatalogosDB)
    }
  }

  return (
    <CatalogosContext.Provider value={catalogos}>
      {children}
    </CatalogosContext.Provider>
  )
}

const useCatalogos = () => {
  const catalogos: CatalogosDB = useContext(CatalogosContext)
  return catalogos
}

export { CatalogosProvider, useCatalogos }
