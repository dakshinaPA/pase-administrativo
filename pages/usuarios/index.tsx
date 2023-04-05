import React from 'react'
import { TablaContainer, Acciones } from '@components/TablaContainer'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@components/Loader'
import { ModalEliminar } from '@components/ModalEliminar'
import { Usuario } from '@api/models/usuarios.model'
import { TablaBusqueda } from '@components/TablaBusqueda'

interface modalEliminar {
    show: boolean
    id: number
    nombre: string
}

const Usuarios = () => {

    const estadoInicialEliminarUsuario = {
        show: false,
        id: 0,
        nombre: ''
    }

    const usuariosDB = useRef<Usuario[]>([])
    const [ usuarios, setUsuarios ] = useState<Usuario[]>([])
    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ showModalEliminar, setShowModalEliminar ] = useState<modalEliminar>(estadoInicialEliminarUsuario)
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
        console.log(value)
    }

    const headersTabla = [ "Id", "Nombre", "Email", "Rol", "Acciones" ]

    return(
        <TablaBusqueda 
            routeRegistro="/usuarios/registro"
            buscarRegistro={buscarUsuario}
            isLoading={isLoading}
            headersTabla={headersTabla}
            showModalEliminar={showModalEliminar.show}
            resetModalEliminar={() => setShowModalEliminar(estadoInicialEliminarUsuario)}
            eliminarEntidad={() => eliminarUsuario(showModalEliminar.id)}
            modalEliminarMsj={`¿Estás segur@ de eliminar al usuario ${showModalEliminar.nombre}`}
        >
            {usuarios.map(( usuario ) => {

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
            })}
        </TablaBusqueda>
    )
}

export default Usuarios