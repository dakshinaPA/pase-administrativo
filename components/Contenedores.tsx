const RegistroContenedor = ({ children }) => {
  return <div className="container px-4 pt-4">{children}</div>
}

const TablaContenedor = ({ children }) => {
  return <div className="container-fluid px-4 pt-4">{children}</div>
}

const FormaContenedor = ({ children, onSubmit, formaRef }) => {
  const handleSubmit = (ev: React.SyntheticEvent) => {
    ev.preventDefault()
    onSubmit()
  }

  return (
    <form
      className="row py-3 mb-5"
      onSubmit={handleSubmit}
      autoComplete="off"
      ref={formaRef}
    >
      {children}
    </form>
  )
}

export { RegistroContenedor, TablaContenedor, FormaContenedor }
