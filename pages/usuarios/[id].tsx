import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useForm } from '@hooks/useForm'
import { ApiCall } from '@assets/utils/apiCalls'
import { Heading } from '@components/Heading'
import { FormaUsuario } from '@components/FormaUsuario'
import { Loader } from '@components/Loader'
import { Usuario } from '@api/models/usuarios.model'

const Usuario = () => {

    const estadoInicialForma: Usuario = {
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: ''
    }

    const router = useRouter()
    const idUsuario = router.query.id
    const { estadoForma, setEstadoForma, handleInputChange } = useForm(estadoInicialForma)
    const [ isLoading, setIsLoading ] = useState<boolean>( true )

    useEffect(() => {

        obtenerUsuario()
    }, [])

    const obtenerUsuario = async () => {
        try {
            const { error, data } = await ApiCall.get( `/api/usuarios/${idUsuario}` )

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

    const actulizarUsuario = async () => {

        setIsLoading( true )

        try {
            const { data, error, mensaje } = await ApiCall.put( `/api/usuarios/${idUsuario}`, estadoForma )

            if( error ){
                console.log( data )
            } else {
                router.push('/usuarios')
            }
        } catch (error) {
            console.log( error )
        } finally {
            setIsLoading( false )
        }
    }

    return(
        <>
        <Heading titulo="Edita Usuario" navLink="/usuarios" />
        { isLoading 
        ? 
        <Loader />
        :         
        <FormaUsuario
            estadoForma={estadoForma}
            handleInputChange={handleInputChange}
            onSubmit={actulizarUsuario}
            textoBoton="Actualizar"
        />
        }
        </>
    )
}

export default Usuario