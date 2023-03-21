const Acciones = ({ editar, eliminar }) => {
    return(
        <td className="d-flex">
            <button className="btn btn-dark me-1" onClick={editar}>
                <i className="bi bi-pencil"></i>
            </button>
            <button className="btn btn-dark" onClick={eliminar}>
                <i className="bi bi-x-circle"></i>
            </button>
        </td>
    )
}

const TablaContainer = ({ children, headres }) => {
    return(
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <table className="table">
                        <thead>
                            <tr>
                            {headres.map( (header, index) => (
                                <th key={`${index}_${header}`}>{header}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            { children }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export { TablaContainer, Acciones }