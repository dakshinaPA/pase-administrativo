import { TablaContainer, Acciones } from '@components/TablaContainer'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@components/Loader'
import { ModalEliminar } from '@components/ModalEliminar'


const Copartes = () => {

    const estadoInicialCoparteEliminar = {
        show: false,
        id_coparte: 0,
        id: ''
    }

    const copartesDB = useRef([])
    const [ copartes, setCopartes ] = useState([])
    const [ isLoading, setIsLoading ] = useState( true )
    const [ showModalEliminar, setShowModalEliminar ] = useState( estadoInicialCoparteEliminar )
    const router = useRouter()

    useEffect(() => {

        obtenerCopartes()
    }, [])

    const obtenerCopartes =  async () => {
        try {
            const { error, data } = await ApiCall.get( '/api/copartes' )

            if( error ){
                console.log( data )
            } else {
                copartesDB.current = data
                setCopartes( data )
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const eliminarCoparte = async ( id ) => {

        setShowModalEliminar( estadoInicialCoparteEliminar )
        setIsLoading( true )
        try {
            const { error, data } = await ApiCall.delete( `/api/copartes/${id}`)

            if( error ){
                console.log( data )
            } else {
                obtenerCopartes()
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const abrirModalEliminarCoparte = ( id, id_coparte ) => {
        
        setShowModalEliminar({
            show: true,
            id,
            id_coparte
        })
    }

    const editarCoparte = ( id ) => {
        router.push(`/copartes/${id}`)
    }

    const buscarCoparte = ({ target: { value } }) => {

        const copartesFiltradas = copartesDB.current.filter( cop => cop.nombre.toLowerCase().includes(value.toLowerCase()) || cop.id.toLowerCase().includes(value.toLowerCase()) )
        setCopartes( copartesFiltradas )
    }

    const headersTabla = [ "Nombre", "Id", "Tipo", "Acciones" ]

    return(
        <>
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 col-md-7">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push('copartes/registro')}
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
                            placeholder="Buscar coparte"
                            onChange={buscarCoparte}
                            disabled={isLoading}
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
            {copartes.map(({ id_coparte, nombre, id, tipo }) => (
                <tr key={id_coparte}>
                    <td>{nombre}</td>
                    <td>{id}</td>
                    <td>{tipo}</td>
                    <Acciones
                        editar={() => editarCoparte( id_coparte )}
                        eliminar={ () => abrirModalEliminarCoparte( id, id_coparte )}
                    />
                </tr>
            ))}
        </TablaContainer>
        }
        { showModalEliminar.show &&
        <ModalEliminar
            cancelar={() => setShowModalEliminar( estadoInicialCoparteEliminar )}
            aceptar={() => eliminarCoparte( showModalEliminar.id_coparte )}
        >
            <p className="mb-0">¿Estás seguro de eliminar la coparte {showModalEliminar.id}?</p>
        </ModalEliminar>
        }
        </>
    )
}

export default Copartes