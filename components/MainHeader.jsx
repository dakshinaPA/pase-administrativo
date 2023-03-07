import { memo } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/auth.context'
// import logo from '../assets/img/logo.jpeg'

const MainHeader = memo(() => {

    const { user, logOut } = useAuth()

    if(!user){
        return(
            <header className="p-3 mb-5 colorHeader">
                Hola
                {/* <img src={logo} width="150" alt="logo dakshina" /> */}
            </header>
        )
    }

    const { nombre, apellido_paterno, apellido_materno } = user

    return(
        <header className="container-fluid py-3 mb-5 colorHeader">
            <div className="row">
                <div className="col-12 col-sm-6 d-flex align-items-center">
                    {/* <img src={logo} width="150" alt="logo dakshina" /> */}
                    <Link href="/">
                        <i className="bi bi-house-gear text-white" style={{fontSize: '35px'}}></i>
                    </Link>
                </div>
                <div className="col-12 col-sm-6 justify-content-end d-flex align-items-center">
                    <button
                        type="button"
                        style={{border: 'none', background:'none', color: 'white'}}
                        onClick={logOut}
                    >
                        Log Out
                    </button>
                    <span className="ms-2 color3">{nombre} {apellido_paterno} {apellido_materno}</span>
                </div>
            </div>
        </header>
    )
})

export { MainHeader }