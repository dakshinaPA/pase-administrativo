const RegistroContenedor = ({ children }) => {
  return <div className="container px-4 pt-4">{children}</div>
}

const TablaContenedor = ({ children }) => {
  return <div className="container-fluid px-4 pt-4">{children}</div>
}

const FormaContenedor = ({ children, onSubmit, formaRef }) => {
  return (
    <form
      className="row py-3 mb-5"
      onSubmit={onSubmit}
      autoComplete="off"
      ref={formaRef}
    >
      {children}
    </form>
  )
}

export { RegistroContenedor, TablaContenedor, FormaContenedor }
