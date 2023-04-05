import React from 'react'
import { Coparte } from '@api/models/copartes.model'
import { TablaBusqueda } from '@components/TablaBusqueda'
import { aMinuscula } from '@assets/utils/common'

const Copartes = () => {

    const buscarCopartes = ( {nombre, id}: Coparte, query: string ) => {
        
        return aMinuscula(nombre).includes(query) || aMinuscula(id).includes(query)
    }

    const formatearCoparte = ( data: Coparte[] ) => {

        const dataTransformada = data.map( ({ id_coparte, nombre, id, tipo }) => {
    
            return {
                id: id_coparte,
                txt_id: id,
                td: [
                    String(id_coparte),
                    nombre,
                    id,
                    tipo
                ]
            }
        })

        return dataTransformada
    }

    const headersTabla = [ "Id", "Nombre", "ID", "Tipo" ]

    return(
        <TablaBusqueda 
            routeEntidad="copartes"
            filtrarEntidades={buscarCopartes}
            headersTabla={headersTabla}
            modalEliminarMsj="la coparte"
            dataFormateada={formatearCoparte}
        />
    )
}

export default Copartes