interface FormCont {
    textoBoton?: string
    children: JSX.Element[]
    cancelar?: boolean
    onSubmit: () => void
    onCancelSubmit?: () => void
}

interface OptionsSelect {
    value: string | number
    label: string
}

interface InputGeneral {
    type?: string
    name: string
    value: string
    placeholder?: string
    onChange: () => void
    options?: OptionsSelect[]
}

interface InputCont extends InputGeneral {
    label: string
    sublabel?: string
    clase: string
}

const Input = ({ type, name, value, placeholder, onChange }: InputGeneral) => {
    return(
        <input
            type={type}
            className="form-control"
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
        />
    )
}

const TextArea = ({ name, value, placeholder, onChange }: InputGeneral) => {
    return(
        <textarea
            className="form-control"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        >
        </textarea>
    )
}

const Select = ({ name, value, options, onChange }: InputGeneral) => {
    return(
        <select
            className="form-control"
            name={name}
            value={value}
            onChange={onChange}
        >
        {options.map( ({ value, label }) => (
            <option key={value} value={value}>{label}</option>
        ))}
        </select>
    )
}

const InputType = (props: InputGeneral) => {

    switch(props.type){
        case "select":
            return <Select {...props} />
        case "textarea":
            return <TextArea {...props} />
        default:
            return <Input {...props} />
    }
}

const InputContainer = (props: InputCont) => {

    const {label, sublabel, clase } = props

    return(
        <div className={`col-12 ${clase} mb-3`}>
            <label className="form-label">{label}</label>
            <InputType {...props} />
            {sublabel &&
            <div className="form-text">{sublabel}</div>
            }
        </div>
    )
}

const InputFile = (props) => {

    const { clase, name, onChange } = props

    return(
        <div className={`col-12 ${clase} mb-3`}>
            <label className="form-label">Arvhivo</label>
            <label>
                <input
                    type="file"
                    className="d-none"
                    name={name}
                    onChange={onChange}
                />
                <i className="bi bi-file-earmark-arrow-up"></i>
            </label>
        </div>
    )
}

const FormContainer = ({ textoBoton, children, cancelar, onSubmit, onCancelSubmit }: FormCont ) => {

    const handleSubmit = (ev) => {
        ev.preventDefault()
        onSubmit()
    }

    return(
        <form className="row colorForma py-3" onSubmit={handleSubmit}>
            {children}
            <div className="col-12 text-end">
                {cancelar &&
                <button
                    className="btn btn-secondary me-2"
                    type="button"
                    onClick={onCancelSubmit}
                >
                    Cancelar
                </button>
                }
                <button className="btn btn-secondary" type="submit">{textoBoton || 'Enviar'}</button>
            </div>
        </form>
    )
}

export { FormContainer, InputContainer, InputFile }