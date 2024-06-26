import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { Loader } from "@components/Loader"
import { Contenedor, TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerCopartes,
  obtenerUsuarios,
} from "@assets/utils/common"
import { IdRolUsuario, QueriesUsuario, Usuario } from "@models/usuario.model"
import { CoparteMin, QueriesCoparte } from "@models/coparte.model"
import { BtnAccion, BtnNeutro, LinkAccion } from "@components/Botones"
import { useSesion } from "@hooks/useSesion"
import { useRouter } from "next/router"
import { Banner, estadoInicialBanner } from "@components/Banner"

const Usuarios = () => {
  const { user, status } = useSesion()
  const router = useRouter()
  if (status !== "authenticated" || !user) {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    return null
  }

  if (user.id_rol == 3) {
    router.push("/")
    return null
  }

  const [copartesDB, setCopartesDB] = useState<CoparteMin[]>([])
  const [usuariosDB, setUsuariosDB] = useState<Usuario[]>([])
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  const [rolUsuarioSelect, setRolUsuarioSelect] = useState<IdRolUsuario>(3)
  const [coparteSelect, setCoparteSelect] = useState<number>(0)
  const [showBanner, setShowBanner] = useState(estadoInicialBanner)

  useEffect(() => {
    obtenerCopartesDB()
  }, [])

  useEffect(() => {
    cargarUsuarios()
  }, [coparteSelect, rolUsuarioSelect])

  const abrirModalEliminarUsuario = (id: number) => {
    setUsuarioAEliminar(id)
    setShowModalEliminar(true)
  }

  const cargarUsuarios = async () => {
    if (rolUsuarioSelect == 3 && coparteSelect == 0) return
    setIsLoading(true)

    const queries: QueriesUsuario =
      [1, 2].includes(Number(rolUsuarioSelect)) || coparteSelect == -1
        ? { id_rol: rolUsuarioSelect }
        : { id_coparte: coparteSelect }

    const { data, error, mensaje } = await obtenerUsuarios(queries)

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      const usuarios = data as Usuario[]
      setUsuariosDB(usuarios)
    }

    setIsLoading(false)
  }

  const obtenerCopartesDB = async () => {
    setIsLoading(true)

    const queryCopartes: QueriesCoparte =
      user.id_rol == 2 ? { id_admin: user.id } : {}

    const { error, data, mensaje } = await obtenerCopartes(queryCopartes)

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      const copartesDB = data as CoparteMin[]
      setCopartesDB(copartesDB)
      if (copartesDB.length == 1) {
        setCoparteSelect(copartesDB[0].id || 0)
      }
    }

    setIsLoading(false)
  }

  const eliminarUsuario = async () => {
    setUsuarioAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/usuarios/${usuarioAEliminar}`
    )

    if (error) {
      console.log(data)
      setShowBanner({
        mensaje,
        show: true,
        tipo: "error",
      })
    } else {
      await cargarUsuarios()
    }

    setIsLoading(false)
  }

  const cancelarEliminarUsuario = () => {
    setUsuarioAEliminar(0)
    setShowModalEliminar(false)
  }

  const handleCambioRol = ({ target }) => {
    setRolUsuarioSelect(target.value)
    setCoparteSelect(0)
  }

  const handleCambioCoparte = ({ target }) => {
    setCoparteSelect(target.value)
  }

  const usuariosFiltrados = usuariosDB.filter(
    ({ nombre, apellido_paterno, apellido_materno, email }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(apellido_paterno).includes(query) ||
        aMinuscula(apellido_materno).includes(query) ||
        aMinuscula(email).includes(query)
      )
    }
  )

  const determinarNombreUsuarioAEliminar = (): string => {
    const usuario = usuariosDB.find(
      (usuario) => usuario.id === usuarioAEliminar
    )
    return usuario ? `${usuario.nombre} ${usuario.apellido_paterno}` : ""
  }

  if (isLoading) {
    return (
      <Contenedor>
        <Loader />
      </Contenedor>
    )
  }

  if (showBanner.show) {
    return (
      <Contenedor>
        <Banner tipo={showBanner.tipo} mensaje={showBanner.mensaje} />
      </Contenedor>
    )
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2 mb-3">
          <BtnNeutro
            texto="Registrar +"
            onclick={() => router.push("/usuarios/registro")}
            margin={false}
            width={true}
          />
        </div>
        {user.id_rol == 1 && (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-2 mb-3">
            <select
              className="form-control"
              onChange={handleCambioRol}
              value={rolUsuarioSelect}
            >
              <option value="1">Super Usuario</option>
              <option value="2">Administrador</option>
              <option value="3">Coparte</option>
            </select>
          </div>
        )}
        <div className="col-12 col-sm-6 col-lg-4 col-xl-2 mb-3">
          {rolUsuarioSelect == 3 && (
            <select
              className="form-control"
              value={coparteSelect}
              onChange={handleCambioCoparte}
            >
              <option value="0" disabled>
                Selecciona coparte
              </option>
              {user.id_rol == 1 && <option value="-1">TODAS</option>}
              {copartesDB.map(({ id, nombre }) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="col d-none d-xl-block mb-3"></div>
        <div className="col-12 col-sm-6 col-lg-6 col-xl-4 mb-3">
          <div className="input-group">
            <input
              type="text"
              name="busqueda"
              className="form-control"
              placeholder="Buscar registro"
              value={inputBusqueda}
              onChange={({ target: { value } }) => setInputBusqueda(value)}
            />
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 table-responsive">
          <table className="table">
            <thead className="table-light">
              <tr className="color1">
                <th>#id</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                {rolUsuarioSelect == 3 && (
                  <>
                    <th>Cargo</th>
                    <th>Enlace</th>
                  </>
                )}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const {
                  id,
                  nombre,
                  apellido_paterno,
                  apellido_materno,
                  email,
                  telefono,
                  coparte,
                } = usuario

                return (
                  <tr key={`coparte_${id}`}>
                    <td>{id}</td>
                    <td>
                      {nombre} {apellido_paterno} {apellido_materno}
                    </td>
                    <td>{email}</td>
                    <td>{telefono}</td>
                    {rolUsuarioSelect == 3 && (
                      <>
                        <td>{coparte?.cargo}</td>
                        <td className="icono-enlace">
                          {coparte?.b_enlace ? (
                            <i className="bi bi-check"></i>
                          ) : (
                            <i className="bi bi-x"></i>
                          )}
                        </td>
                      </>
                    )}
                    <td>
                      <div className="d-flex">
                        <LinkAccion
                          margin={false}
                          icono="bi-eye-fill"
                          ruta={`/usuarios/${id}`}
                          title="ver detalle"
                        />
                        {user.id_rol == 1 && (
                          <BtnAccion
                            margin="l"
                            icono="bi-x-circle"
                            onclick={() => abrirModalEliminarUsuario(id)}
                            title="eliminar usuario"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarUsuario}
        cancelar={cancelarEliminarUsuario}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al usuario{" "}
          {determinarNombreUsuarioAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Usuarios
