import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"
import { Loader } from "@components/Loader"
import { ApiCall } from "@assets/utils/apiCalls"

const FormaSolicitudPresupuesto = () => {
  const estadoInicialForma = {
    tipoGasto: 1,
    proveedor: "",
    clabe: "",
    banco: "",
    titular: "",
    rfc: "",
    email: "",
    email2: "",
    partida: 1,
    descripcion: "",
    importe: 0,
    comprobante: 1,
  }

  const [estadoForma, setEstadoForma] =
    useState<SolicitudPresupuesto>(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idSolicitud = router.query.id

  useEffect(() => {
    if (idSolicitud) {
      cargarDataSolicitud()
    }
  }, [])

  const cargarDataSolicitud = async () => {
    setIsLoading(true)

    const { error, data } = await obtenerSolicitud()

    if (error) {
      console.log(error)
    } else {
      const dataUsuario = data[0] as SolicitudPresupuesto
      setEstadoForma(dataUsuario)
    }

    setIsLoading(false)
  }

  const obtenerSolicitud = async () => {
    const res = await ApiCall.get(`/api/presupuestos/${idSolicitud}`)
    return res
  }

  const registrarSolicitud = async () => {
    const res = await ApiCall.post("/api/presupuestos", estadoForma)
    return res
  }

  const editarSolicitud = async () => {
    const res = await ApiCall.put(
      `/api/presupuestos/${idSolicitud}`,
      estadoForma
    )
    return res
  }

  const cancelar = () => {
    router.push("/presupuestos")
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
    const res = idSolicitud
      ? await editarSolicitud()
      : await registrarSolicitud()
    setIsLoading(false)

    if (res.error) {
      console.log(res)
    } else {
      router.push("/presupuestos")
    }
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="container">
      <form className="row py-3 border" onSubmit={handleSubmit}>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tipo de gasto</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="tipoGasto"
            value={estadoForma.tipoGasto}
          >
            <option value="1">Programación</option>
            <option value="2">Reembolso</option>
            <option value="3">Asimilados</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Proveedor</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="proveedor"
            value={estadoForma.proveedor}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Clabe</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="clabe"
            value={estadoForma.clabe}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Banco</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="banco"
            value={estadoForma.banco}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Titular</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="titular"
            value={estadoForma.titular}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Rfc</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="rfc"
            value={estadoForma.rfc}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="email"
            value={estadoForma.email}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Email alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="email2"
            value={estadoForma.email2}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Partida presupuestal</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="partida"
            value={estadoForma.partida}
          >
            <option value="1">Algo</option>
            <option value="2">Reembolso</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Descricpión</label>
          <textarea
            className="form-control"
            onChange={handleChange}
            name="descripcion"
            value={estadoForma.descripcion}
          ></textarea>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Importe</label>
          <input
            className="form-control"
            type="number"
            onChange={handleChange}
            name="importe"
            value={estadoForma.importe}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Comprobante</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="comprobante"
            value={estadoForma.comprobante}
          >
            <option value="1">Factura</option>
            <option value="2">Recibo de asimilados</option>
            <option value="3">Recibo de honorarios</option>
            <option value="4">Invoice</option>
            <option value="5">Recibo no deducible</option>
          </select>
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
            {idSolicitud ? "Editar" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export { FormaSolicitudPresupuesto }
