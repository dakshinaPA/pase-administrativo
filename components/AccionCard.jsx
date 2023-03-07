import { memo } from 'react'
import Link from 'next/link'
import styles from './styles/AccionCard.module.css'

const AccionCard = memo(({ id, titulo, link, icon }) => {

    return(
        <div className="col-12 col-sm-6 col-md-4 col-lg-3 py-2">
            <Link href={link}>
                <div className={`py-3 text-center ${styles.accionCard}`}>
                    <i className={`bi ${icon}`}></i>
                    <h6>{titulo}</h6>                    
                </div>
            </Link>
        </div>
    )
})

export { AccionCard }