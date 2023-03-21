import ReactDOM from 'react-dom';
import { fondo } from './styles/FondoNegro.module.css'

const FondoNegro = (props) => {
    return ReactDOM.createPortal(
        <div className={fondo}>
            {props.children}
        </div>,
        document.querySelector('#modal')
    )
}

export { FondoNegro }