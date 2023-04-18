import { ReactNode } from "react"

interface FormContainerProps {
  inputs: ReactNode
  botones: ReactNode
  onSubmit: () => void
}

interface BtnCancelarProps {
  cancelar: () => void
}

interface OptionsSelect {
  value: string | number
  label: string
}

interface InputGeneralProps {
  type?: string
  name: string
  value: string
  placeholder?: string
  onChange: () => void
  options?: OptionsSelect[]
}

interface InputContProps extends InputGeneralProps {
  label: string
  sublabel?: string
  clase: string
}

interface BtnRegistrarProps {
  textoBtn: string
}

const Input = ({
  type,
  name,
  value,
  placeholder,
  onChange,
}: InputGeneralProps) => {
  return (
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

const TextArea = ({
  name,
  value,
  placeholder,
  onChange,
}: InputGeneralProps) => {
  return (
    <textarea
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    ></textarea>
  )
}

const Select = ({ name, value, options, onChange }: InputGeneralProps) => {
  return (
    <select
      className="form-control"
      name={name}
      value={value}
      onChange={onChange}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  )
}

const InputType = (props: InputGeneralProps) => {
  switch (props.type) {
    case "select":
      return <Select {...props} />
    case "textarea":
      return <TextArea {...props} />
    default:
      return <Input {...props} />
  }
}

const InputContainer = (props: InputContProps) => {

  const { label, sublabel, clase } = props

  return (
    <div className={`col-12 ${clase} mb-3`}>
      <label className="form-label">{label}</label>
      <InputType {...props} />
      {sublabel && <div className="form-text">{sublabel}</div>}
    </div>
  )
}

const InputFile = (props) => {

  const { clase, name, onChange } = props

  return (
    <div className={`col-12 ${clase} mb-3`}>
      <label className="form-label">Arvhivo</label>
      <label>
        <input type="file" className="d-none" name={name} onChange={onChange} />
        <i className="bi bi-file-earmark-arrow-up"></i>
      </label>
    </div>
  )
}

const BtnRegistrar = ({ textoBtn }: BtnRegistrarProps) => {
  return (
    <button type="submit" className="btn btn-secondary">
      {textoBtn}
    </button>
  )
}

const BtnCancelar = ({ cancelar }: BtnCancelarProps) => {
  return (
    <button type="button" className="btn btn-secondary me-2" onClick={cancelar}>
      Cancelar
    </button>
  )
}

const FormContainer = ({ inputs, botones, onSubmit }: FormContainerProps) => {

  const handleSubmit = (ev) => {
    ev.preventDefault()
    onSubmit()
  }

  return (
    <form className="row colorForma py-3" onSubmit={handleSubmit}>
      {inputs}
      <div className="col-12 py-2 text-end">{botones}</div>
    </form>
  )
}

export { FormContainer, InputContainer, InputFile, BtnRegistrar, BtnCancelar }
