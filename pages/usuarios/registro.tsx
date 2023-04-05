import { useForm } from '@hooks/useForm'
import { useRouter } from 'next/router'
import { FormaUsuario } from '@components/FormaUsuario'
import { Heading } from '@components/Heading'
import { Usuario } from '@api/models/usuarios.model'
import { ApiCall } from '@assets/utils/apiCalls'

const RegistroUsuarios = () => {

    const estadoInicialForma: Usuario = {
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        password: '',
        id_rol: 2
    }

    const { estadoForma, handleInputChange } = useForm(estadoInicialForma)
    const router = useRouter()

    const agregarUsuario = async () => {
        try {
            const { data, error, mensaje } = await ApiCall.post( '/api/usuarios', estadoForma )

            if( error ){
                console.log( data )
            } else {
                router.push('/usuarios')
            }
        } catch (error) {
            console.log( error )
        }
    }

    return(
        <>
        <Heading titulo="Registro de usuario" navLink="/usuarios" />
        <FormaUsuario
            estadoForma={estadoForma}
            handleInputChange={handleInputChange}
            onSubmit={agregarUsuario}
        />
        </>
    )
}

export default RegistroUsuarios