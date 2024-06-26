const RegistroContenedor = ({ children }) => {
  return <div className="container px-4 pt-4">{children}</div>
}

const TablaContenedor = ({ children }) => {
  return <div className="container-fluid px-4 pt-4">{children}</div>
}

const Contenedor = ({ children }) => {
  return (
    <div className="container-fluid px-4 pt-4">
      <div className="row">
        <div className="col-12">{children}</div>
      </div>
    </div>
  )
}

const FormaContenedor = ({ children, onSubmit, formaRef }) => {
  const handleSubmit = (ev: React.SyntheticEvent) => {
    // console.log('si', ev)
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

export { RegistroContenedor, TablaContenedor, FormaContenedor, Contenedor }
