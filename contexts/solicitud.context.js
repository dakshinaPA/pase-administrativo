import { createContext, useContext, useState } from "react";

const SolicitudContext = createContext()

const SolicitudProvider = ({children}) => {

    const estadoInicialForma = {
        proveedor: '',
        clabe: '',
        banco: '',
        titular: '',
        rfc: '',
        email1: '',
        email2: '',
        tipoGasto: 1,
        descripcion: '',
        partida: 1,
        importe: '',
        comprobante: 1,
        archivo: null
    }

    // const [ estadoForma, handleInputChange ] = useForm(estadoInicialForma)
    const [ estadoForma, setEstadoForma ]  = useState(estadoInicialForma)
    const [ solicitudes, setSolicitudes ] = useState([])
    const [ showForm, setShowForm ] = useState(true)
    const [ modo, setModo ] = useState('crear')
    const [ idsCounter, setIdsCounter ] = useState(1)

    const agregarSolcitiud = () => {
        setSolicitudes([...solicitudes, { id: idsCounter, ...estadoForma }])
        setIdsCounter(idsCounter + 1)
        limpiarForma()
    }

    const borrarSolicitud = (id) => {
        const nuevaLista = solicitudes.filter( solic => solic.id !== id)
        setSolicitudes(nuevaLista)
    }

    const editarSolicitud = (id) => {
        setModo('modificar')
        const solicitudAeditar = solicitudes.find( sol => sol.id === id)
        setEstadoForma(solicitudAeditar)
        setShowForm(true)
    }

    const modificarSolicitud = () => {
        const solcitudesClonadas = [...solicitudes]
        const indexAModificar = solcitudesClonadas.findIndex( solic => solic.id === estadoForma.id  )
        solcitudesClonadas[indexAModificar] = estadoForma
        setSolicitudes(solcitudesClonadas)
        limpiarForma()
    }
    
    const updateEstadoForma = ( name, value ) => {
        setEstadoForma({
            ...estadoForma,
            [name]: value
        })
    }

    const mostrarforma = () => setShowForm(true)

    const limpiarForma = () => {
        setEstadoForma(estadoInicialForma)
        setShowForm(false)
    }

    const mostrarFormatonuevaSolicitud = () => {
        setModo('crear')
        mostrarforma()
    }

    const value = { 
        solicitudes,
        showForm,
        agregarSolcitiud,
        editarSolicitud,
        borrarSolicitud,
        modificarSolicitud,
        estadoForma,
        updateEstadoForma,
        mostrarforma,
        modo,
        limpiarForma,
        mostrarFormatonuevaSolicitud
    }

    return(
        <SolicitudContext.Provider value={value}>
            {children}
        </SolicitudContext.Provider>
    )
}

const useSolicitudes = () => {
    const auth = useContext(SolicitudContext)
    return auth
}

export { SolicitudProvider, useSolicitudes }