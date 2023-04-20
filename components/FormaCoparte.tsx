import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Coparte } from "@api/models/copartes.model"
import { Loader } from "@components/Loader"
import { ApiCall } from "@assets/utils/apiCalls"

const FormaCoparte = () => {
  const estadoInicialForma = {
    i_tipo: 1,
    nombre: "",
    vc_id: "",
  }

  const [estadoForma, setEstadoForma] = useState<Coparte>(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idCoparte = router.query.id

  useEffect(() => {
    if (idCoparte) {
      cargarDataCoparte()
    }
  }, [])

  const cargarDataCoparte = async () => {
    setIsLoading(true)

    const { error, data } = await obtenerCoparte()

    if (error) {
      console.log(error)
    } else {
      const dataUsuario = data[0] as Coparte
      setEstadoForma(dataUsuario)
    }

    setIsLoading(false)
  }

  const obtenerCoparte = async () => {
    const res = await ApiCall.get(`/api/copartes/${idCoparte}`)
    return res
  }

  const registrarCoparte = async () => {
    const res = await ApiCall.post("/api/copartes", estadoForma)
    return res
  }

  const editarCoparte = async () => {
    const res = await ApiCall.put(`/api/copartes/${idCoparte}`, estadoForma)
    return res
  }

  const cancelar = () => {
    router.push("/copartes")
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
    const res = idCoparte ? await editarCoparte() : await registrarCoparte()
    setIsLoading(false)

    if (res.error) {
      console.log(res)
    } else {
      router.push("/copartes")
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="container">
      <form className="row py-3 border" onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="i_tipo"
            value={estadoForma.i_tipo}
          >
            <option value="1">Constituida</option>
            <option value="2">No constituida</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Nombre</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="nombre"
            value={estadoForma.nombre}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">ID</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="vc_id"
            value={estadoForma.vc_id}
          />
        </div>
        <div className="col-12 text-end">
          <button
            className="btn btn-secondary me-2"
            type="button"
            onClick={cancelar}
          >
            Cancelar
          </button>
          <button className="btn btn-secondary" type="submit">
            {idCoparte ? "Editar" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export { FormaCoparte }
