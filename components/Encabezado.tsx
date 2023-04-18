interface EncabezadoProps {
  size?: string
  titulo: string
}

const Encabezado = ({ size, titulo }: EncabezadoProps) => {
  switch (size) {
    case "1":
      return <h1 className="color1 mb-0">{titulo}</h1>
    case "2":
      return <h2 className="color1 mb-0">{titulo}</h2>
    case "3":
      return <h3 className="color1 mb-0">{titulo}</h3>
    case "4":
      return <h4 className="color1 mb-0">{titulo}</h4>
    case "5":
      return <h5 className="color1 mb-0">{titulo}</h5>
    case "6":
      return <h6 className="color1 mb-0">{titulo}</h6>
    default:
      return <h2 className="color1 mb-0">{titulo}</h2>
  }
}

export { Encabezado }
