import { memo } from 'react'

const Heading = memo(({ titulo, subtitulo, size }) => {

    const TituloPrincipal = () => {
       
        switch( size ){
            case "1":
                return <h1 className="color1">{titulo}</h1>
            case "2":
                return <h2 className="color1">{titulo}</h2>
            case "3":
                return <h3 className="color1">{titulo}</h3>
            case "4":
                return <h4 className="color1">{titulo}</h4>
            case "5":
                return <h5 className="color1">{titulo}</h5>
            case "6":
                return <h6 className="color1">{titulo}</h6>
            default:
                return <h2 className="color1">{titulo}</h2>
        }
    }

    return(
        <div className="container mb-4">
            <div className="row">
                <div className="col-12">
                    <TituloPrincipal />
                    <h6 className="color1">{subtitulo}</h6>
                </div>
            </div>
        </div>
    )
})

export { Heading }