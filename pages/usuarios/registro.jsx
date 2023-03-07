import { useForm } from '@hooks/useForm'
import { FormContainer, InputContainer } from '@components/FormContainer'
import { Heading } from '@components/Heading'

const RegistroUsuarios = () => {

    const estadoInicialForma = {
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        email: '',
        password: ''
    }

    const { estadoForma, handleInputChange } = useForm(estadoInicialForma)


    const inputsForma = [
        { 
            type: "text",
            name: "nombre",
            label: "Nombre" 
        },
        { 
            type: "text",
            name: "apellidoPaterno",
            label: "Apellido paterno",
        },
        { 
            type: "text",
            name: "apellidoMaterno",
            label: "Apellido materno",
        },
        { 
            type: "text",
            name: "email",
            label: "Correo electrónico",
        },
        { 
            type: "text",
            name: "password",
            label: "Contraseña",
        },
        { 
            type: "select",
            name: "rol",
            label: "Rol de usuario",
            options: [
                { value: 2, label: 'Administrador' },
                { value: 1, label: 'Super usuario' },
            ]
        },
    ]

    const onSubmit = () => {
        console.log(estadoForma)
    }

    // if(!user) return null

    return(
        <>
        <Heading titulo="Registro de usuario" />
        <div className="container">
            <FormContainer
                textoBoton="Registrar"
                onSubmit={onSubmit}
            >
            {inputsForma.map((input) => (
                <InputContainer
                    key={`input_${input.name}`}
                    onChange={handleInputChange}
                    value={estadoForma[input.name]}
                    clase="col-md-4"
                    {...input}
                />
            ))}
            </FormContainer>
        </div>
        </>
    )
}

export default RegistroUsuarios