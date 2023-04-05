import React from 'react'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Loader } from '@components/Loader'
import { ModalEliminar } from '@components/ModalEliminar'

interface DataTabla {
    id: number
    txt_id: string
    td: string[]
}

interface TablaBusquedaProps {
    routeEntidad: string
    headersTabla: string[]
    modalEliminarMsj: string
    dataFormateada: ( data: any[]) => DataTabla[]
    filtrarEntidades: ( entidad: any,  query: string ) => boolean
}

interface modalEliminar {
    show: boolean
    id: number
    txt_id: string
}

const TablaBusqueda = ( props: TablaBusquedaProps) => {

    const estadoInicialModalEliminar = { show: false, id: 0, txt_id: '' }

    const { routeEntidad, headersTabla, modalEliminarMsj, dataFormateada, filtrarEntidades } = props

    const router = useRouter()
    const entidadesDB = useRef<any[]>([])
    const [ entidades, setEntidades ] = useState<any[]>([])
    const [ isLoading, setIsLoading ] = useState<boolean>(true)
    const [ showModalEliminar, setShowModalEliminar ] = useState<modalEliminar>( estadoInicialModalEliminar )

    useEffect(() => {

        obtenerEntidades()
    }, [])

    const obtenerEntidades =  async () => {
        try {
            const { error, data } = await ApiCall.get( `/api/${routeEntidad}` )

            if( error ){
                console.log( data )
            } else {
                entidadesDB.current = data
                setEntidades( data )
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const abrirModalEliminarEntidad = ( id: number, txt_id: string ) => {
        setShowModalEliminar({ show: true, id, txt_id })
    }

    const resetModalEliminar = () => {
        setShowModalEliminar( estadoInicialModalEliminar )
    }

    const eliminarEntidad = async () => {

        setShowModalEliminar( estadoInicialModalEliminar )
        setIsLoading( true )

        try {
            const { error, data } = await ApiCall.delete( `/api/${routeEntidad}/${showModalEliminar.id}`)

            if( error ){
                console.log( data )
            } else {
                obtenerEntidades()
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const buscarRegistro = ( query: string ) => {

        const entidadesFiltradas = entidadesDB.current.filter((it) => filtrarEntidades( it, query.toLocaleLowerCase() ))
        setEntidades( entidadesFiltradas )
    }

    const data = dataFormateada( [...entidades] )

    return(
        <>
        <div className="container">
            <div className="row mb-4">
                <div className="col-12 col-md-7">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => router.push(`/${routeEntidad}/registro`)}
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
                            placeholder="Buscar registro"
                            onChange={({target: {value}}) => buscarRegistro( value )}
                        />
                        <span className="input-group-text">
                            <i className="bi bi-search"></i>
                        </span>
                    </div>
                </div>
            </div>
            { isLoading 
            ?
            <Loader/>
            :
            <div className="row">
                <div className="col-12">
                    <table className="table">
                        <thead>
                            <tr>
                            {headersTabla.map( (header, index) => (
                                <th key={`${index}_${header}`}>{header}</th>
                            ))}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        { data.map( item => (
                            <tr key={`item_${item.id}`}>
                            {item.td.map( (valor, index) => (
                                <td key={`td_${index}`}>{valor}</td>
                            ))}
                                <td className="d-flex">
                                    <button className="btn btn-dark me-1" onClick={() => router.push(`/${routeEntidad}/${item.id}`)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn btn-dark" onClick={() => abrirModalEliminarEntidad( item.id, item.txt_id )}>
                                        <i className="bi bi-x-circle"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            }
        </div>
        { showModalEliminar.show &&
        <ModalEliminar
            cancelar={resetModalEliminar}
            aceptar={eliminarEntidad}
        >
            <p className="mb-0">{`¿Estás segur@ de eliminar ${modalEliminarMsj} ${showModalEliminar.txt_id}?`}</p>
        </ModalEliminar>
        }
        </>
    )
}

export { TablaBusqueda }