import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import {
  aMinuscula,
  obtenerProveedores,
  obtenerProyectos,
} from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"
import { ProveedorProyecto, ProyectoMin } from "@models/proyecto.model"

const Proveedores = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [proveedoresDB, setProveedoresDB] = useState<ProveedorProyecto[]>(
    []
  )
  const [proveedorAeliminar, setProveedorAEliminar] = useState<number>(0)
  const [selectProyecto, setSelectProyecto] = useState(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")

  useEffect(() => {
    cargarProyectosUsuario()
  }, [])

  useEffect(() => {
    cargarProveedores()
  }, [selectProyecto])

  const cargarProyectosUsuario = async () => {
    const reProyectos = await obtenerProyectos({ id_responsable: user.id })
    if (reProyectos.error) {
      console.log(reProyectos.data)
    } else {
      const proyectos = reProyectos.data as ProyectoMin[]
      setProyectosDB(proyectos)
      setSelectProyecto(proyectos[0].id)
    }
  }

  const cargarProveedores = async () => {
    if (!selectProyecto) return

    const reProveedores = await obtenerProveedores(selectProyecto)
    if (reProveedores.error) {
      console.log(reProveedores.data)
    } else {
      const proveedoresDB = reProveedores.data as ProveedorProyecto[]
      setProveedoresDB(proveedoresDB)
    }
  }

  const abrirModalEliminarProveedor = (id: number) => {
    setProveedorAEliminar(id)
    setShowModalEliminar(true)
  }

  const eliminarProveedor = async () => {
    setProveedorAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/proveedores/${proveedorAeliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      await cargarProveedores()
    }

    setIsLoading(false)
  }

  const cancelarEliminarProveedor = () => {
    setProveedorAEliminar(0)
    setShowModalEliminar(false)
  }

  const proveedoresFiltrados = proveedoresDB.filter(
    ({ nombre, email }) => {
      const query = inputBusqueda.toLocaleLowerCase()
      return (
        aMinuscula(nombre).includes(query) ||
        aMinuscula(email).includes(query)
      )
    }
  )

  const determinarNombreProveedorAEliminar = (): string => {
    const proveedorMatch = proveedoresDB.find(
      (proveedor) => proveedor.id === proveedorAeliminar
    )
    return proveedorMatch
      ? `${proveedorMatch.nombre} ${proveedorMatch.nombre}`
      : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/proveedores/registro")}
          >
            Registrar +
          </button>
        </div>
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <select
            className="form-control"
            onChange={({ target: { value } }) =>
              setSelectProyecto(Number(value))
            }
            value={selectProyecto}
          >
            {proyectosDB.map(({ id, id_alt }) => (
              <option key={id} value={id}>
                {id_alt}
              </option>
            ))}
          </select>
        </div>
        <div className="d-none d-lg-block col mb-3"></div>
        <div className="col-12 col-md-6 col-lg-4 mb-3">
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
      {isLoading ? (
        <Loader />
      ) : (
        <div className="row">
          <div className="col-12 table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>#id</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Servicio</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((proveedor) => {
                  const {
                    id,
                    id_proyecto,
                    nombre,
                    tipo,
                    descripcion_servicio,
                    email,
                    telefono,
                  } = proveedor

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{nombre}</td>
                      <td>{tipo}</td>
                      <td>{descripcion_servicio}</td>
                      <td>{email}</td>
                      <td>{telefono}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm me-1"
                            onClick={() =>
                              router.push(
                                `/proyectos/${id_proyecto}/proveedores/${id}`
                              )
                            }
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>

                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => abrirModalEliminarProveedor(id)}
                          >
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarProveedor}
        cancelar={cancelarEliminarProveedor}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al proveedor{" "}
          {determinarNombreProveedorAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Proveedores
