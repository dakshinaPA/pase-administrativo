import React from 'react'
import { TablaContainer, Acciones } from '@components/TablaContainer'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@components/Loader'
import { ModalEliminar } from '@components/ModalEliminar'
import { Usuario } from '@api/models/usuarios.model'

interface TablaBusquedaProps {
    routeRegistro: string
    buscarRegistro: (ev: any) => void
    isLoading: boolean
    headersTabla: string[]
    children: JSX.Element[]
    showModalEliminar: boolean
    resetModalEliminar: () => void
    eliminarEntidad: () => void
    modalEliminarMsj: string
}

const TablaBusqueda = ( props: TablaBusquedaProps) => {

    const { routeRegistro, buscarRegistro, isLoading, headersTabla, children, showModalEliminar, resetModalEliminar, eliminarEntidad, modalEliminarMsj } = props
    const router = useRouter()

    return(
        <>
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 col-md-7">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push(routeRegistro)}
                    >
                        Registrar +
                    </button>
                </div>
                <div className="col-12 col-md-5">
                    <div className="input-group">
                        <input
                            type="text"
                            name="busqueda"
                            className="form-control"
                            placeholder="Buscar usuario"
                            onChange={buscarRegistro}
                        />
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
        {isLoading
        ?
        <Loader />
        :            
        <TablaContainer headers={headersTabla}>
            { children }
            {/* {usuarios.map(( usuario ) => {

                const { id_usuario, nombre, apellido_paterno, rol, email } = usuario 
                const nombreCompleto = `${nombre} ${apellido_paterno}`

                return(
                    <tr key={id_usuario}>
                        <td>{id_usuario}</td>
                        <td>{nombreCompleto}</td>
                        <td>{email}</td>
                        <td>{rol}</td>
                        <Acciones
                            editar={() => editarUsuario( id_usuario )}
                            eliminar={ () => abrirModalEliminarUsuario( id_usuario, nombreCompleto )}
                        />
                    </tr>
                )
            })} */}
        </TablaContainer>
        }
        { showModalEliminar &&
        <ModalEliminar
            cancelar={resetModalEliminar}
            aceptar={eliminarEntidad}
        >
            <p className="mb-0">{modalEliminarMsj}</p>
        </ModalEliminar>
        }
        </>
    )
}

export { TablaBusqueda }