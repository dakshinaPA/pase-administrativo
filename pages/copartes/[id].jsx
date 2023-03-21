import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from '@hooks/useForm'
import { ApiCall } from '@assets/utils/apiCalls'
import { Heading } from '@components/Heading'
import { FormaCoparte } from '@components/FormaCoparte'
import { Loader } from '@components/Loader'


const Coparte = () => {

    const estadoInicialForma = {
        nombre: '',
        id: '',
        tipo: 0
    }
    const router = useRouter()
    const idCoparte = router.query.id
    const { estadoForma, setEstadoForma, handleInputChange } = useForm(estadoInicialForma)
    const [ isLoading, setIsLoading ] = useState( true )

    useEffect(() => {

        obtenerCoparte()
    }, [])

    const obtenerCoparte = async () => {
        try {
            const { error, data } = await ApiCall.get( `/api/copartes/${idCoparte}` )

            if( error ){
                console.log( data )
            } else {
                setEstadoForma( data[0] )
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    const actulizarCoparte = async () => {

        setIsLoading( true )

        try {
            const { data, error, mensaje } = await ApiCall.put( `/api/copartes/${idCoparte}`, estadoForma )

            if( error ){
                console.log( data )
            } else {
                router.push('/copartes')
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    return(
        <>
        <Heading titulo="Editar coparte" navLink="/copartes" />
        { isLoading 
        ? 
        <Loader />
        :         
        <FormaCoparte
            textoBoton="Actualizar"
            estadoForma={estadoForma}
            handleInputChange={handleInputChange}
            onSubmit={actulizarCoparte}
        />
        }

        </>
    )
}

export default Coparte