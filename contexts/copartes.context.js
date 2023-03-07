import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useForm } from '@hooks/useForm'
import { ApiCall } from '@assets/utils/apiCalls'
import { useRouter } from 'next/router'

const CopartesContext = createContext()

const CopartesProvider = ({children}) => {

    const estadoInicialForma = {
        tipo: 2,
        nombre: '',
        id: ''
    }

    const copartesDB = useRef([])
    const [ copartes, setCopartes ] = useState([])
    const { estadoForma, handleInputChange, setEstadoForma } = useForm(estadoInicialForma)
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
        }
    }

    const agregarCoparte = async () => {
        try {
            const { data, error, mensaje } = await ApiCall.post( '/api/copartes', estadoForma )

            if( error ){
                console.log( data )
            } else {
                await obtenerCopartes()
                router.push('/copartes')
            }
        } catch (error) {
            console.log( error )
        }
    }

    const editarCoparte = ( id ) => {
        router.push(`/copartes/${id}`)
    }

    const actulizarCoparte = async () => {
        try {
            const { data, error, mensaje } = await ApiCall.put( '/api/copartes', estadoForma )

            if( error ){
                console.log( data )
            } else {
                await obtenerCopartes()
                router.push('/copartes')
            }
        } catch (error) {
            console.log( error )
        }
    }

    const eliminarCoparte = async ( id ) => {
        try {
            const { error, data } = await ApiCall.delete( '/api/copartes', id )

            if( error ){
                console.log( data )
            } else {
                obtenerCopartes()
            }
        } catch (error) {
            console.log( error )
        }
    }

    const buscarCoparte = ({ target: { value } }) => {

        const copartesFiltradas = copartesDB.current.filter( cop => cop.nombre.toLowerCase().includes(value.toLowerCase()) || cop.id.toLowerCase().includes(value.toLowerCase()) )
        setCopartes( copartesFiltradas )
    }

    const limpiarForma = () => {
        setEstadoForma( estadoInicialForma )
    }

    const value = { 
        copartesDB,
        copartes,
        editarCoparte,
        eliminarCoparte,
        buscarCoparte,
        estadoForma,
        handleInputChange,
        agregarCoparte,
        setEstadoForma,
        actulizarCoparte,
        limpiarForma
    }

    return(
        <CopartesContext.Provider value={value}>
            {children}
        </CopartesContext.Provider>
    )
}

const useCopartes = () => {
    const context = useContext(CopartesContext)
    return context
}

export { CopartesProvider, useCopartes }