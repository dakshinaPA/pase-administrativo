import {
  FormContainer,
  InputContainer,
  BtnRegistrar,
  BtnCancelar,
} from "@components/FormContainer"
import { Encabezado } from "@components/Encabezado"
import { BtnBack } from "@components/BtnBack"
import { useForm } from "@hooks/useForm"
import { Usuario } from "@api/models/usuarios.model"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { Loader } from "@components/Loader"

const FormaUsuario = () => {
  const estadoInicialForma: Usuario = {
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    id_rol: 2,
  }

  const { estadoForma, setEstadoForma, handleInputChange } =
    useForm(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idUsuario = router.query.id

  useEffect(() => {
    if (idUsuario) {
      obtenerUsuario()
    }
  }, [])

  const obtenerUsuario = async () => {
    setIsLoading(true)

    const { error, data } = await ApiCall.get(`/api/usuarios/${idUsuario}`)

    if (!error) {
      setEstadoForma(data[0])
    }
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    let res: ApiCallRes

    if (idUsuario) {
      res = await ApiCall.put(`/api/usuarios/${idUsuario}`, estadoForma)
    } else {
      res = await ApiCall.post(`/api/usuarios/${idUsuario}`, estadoForma)
    }

    if (!res.error) {
      router.push("/usuarios")
    }
    setIsLoading(false)
  }

  const cancelar = () => {
    router.push("/usuarios")
  }

  const inputsForma = [
    {
      type: "text",
      name: "nombre",
      label: "Nombre",
    },
    {
      type: "text",
      name: "apellido_paterno",
      label: "Apellido paterno",
    },
    {
      type: "text",
      name: "apellido_materno",
      label: "Apellido materno",
    },
    {
      type: "text",
      name: "email",
      label: "Correo electrónico",
    },
    {
      type: "text",
      name: "password",
      label: "Contraseña",
    },
    {
      type: "select",
      name: "id_rol",
      label: "Rol de usuario",
      options: [
        { value: 2, label: "Administrador" },
        { value: 1, label: "Super usuario" },
        { value: 3, label: "Coparte" },
      ],
    },
  ]

  const inputs = inputsForma.map((input) => (
    <InputContainer
      key={`input_${input.name}`}
      onChange={handleInputChange}
      value={estadoForma[input.name]}
      clase="col-md-6 col-lg-4"
      {...input}
    />
  ))

  const botones = (
    <>
      <BtnCancelar cancelar={cancelar} />
      <BtnRegistrar textoBtn={idUsuario ? "Actualizar" : "Registrar"} />
    </>
  )

  return (
    <>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12 d-flex align-items-center">
            <BtnBack navLink="/usuarios" />
            <Encabezado
              size="2"
              titulo={`${idUsuario ? "Editar" : "Registrar"} usuario`}
            />
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
          <FormContainer
            inputs={inputs}
            botones={botones}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  )
}

export { FormaUsuario }
