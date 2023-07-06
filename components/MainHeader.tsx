import React, { memo } from "react"
import Link from "next/link"
import { useAuth } from "../contexts/auth.context"
// import logo from '../assets/img/logo.jpeg'

const MainHeader = memo(() => {
  const { user, logOut } = useAuth()

  if (!user) {
    return <header className="colorHeader" style={{ height: "50px" }}></header>
  }

  const { nombre, apellido_paterno, apellido_materno } = user

  return (
    <header
      className="colorHeader d-flex justify-content-between align-items-center px-3"
      style={{ height: "50px" }}
    >
      <Link href="/">
        <i
          className="bi bi-house-gear text-white"
          style={{ fontSize: "30px" }}
        ></i>
      </Link>
      <div>
        <span className="color2">
          {nombre} {apellido_paterno} {apellido_materno}
        </span>
        <button
          type="button"
          className="btn btn-sm"
          onClick={logOut}
        >
          <i className="bi bi-box-arrow-right text-white"></i>
        </button>
      </div>
    </header>
  )
})

export { MainHeader }
