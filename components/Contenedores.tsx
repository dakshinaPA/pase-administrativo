const RegistroContenedor = ({ children }) => {
  return <div className="container px-4 pt-4">{children}</div>
}

const TablaContenedor = ({ children }) => {
  return <div className="container-fluid px-4 pt-4">{children}</div>
}

const FormaContenedor = ({ children, onSubmit }) => {
  return (
    <form className="row py-3 mb-3 border" onSubmit={onSubmit} autoComplete="off">
      {children}
    </form>
  )
}


export { RegistroContenedor, TablaContenedor, FormaContenedor }
