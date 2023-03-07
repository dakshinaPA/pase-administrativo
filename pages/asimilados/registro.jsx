import { useForm } from '@hooks/useForm'
import { FormContainer, InputContainer } from '@components/FormContainer'
import { Heading } from '@components/Heading'

const RegistroAsimilados = () => {

    const estadoInicialForma = {
        coparte: '',
        colaborador: '',
        rfc: '',
        curp: '',
        domicilio: '',
        servicio: '',
        descripcion: '',
        salarioBruto: '',
        salarioNeto: '',
        retencion: '',
        frecuencia: 1,
        vigencia: '',
        encargado: '',
    }

    const { estadoForma, handleInputChange } = useForm(estadoInicialForma)


    const inputsForma = [
        { 
            type: "text",
            name: "coparte",
            label: "Nombre de la coparte" 
        },
        { 
            type: "text",
            name: "colaborador",
            label: "Nombre completo del colaborador",
            sublabel: "Como aparece en su identificación oficial"
        },
        {
            type: "text",
            name: "rfc",
            label: "RFC del colaborador",
            sublabel: "Ingrese RFC con homoclave"
        },
        { 
            type: "text",
            name: "curp",
            label: "CURP del colaborador"
        },
        { 
            type: "text",
            name: "domicilio",
            label: "Domicilio del colaborador",
            sublabel: "Debe ser el mismo que el enviado en el expediente"
        },
        { 
            type: "text",
            name: "servicio",
            label: "Nombre de servicio o actividad realizada",
            sublabel: "Debe ser lo más conciso posible, por ejemplo: facilitador, tallerista, etc."
        },
        {
            type: "textarea",
            name: "descripcion",
            label: "Descripción del servicio o actividad",
            sublabel: "Debe describir al menos 1 realizado en el proyecto"
        },
        { 
            type: "number",
            name: "salarioBruto",
            label: "Salario bruto del colaborador",
            sublabel: "El monto debe ser el salario antes de impuestos que se indicó en el presupuesto"
        },
        { 
            type: "number",
            name: "salarioNeto",
            label: "Salario neto del colaborador",
            sublabel: "El monto debe ser el que recibe el colaborador en su cuenta bancaria (después de impuestos)"
        },
        { 
            type: "number",
            name: "retencion",
            label: "Retenciones ISR salario",
            sublabel: "El monto debe ser la diferencia entre el salario bruto y el neto (Bruto-Neto)"
        },
        {
            type: "select",
            name: "frecuencia",
            label: "Frecuencia de pago",
            options: [
                { value: 1, label: 'Semanal' },
                { value: 2, label: 'Quincenal' },
                { value: 3, label: 'Mensual' },
            ]
        },
        { 
            type: "text",
            name: "vigencia",
            label: "Vigencia",
            sublabel: "Pueden ser hasta 6 meses por ejercicio fiscal. Ejemplo: del 1 de mayo de 2022 al 31 de octubre de 2022."
        },
        { 
            type: "text",
            name: "encargado",
            label: "Encargado del proyecto",
            sublabel: "Nombre de la encargada del proyecto o enlace"
        },
    ]

    const onSubmit = () => {
        console.log(estadoForma)
    }

    // if(!user) return null

    return(
        <>
        <Heading
            titulo="Registro de colaboradores asimilados a salarios - copartes"
            subtitulo="Formulario de registro de asimilados a salarios. Las respuestas deben ser individuales por cada colaborador asimilado a salarios. Quien llena el formulario debe ser el responsable del proyecto"
        />
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
                    clase="col-md-6"
                    {...input}
                />
            ))}
            </FormContainer>
        </div>
        </>
    )
}

export default RegistroAsimilados