const BtnEditar = ({ onClick }) => {
  return (
    <button type="button" className="btn btn-secondary" onClick={onClick}>
      Editar
      <i className="bi bi-pencil ms-2"></i>
    </button>
  )
}

export { BtnEditar }
