import React from 'react'
import { Usuario } from '@api/models/usuarios.model'
import { TablaBusqueda } from '@components/TablaBusqueda'
import { aMinuscula } from '@assets/utils/common'

const Usuarios = () => {

    const buscarUsuarios = ( usuario: Usuario, query: string ) => {

        const { nombre, apellido_paterno, apellido_materno, email } = usuario

        return aMinuscula(nombre).includes(query)
            || aMinuscula(apellido_paterno).includes(query)
            || aMinuscula(apellido_materno).includes(query)
            || aMinuscula(email).includes(query)
    }

    const headersTabla = [ "Id", "Nombre", "Email", "Rol" ]

    const formatearDataUsuario = ( data: Usuario[] ) => {

        const dataTransformada = data.map( ({ id_usuario, nombre, apellido_paterno, email, rol }) => {

            const nombreUsuario = `${nombre} ${apellido_paterno}`
    
            return {
                id: id_usuario,
                txt_id: nombreUsuario,
                td: [
                    String(id_usuario),
                    nombreUsuario,
                    email,
                    rol
                ]
            }
        })

        return dataTransformada
    }

    return(
        <TablaBusqueda 
            routeEntidad="usuarios"
            filtrarEntidades={buscarUsuarios}
            headersTabla={headersTabla}
            modalEliminarMsj="al usuario"
            dataFormateada={formatearDataUsuario}
        />
    )
}

export default Usuarios