import React from 'react'
import { TablaContainer, Acciones } from '@components/TablaContainer'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@components/Loader'
import { ModalEliminar } from '@components/ModalEliminar'

interface Usuario {
    id_usuario: number
    nombre: string
    apellido_materno: string
    apellido_paterno: string
    email: string                      
    email2?: string                    
    password?: string             
    interno: 1 | 2               
    id_rol: 1 | 2 | 3                
}

interface modalEliminar {
    show: boolean
    id: number
    nombre: string
}


const Usuarios = () => {

    const estadoInicialEliminarUsuario: modalEliminar = {
        show: false,
        id: 0,
        nombre: ''
    }

    const usuariosDB = useRef<Usuario[]>([])
    const [ usuarios, setUsuarios ] = useState<Usuario[]>([])
    const [ isLoading, setIsLoading ] = useState<boolean>( true )
    const [ showModalEliminar, setShowModalEliminar ] = useState<modalEliminar>( estadoInicialEliminarUsuario )
    const router = useRouter()

    useEffect(() => {

        obtenerUsuarios()
    }, [])

    const obtenerUsuarios =  async () => {
        try {
            const { error, data } = await ApiCall.get( '/api/usuarios' )

            if( error ){
                console.log( data )
            } else {
                usuariosDB.current = data
                setUsuarios( data )
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const eliminarUsuario = async ( id: number ) => {

        setShowModalEliminar( estadoInicialEliminarUsuario )
        setIsLoading( true )
        try {
            const { error, data } = await ApiCall.delete( `/api/usuarios/${id}`)

            if( error ){
                console.log( data )
            } else {
                obtenerUsuarios()
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const abrirModalEliminarUsuario = ( id: number, nombre: string ) => {
        
        setShowModalEliminar({
            show: true,
            id,
            nombre
        })
    }

    const editarUsuario = ( id: number ) => {
        router.push(`/usuarios/${id}`)
    }

    const buscarUsuario = ({ target: { value } }) => {

        // const copartesFiltradas = usuariosDB.current.filter( cop => cop.nombre.toLowerCase().includes(value.toLowerCase()) || cop.id.toLowerCase().includes(value.toLowerCase()) )
        // setUsuarios( copartesFiltradas )
    }

    const headersTabla = [ "Id", "Nombre", "Email", "Rol", "Acciones" ]

    return(
        <>
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 col-md-7">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push('usuarios/registro')}
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
                            onChange={buscarUsuario}
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
        <TablaContainer headres={headersTabla}>
            {usuarios.map(( usuario ) => {

                const { id_usuario, nombre, apellido_paterno, id_rol, email } = usuario 
                const nombreCompleto = `${nombre} ${apellido_paterno}`

                return(
                    <tr key={id_usuario}>
                        <td>{id_usuario}</td>
                        <td>{nombreCompleto}</td>
                        <td>{email}</td>
                        <td>{id_rol}</td>
                        <Acciones
                            editar={() => editarUsuario( id_usuario )}
                            eliminar={ () => abrirModalEliminarUsuario( id_usuario, nombreCompleto )}
                        />
                    </tr>
                )
            })}
        </TablaContainer>
        }
        { showModalEliminar.show &&
        <ModalEliminar
            cancelar={() => setShowModalEliminar( estadoInicialEliminarUsuario )}
            aceptar={() => eliminarUsuario( showModalEliminar.id )}
        >
            <p className="mb-0">¿Estás seguro de eliminar al usuario {showModalEliminar.nombre}?</p>
        </ModalEliminar>
        }
        </>
    )
}

export default Usuarios