import { memo } from 'react'
import Link from 'next/link'

const Heading = memo(({ titulo, subtitulo, size, navLink }) => {

    const TituloPrincipal = () => {
       
        switch( size ){
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

    return(
        <div className="container mb-4">
            <div className="row">
                <div className="col-12 d-flex align-items-center">
                    { navLink &&
                    <Link href={navLink} className="me-1">
                        <i className="bi bi-arrow-left-circle"></i>
                    </Link>
                    }
                    <TituloPrincipal />
                    <h6 className="color1 mb-0">{subtitulo}</h6>
                </div>
            </div>
        </div>
    )
})

export { Heading }