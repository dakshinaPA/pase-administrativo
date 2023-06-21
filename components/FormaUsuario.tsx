import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { ChangeEvent } from "@assets/models/formEvents.model"
import { Usuario } from "@models/usuario.model"
import { CoparteMin } from "@models/coparte.model"
import { Loader } from "@components/Loader"
import { RegistroContenedor, FormaContenedor } from "@components/Contenedores"
import { BtnBack } from "@components/BtnBack"
import { ApiCall } from "@assets/utils/apiCalls"

const FormaUsuario = () => {
  const estadoInicialForma: Usuario = {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    telefono: "",
    password: "",
    rol: {
      id: 3,
    },
    copartes: [
      {
        id_coparte: 1,
        cargo: "",
      },
    ],
  }

  const router = useRouter()
  const idCoparte = router.query.idC
  const idUsuario = router.query.id
  const [estadoForma, setEstadoForma] = useState(estadoInicialForma)
  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [modoEditar, setModoEditar] = useState<boolean>(!idUsuario)
  const modalidad = idUsuario ? "EDITAR" : "CREAR"

  useEffect(() => {
    cargarData()
  }, [])

  useEffect(() => {
    //limpiar campos de coparte si se cambia de rol
    setEstadoForma({
      ...estadoForma,
      copartes: [
        {
          id_coparte: 1,
          cargo: "",
        },
      ],
    })
  }, [estadoForma.rol.id])

  const cargarData = async () => {
    setIsLoading(true)

    try {
      const promesas = [obtenerCopartes()]
      if (modalidad === "EDITAR") {
        promesas.push(obtener())
      }

      const resCombinadas = await Promise.all(promesas)

      for (const rc of resCombinadas) {
        if (rc.error) throw rc.data
      }

      setCopartesDB(resCombinadas[0].data as CoparteMin[])

      if (modalidad === "EDITAR") {
        setEstadoForma(resCombinadas[1].data[0] as Usuario)
      }

      if (idCoparte) {
        setEstadoForma({
          ...estadoForma,
          rol: {
            id: 3,
          },
          copartes: [
            {
              id_coparte: Number(idCoparte),
              cargo: "",
            },
          ],
        })
      }
    } catch (error) {
      console.log(error)
    }

    setIsLoading(false)
  }

  const obtenerCopartes = async () => {
    return await ApiCall.get(`/copartes?min=true`)
  }

  const obtener = async () => {
    const res = await ApiCall.get(`/usuarios/${idUsuario}`)
    return res
  }

  const registrar = async () => {
    const res = await ApiCall.post("/usuarios", estadoForma)
    return res
  }

  const editar = async () => {
    const res = await ApiCall.put(`/usuarios/${idUsuario}`, estadoForma)
    return res
  }

  const cancelar = () => {
    modalidad === "EDITAR" ? setModoEditar(false) : router.push("/usuarios")
  }

  const handleChange = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      [name]: value,
    })
  }

  const handleChangeRol = (ev: ChangeEvent) => {
    const { value } = ev.target

    setEstadoForma({
      ...estadoForma,
      rol: {
        id: Number(value),
      },
    })
  }

  const handleChangeCoparte = (ev: ChangeEvent) => {
    const { name, value } = ev.target

    setEstadoForma({
      ...estadoForma,
      copartes: [
        {
          ...estadoForma.copartes[0],
          [name]: value,
        },
      ],
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
        router.push("/usuarios")
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
            <BtnBack navLink="/usuarios" />
            {!idUsuario && <h2 className="color1 mb-0">Registrar usuario</h2>}
          </div>
          {!modoEditar && idUsuario && (
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
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="text"
            onChange={handleChange}
            name="password"
            value={estadoForma.password}
            disabled={!modoEditar}
          />
        </div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
          <label className="form-label">Rol</label>
          <select
            className="form-control"
            onChange={handleChangeRol}
            value={estadoForma.rol.id}
            disabled={Boolean(idUsuario) || Boolean(idCoparte)}
          >
            <option value="1">Super usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div>
        {estadoForma.rol.id === 3 && (
          <>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Coparte</label>
              <select
                className="form-control"
                onChange={handleChangeCoparte}
                name="id_coparte"
                value={estadoForma.copartes[0].id_coparte}
                disabled={Boolean(idUsuario) || Boolean(idCoparte)}
              >
                {copartesDB.map(({ id, nombre }) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6 col-lg-4 mb-3">
              <label className="form-label">Cargo</label>
              <input
                className="form-control"
                type="text"
                onChange={handleChangeCoparte}
                name="cargo"
                value={estadoForma.copartes[0].cargo}
                disabled={!modoEditar}
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
              {modalidad === "EDITAR" ? "Guardar" : "Registrar"}
            </button>
          </div>
        )}
      </FormaContenedor>
    </RegistroContenedor>
  )
}

export { FormaUsuario }
