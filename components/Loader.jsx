import { FondoNegro } from '@components/FondoNegro'
import { loaderContainer, spinner } from './styles/Loader.module.css'

const Loader = () => {
    return(
        <FondoNegro>
            <div className={loaderContainer}>
                <i className={`bi bi-arrow-repeat ${spinner} color3`}></i>
            </div>
        </FondoNegro>
    )
}

export { Loader }