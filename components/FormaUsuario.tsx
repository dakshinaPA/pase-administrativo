import { FormContainer, InputContainer } from '@components/FormContainer'

interface FormUser {
    onSubmit: () => void
    estadoForma: any
    handleInputChange: () => void
    textoBoton?: string
}

const FormaUsuario = ({ onSubmit, estadoForma, handleInputChange, textoBoton}: FormUser) => {

    const inputsForma = [
        { 
            type: "text",
            name: "nombre",
            label: "Nombre" 
        },
        { 
            type: "text",
            name: "apellido_paterno",
            label: "Apellido paterno",
        },
        { 
            type: "text",
            name: "apellido_materno",
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
            name: "id_rol",
            label: "Rol de usuario",
            options: [
                { value: 2, label: 'Administrador' },
                { value: 1, label: 'Super usuario' },
                { value: 3, label: 'Coparte' },
            ]
        },
    ]

    return(
        <>
        <div className="container">
            <FormContainer
                textoBoton={ textoBoton || 'Registrar'}
                onSubmit={onSubmit}
            >
            {inputsForma.map((input) => (
                <InputContainer
                    key={`input_${input.name}`}
                    onChange={handleInputChange}
                    value={estadoForma[input.name]}
                    clase="col-md-6 col-lg-4"
                    {...input}
                />
            ))}
            </FormContainer>
        </div>
        </>
    )
}

export { FormaUsuario }