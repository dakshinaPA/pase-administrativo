import React, { useEffect, useState } from "react"
import { ApiCall } from "@assets/utils/apiCalls"
import { useRouter } from "next/router"
import { Loader } from "@components/Loader"
import { TablaContenedor } from "@components/Contenedores"
import { ModalEliminar } from "@components/ModalEliminar"
import { aMinuscula } from "@assets/utils/common"
import { useAuth } from "@contexts/auth.context"
import { ProyectoMin } from "@models/proyecto.model"
import { SolicitudPresupuesto } from "@models/solicitud-presupuesto.model"

const Colaboradores = () => {
  const { user } = useAuth()
  if (!user) return null
  const router = useRouter()
  // const [proyectosDB, setProyectosDB] = useState<ProyectoMin[]>([])
  const [solicitudesDB, setSolicitudesDB] = useState<SolicitudPresupuesto[]>([])
  // const [usuariosDB, setUsuariosDB] = useState<Usuario[]>([])
  const [solicitudAEliminar, setSolicitudAEliminar] = useState<number>(0)
  const [showModalEliminar, setShowModalEliminar] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [inputBusqueda, setInputBusqueda] = useState<string>("")
  // const [rolUsuarioSelect, setRolUsuarioSelect] = useState<number>(3)
  // const [proyectosSelect, setProyectosSelect] = useState<number>(0)

  useEffect(() => {
    // obtenerCopartesDB()
    // cargarProyectosUsuario()
    cargarSolicitudesUsuario()
  }, [])

  // useEffect(() => {
  //   if(rolUsuarioSelect != 3 || coparteSelect){
  //     obtenerUsuarios()
  //   }
  // }, [rolUsuarioSelect, coparteSelect])

  const cargarSolicitudesUsuario = async () => {
    const reSolicitudesUsuario = await ApiCall.get(
      `/solicitudes-presupuesto?id_usuario=${user.id}`
    )

    if (reSolicitudesUsuario.error) {
      console.log(reSolicitudesUsuario.data)
    } else {
      const solicitudesDB = reSolicitudesUsuario.data as SolicitudPresupuesto[]
      setSolicitudesDB(solicitudesDB)
    }
  }

  // const cargarProyectosUsuario = async () => {
  //   const reProyectosUsuario = await ApiCall.get(`/proyectos?id_usuario=${user.id}`)

  //   if(reProyectosUsuario.error){
  //     console.log(reProyectosUsuario.data)
  //   } else {
  //     const proyectosDB = reProyectosUsuario.data as ProyectoMin[]
  //     setProyectosDB(proyectosDB)
  //     setProyectosSelect(proyectosDB[0].id)
  //   }
  // }

  const abrirModalEliminarUsuario = (id: number) => {
    setSolicitudAEliminar(id)
    setShowModalEliminar(true)
  }

  // const obtnerSolicitudesProyecto = async (id_proyecto: number) => {
  //   return await ApiCall.get(`/solicitudes-presupuesto?${id_proyecto}`)
  // }

  const eliminarSolicitud = async () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
    setIsLoading(true)

    const { error, data, mensaje } = await ApiCall.delete(
      `/solicitudes-presupuesto/${solicitudAEliminar}`
    )

    if (error) {
      console.log(error)
    } else {
      // await obtenerUsuarios()
    }

    setIsLoading(false)
  }

  const cancelarEliminarUsuario = () => {
    setSolicitudAEliminar(0)
    setShowModalEliminar(false)
  }

  // const usuariosFiltrados = solicitudesDB.filter(
  //   ({  }) => {
  //     const query = inputBusqueda.toLocaleLowerCase()
  //     return (
  //       aMinuscula(nombre).includes(query) ||
  //       aMinuscula(apellido_paterno).includes(query) ||
  //       aMinuscula(apellido_materno).includes(query) ||
  //       aMinuscula(email).includes(query)
  //     )
  //   }
  // )

  const determinarNombreSolicitudAEliminar = (): string => {
    const solicitud = solicitudesDB.find(
      (solicitud) => solicitud.id === solicitudAEliminar
    )
    return solicitud ? String(solicitud.id) : ""
  }

  return (
    <TablaContenedor>
      <div className="row mb-2">
        <div className="col-12 col-md-6 col-lg-2 mb-3">
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={() => router.push("/solicitudes-presupuesto/registro")}
          >
            Registrar +
          </button>
        </div>
        {/* <div className="col-12 col-md-6 col-lg-2 mb-3">
          <select
            className="form-control"
            onChange={handleCambioRol}
            value={rolUsuarioSelect}
            disabled={user.id_rol == 2}
          >
            <option value="1">Super Usuario</option>
            <option value="2">Administrador</option>
            <option value="3">Coparte</option>
          </select>
        </div> */}
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
                  <th>Proyecto</th>
                  <th>Tipo de gasto</th>
                  <th>Partida presupuestal</th>
                  <th>Descricpión del gasto</th>
                  <th>Importe</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesDB.map((solicitud) => {
                  const {
                    id,
                    id_proyecto,
                    proyecto,
                    tipo_gasto,
                    rubro,
                    descripcion_gasto,
                    f_importe,
                    estatus,
                  } = solicitud

                  return (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{proyecto}</td>
                      <td>{tipo_gasto}</td>
                      <td>{rubro}</td>
                      <td>{descripcion_gasto}</td>
                      <td>{f_importe}</td>
                      <td>{estatus}</td>
                      <td>
                        <div className="d-flex">
                          <button
                            className="btn btn-dark btn-sm me-1"
                            onClick={() =>
                              router.push(`/proyectos/${id_proyecto}/solicitudes-presupuesto/${id}`)
                            }
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          {user.id_rol == 1 && (
                            <button
                              className="btn btn-dark btn-sm"
                              onClick={() => abrirModalEliminarUsuario(id)}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
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
      )}
      <ModalEliminar
        show={showModalEliminar}
        aceptar={eliminarSolicitud}
        cancelar={cancelarEliminarUsuario}
      >
        <p className="mb-0">
          ¿Estás segur@ de eliminar al usuario{" "}
          {determinarNombreSolicitudAEliminar()}?
        </p>
      </ModalEliminar>
    </TablaContenedor>
  )
}

export default Colaboradores
