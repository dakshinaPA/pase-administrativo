import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Coparte } from "@models/coparte.model"
import { UsuarioMin } from "@models/usuario.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"
import { useCatalogos } from "@contexts/catalogos.context"

const FormaCoparte = () => {
  const estadoInicialForma: Coparte = {
    nombre: "",
    id_alt: "",
    i_estatus_legal: 1,
    representante_legal: "",
    rfc: "",
    id_tema_social: 1,
    administrador: {
      id: 1,
    },
    direccion: {
      calle: "",
      numero_ext: "",
      numero_int: "",
      colonia: "",
      municipio: "",
      cp: "",
      id_estado: 1,
    },
    enlace: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      email: "",
      telefono: "",
      password: "",
      cargo: "",
    },
    usuarios: [],
  }

  const { catalogos } = useCatalogos()
  const router = useRouter()
  const idCoparte = router.query.id
  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  const [administardoresDB, setAdministardoresDB] = useState<UsuarioMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idCoparte)
  const modalidad = idCoparte ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarAdministradores()
    if (modalidad === "EDITAR") {
      cargarData()
    }
  }, [])

  const cargarAdministradores = async () => {
    const { error, data } = await ApiCall.get(`/usuarios?id_rol=2&min=true`)

    if (error) {
      console.log(data)
    } else {
      setAdministardoresDB(data as UsuarioMin[])
    }
  }

  const cargarData = async () => {
    setIsLoading(true)

    const { error, data } = await obtener()

    if (error) {
      console.log(error)
    } else {
      const dataCoparte = data[0] as Coparte
      setEstadoForma(dataCoparte)
    }

    setIsLoading(false)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/copartes/${idCoparte}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/copartes", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/copartes/${idCoparte}`, estadoForma)
    return res
  }

  const cancelar = () => {
    idCoparte ? setModoEditar(false) : router.push("/copartes")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleChangeAdmin = (ev: ChangeEvent) => {
    const { value } = ev.target

    setEstadoForma({
      ...estadoForma,
      administrador: {
        id: Number(value),
      },
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

  const handleChangeEnlace = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      enlace: {
        ...estadoForma.enlace,
        [name]: value,
      },
    })
  }

  const handleSubmit = async (ev: React.SyntheticEvent) => {
    ev.preventDefault()

    setIsLoading(true)
    const res = modalidad === "EDITAR" ? await editar() : await registrar()
    setIsLoading(false)

    if (res.error) {
      console.log(res)
    } else {
      if (modalidad === "CREAR") {
        router.push("/copartes")
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
            <BtnBack navLink="/copartes" />
            {!idCoparte && <h2 className="color1 mb-0">Registrar coparte</h2>}
          </div>
          {!modoEditar && idCoparte && (
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
          <label className="form-label">ID alterno</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="id_alt"
            value={estadoForma.id_alt}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Estatus legal</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="i_estatus_legal"
            value={estadoForma.i_estatus_legal}
            disabled={!modoEditar}
          >
            <option value="1">Constituida</option>
            <option value="2">No constituida</option>
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Representante legal</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="representante_legal"
            value={estadoForma.representante_legal}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">RFC</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="rfc"
            placeholder="de la organización"
            value={estadoForma.rfc}
            disabled={!modoEditar || estadoForma.i_estatus_legal != 1}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Tema social</label>
          <select
            className="form-control"
            onChange={handleChange}
            name="id_tema_social"
            value={estadoForma.id_tema_social}
            disabled={!modoEditar}
          >
            {catalogos.temas_sociales.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Administrador</label>
          <select
            className="form-control"
            onChange={handleChangeAdmin}
            value={estadoForma.administrador.id}
            disabled={!modoEditar}
          >
            {administardoresDB.map(({ id, nombre, apellido_paterno }) => (
              <option key={id} value={id}>
                {nombre} {apellido_paterno}
              </option>
            ))}
          </select>
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
            {catalogos.estados.map(({ id, nombre }) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
        {modalidad === "CREAR" && (
          <>
            <div className="col-12">
              <hr />
            </div>
            <div className="col-12 mb-3">
              <h4 className="color1 mb-0">Enlace</h4>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="nombre"
                value={estadoForma.enlace.nombre}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido paterno</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="apellido_paterno"
                value={estadoForma.enlace.apellido_paterno}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Apellido materno</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="apellido_materno"
                value={estadoForma.enlace.apellido_materno}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="email"
                value={estadoForma.enlace.email}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="telefono"
                value={estadoForma.enlace.telefono}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="password"
                value={estadoForma.enlace.password}
              />
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cargo</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeEnlace}
                name="cargo"
                value={estadoForma.enlace.cargo}
              />
            </div>
          </>
        )}
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
              {idCoparte ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
      {modalidad === "EDITAR" && (
        <div className="row my-3">
          <div className="col-12 mb-3">
            <h2 className="color1 mb-0">Usuarios</h2>
          </div>
          <div className="col-12 table-responsive mb-3">
            <table className="table">
              <thead className="table-light">
                <tr>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Enlace</th>
                  <th>Ver</th>
                </tr>
              </thead>
              <tbody>
                {estadoForma.usuarios.map(
                  ({
                    id,
                    id_usuario,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    email,
                    telefono,
                    cargo,
                    b_enlace,
                  }) => (
                    <tr key={id}>
                      <td>
                        {nombre} {apellido_paterno} {apellido_materno}
                      </td>
                      <td>{cargo}</td>
                      <td>{email}</td>
                      <td>{telefono}</td>
                      <td>
                        <i className={b_enlace ? "bi bi-check" : "bi bi-x"}></i>
                      </td>
                      <td>
                        <button
                          className="btn btn-dark"
                          onClick={() => router.push(`/usuarios/${id_usuario}`)}
                        >
                          <i className="bi bi-eye-fill"></i>
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </RegistroContenedor>
  )
}

export { FormaCoparte }
