import React from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Usuario } from "@models/usuario.model"

const MainHeader = ({ abrirMenu }) => {
  const { data, status } = useSession()

  const logOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  if (status !== "authenticated") {
    return null
  }

  const { nombre } = data.user as Usuario

  return (
    <header
      className="colorHeader d-flex justify-content-between align-items-center px-3"
      style={{ height: "50px" }}
    >
      <div>
        <Link href="/" className="d-none d-md-block">
          <img
            src="https://dakshina-imagen.s3.us-east-2.amazonaws.com/logo-blanco.png"
            alt="logo dakshina"
            height={40}
          />
        </Link>
        <i
          className="bi bi-list text-white d-md-none"
          style={{ fontSize: "30px" }}
          onClick={abrirMenu}
        ></i>
      </div>
      <div>
        <span className="color2">{nombre}</span>
        <button type="button" className="btn btn-sm" onClick={logOut}>
          <i className="bi bi-box-arrow-right text-white"></i>
        </button>
      </div>
    </header>
  )
}

export { MainHeader }
