import React, { memo } from "react"
import Link from "next/link"
import { useAuth } from "../contexts/auth.context"
// import logo from '../assets/img/logo.jpeg'

const MainHeader = memo(() => {
  const { user } = useAuth()

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
      <span className="color3">
        {nombre} {apellido_paterno} {apellido_materno}
      </span>
    </header>
  )
})

export { MainHeader }
