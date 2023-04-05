import { FormContainer, InputContainer } from '@components/FormContainer'

const FormaCoparte = ({ onSubmit, estadoForma, handleInputChange, textoBoton }) => {

    const inputsForma = [
        { 
            type: "select",
            name: "id_tipo",
            label: "Tipo",
            options: [
                { label: "Constituida", value: 1 },
                { label: "No constituida", value: 2 },
            ]
        },
        { 
            type: "text",
            name: "nombre",
            label: "Nombre de la colectiva" 
        },
        { 
            type: "text",
            name: "id",
            label: "ID" 
        },
    ]

    return(
        <div className="container">
            <FormContainer
                textoBoton={textoBoton}
                onSubmit={onSubmit}
            >
            {inputsForma.map((input) => (
                <InputContainer
                    key={`input_${input.name}`}
                    onChange={handleInputChange}
                    value={estadoForma[input.name]}
                    clase="col-md-6 col-lg-4"
                    { ...input }
                />
            ))}
            </FormContainer>
        </div>
    )
}

export { FormaCoparte }