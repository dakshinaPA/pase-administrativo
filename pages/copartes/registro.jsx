import { useForm } from '@hooks/useForm'
import { useRouter } from 'next/router'
import { ApiCall } from '@assets/utils/apiCalls'
import { FormaCoparte } from '@components/FormaCoparte'
import { Heading } from '@components/Heading'


const RegistroCoparte = () => {

    const estadoInicialForma = {
        tipo: 1,
        nombre: '',
        id: ''
    }

    const { estadoForma, handleInputChange } = useForm(estadoInicialForma)
    const router = useRouter()

    const agregarCoparte = async () => {
        try {
            const { data, error, mensaje } = await ApiCall.post( '/api/copartes', estadoForma )

            if( error ){
                console.log( data )
            } else {
                router.push('/copartes')
            }
        } catch (error) {
            console.log( error )
        }
    }

    return(
        <>
        <Heading titulo="Registro de coparte" navLink="/copartes" />
        <FormaCoparte
            textoBoton="Registrar"
            estadoForma={estadoForma}
            handleInputChange={handleInputChange}
            onSubmit={agregarCoparte}
        />
        </>
    )
}

export default RegistroCoparte