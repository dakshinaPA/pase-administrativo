import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Proyecto } from "@models/proyecto.model"
// import { CoparteMin } from "@models/coparte.model"
import { FinanciadorMin } from "@models/financiador.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useAuth } from "@contexts/auth.context"

const FormaProyecto = () => {
  const { user } = useAuth()
  if(!user) return null

  const estadoInicialForma: Proyecto = {
    id_coparte: user.copartes[0].id_coparte,
    id_alt: "",
    f_monto_total: "",
    i_tipo_financiamiento: 1,
    i_beneficiados: 0,
    responsable: {
      id: 0,
    },
    financiador: {
      id: 1,
    },
    rubros: [],
    ministraciones: [],
  }

  const router = useRouter()
  const idProyecto = router.query.id
  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  // const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [financiadoresDB, setFinanciadoresDB] = useState<FinanciadorMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idProyecto)
  const modalidad = idProyecto ? "EDITAR" : "CREAR"

  useEffect(() => {
    // obtenerCopartes()
    obtenerFinanciadores()
    if (modalidad === "EDITAR") {
      cargarData()
    }
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    const { error, data } = await obtener()

    if (error) {
      console.log(error)
    } else {
      const dataProyecto = data[0] as Proyecto
      setEstadoForma(dataProyecto)
    }

    setIsLoading(false)
  }

  const obtenerFinanciadores = async () => {
    const { error, data } = await ApiCall.get(`/financiadores?min=true`)

    if (error) {
      console.log(error)
    } else {
      const financiadores = data as FinanciadorMin[]
      setFinanciadoresDB(financiadores)
    }
  }

  // const obtenerCopartes = async () => {
  //   const { error, data } = await ApiCall.get(`/copartes?min=true`)

  //   if (error) {
  //     console.log(error)
  //   } else {
  //     const copartes = data as CoparteMin[]
  //     setCopartesDB(copartes)
  //   }
  // }

  const obtener = async () => {
    const res = await ApiCall.get(`/proyectos/${idProyecto}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/proyectos", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/proyectos/${idProyecto}`, estadoForma)
    return res
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/proyectos")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        router.push("/proyectos")
      } else {
        setModoEditar(false)
      }
    }
  }

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
          {!modoEditar && idProyecto && (
            <button
              className="btn btn-secondary"
              onClick={() => setModoEditar(true)}
            >
              Editar
            </button>
          )}
        </div>
      </div>
      <FormaContenedor onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Coparte</label>
          <select
            className="form-control"
            onChange={handleChange}
            value={estadoForma.id_coparte}
            name="id_coparte"
            disabled={Boolean(idProyecto)}
          >
            {user.copartes.map(({ id_coparte, nombre }) => (
              <option key={id_coparte} value={id_coparte}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Financiador</label>
          <select
            className="form-control"
            onChange={handleChange}
            value={estadoForma.financiador.id}
            disabled={Boolean(idProyecto)}
          >
            {financiadoresDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Responsable</label>
          <select
            className="form-control"
            onChange={handleChange}
            value={estadoForma.financiador.id}
            disabled={Boolean(idProyecto)}
          >
            {financiadoresDB.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Id alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled={!modoEditar}
          />
        </div>
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaProyecto }
