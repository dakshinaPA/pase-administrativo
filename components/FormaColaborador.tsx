import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { ColaboradorProyecto } from "@models/proyecto.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"

const FormaColaborador = () => {
  const estadoInicialForma: ColaboradorProyecto = {
    id_proyecto: 0,
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    i_tipo: 1,
    clabe: "",
    id_banco: 1,
    telefono: "",
    email: "",
    rfc: "",
    curp: "",
    cp: "",
    nombre_servicio: "",
    descripcion_servicio: "",
    f_monto_total: "",
    dt_inicio_servicio: "",
    dt_fin_servicio: "",
    direccion: {
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      municipio: "",
      cp: "",
      id_estado: 1,
    },
  }

  const router = useRouter()
  const { estados, bancos } = useCatalogos()
  const idProyecto = Number(router.query.id)
  const idColaborador = Number(router.query.idC)
  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  // const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idColaborador)
  const modalidad = idColaborador ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = []
      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      if (modalidad === "EDITAR") {
        setEstadoForma(resCombinadas[1].data[0] as ColaboradorProyecto)
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/colaboradores/${idColaborador}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/colaboradores", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(
      `/colaboradores/${idColaborador}`,
      estadoForma
    )
    return res
  }

  const cancelar = () => {
    // modalidad === "EDITAR"
    //   ? setModoEditar(false)
    //   : router.push("/colaboradores")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleChangeDireccion = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      direccion: {
        ...estadoForma.direccion,
        [name]: value,
      },
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    console.log(estadoForma)
    return

    setIsLoading(true)
    const { error, data, mensaje } =
      modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (error) {
      console.log(data)
    } else {
      if (modalidad === "CREAR") {
        //@ts-ignore
        router.push(`/colaboradores/${data.idInsertado}`)
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
            <BtnBack navLink="/colaboradores" />
            {modalidad === "CREAR" && (
              <h2 className="color1 mb-0">Registrar Colaborador</h2>
            )}
          </div>
          {!modoEditar && idColaborador && (
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
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Proyecto</label>
              <select
                className="form-control"
                onChange={handleChange}
                name="id_proyecto"
                value={estadoForma.id_proyecto}
              ></select>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="nombre"
                value={estadoForma.nombre}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido paterno</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="apellido_paterno"
                value={estadoForma.apellido_paterno}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido materno</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="apellido_materno"
                value={estadoForma.apellido_materno}
                disabled={!modoEditar}
              />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-3 mb-3">
              <label className="form-label">Tipo</label>
              <select
                className="form-control"
                onChange={handleChange}
                name="i_tipo"
                value={estadoForma.i_tipo}
              >
                <option value="1">Asimilado</option>
                <option value="2">Honorarios</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CLABE</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="clabe"
                value={estadoForma.clabe}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-7 col-lg-3 mb-3">
              <label className="form-label">Banco</label>
              <select
                className="form-control"
                onChange={handleChange}
                name="id_banco"
                value={estadoForma.id_banco}
              >
                {bancos.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-5 col-lg-2 mb-3">
              <label className="form-label">Monto total</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="f_monto_total"
                value={estadoForma.f_monto_total}
                disabled={!modoEditar}
              />
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="row">
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="email"
                value={estadoForma.email}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="telefono"
                value={estadoForma.telefono}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">RFC</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="rfc"
                value={estadoForma.rfc}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CURP</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="curp"
                value={estadoForma.curp}
                disabled={!modoEditar}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">CP</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChange}
                name="cp"
                value={estadoForma.cp}
                disabled={!modoEditar}
              />
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4 mb-3">
          <label className="form-label">Nombre servicio</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="nombre_servicio"
            value={estadoForma.nombre_servicio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-lg-8 mb-3">
          <label className="form-label">Descricpión servicio</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="descripcion_servicio"
            value={estadoForma.descripcion_servicio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Inicio servicio</label>
          <input
            className="form-control"
            type="date"
            onChange={handleChange}
            name="dt_inicio_servicio"
            value={estadoForma.dt_inicio_servicio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Fin servicio</label>
          <input
            className="form-control"
            type="date"
            onChange={handleChange}
            name="dt_fin_servicio"
            value={estadoForma.dt_fin_servicio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12">
          <hr />
        </div>
        <div className="col-12 mb-3">
          <h4 className="color1 mb-0">Dirección</h4>
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Calle</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="calle"
            value={estadoForma.direccion.calle}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número ext</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="numero_ext"
            value={estadoForma.direccion.numero_ext}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-6 col-lg-3 mb-3">
          <label className="form-label">Número int</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="numero_int"
            value={estadoForma.direccion.numero_int}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-lg-6 mb-3">
          <label className="form-label">Colonia</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="colonia"
            value={estadoForma.direccion.colonia}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Municipio</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="municipio"
            value={estadoForma.direccion.municipio}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">CP</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChangeDireccion}
            name="cp"
            value={estadoForma.direccion.cp}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <label className="form-label">Estado</label>
          <select
            className="form-control"
            onChange={handleChangeDireccion}
            name="id_estado"
            value={estadoForma.direccion.id_estado}
            disabled={!modoEditar}
          >
            {estados.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        {modoEditar && (
          <div className="col-12 text-end">
            <button
              className="btn btn-secondary me-2"
              type="button"
              onClick={cancelar}
            >
              Cancelar
            </button>
            <button className="btn btn-secondary" type="submit">
              {idProyecto ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaColaborador }
