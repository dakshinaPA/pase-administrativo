import {
  FormContainer,
  InputContainer,
  BtnRegistrar,
  BtnCancelar,
} from "@components/FormContainer"
import { Encabezado } from "@components/Encabezado"
import { BtnBack } from "@components/BtnBack"
import { useForm } from "@hooks/useForm"
import { Coparte } from "@api/models/copartes.model"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { Loader } from "@components/Loader"

const FormaCoparte = () => {
  const estadoInicialForma: Coparte = {
    nombre: "",
    id_tipo: 1,
    id: "",
  }

  const { estadoForma, setEstadoForma, handleInputChange } =
    useForm(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idCoparte = router.query.id

  useEffect(() => {
    if (idCoparte) {
      obtenerCoparte()
    }
  }, [])

  const obtenerCoparte = async () => {
    setIsLoading(true)

    const { error, data } = await ApiCall.get(`/api/copartes/${idCoparte}`)

    if (!error) {
      setEstadoForma(data[0])
    }
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    let res: ApiCallRes

    if (idCoparte) {
      res = await ApiCall.put(`/api/copartes/${idCoparte}`, estadoForma)
    } else {
      res = await ApiCall.post(`/api/copartes/${idCoparte}`, estadoForma)
    }

    if (!res.error) {
      router.push("/copartes")
    }
    setIsLoading(false)
  }

  const cancelar = () => {
    router.push("/copartes")
  }

  const inputsForma = [
    {
      type: "select",
      name: "id_tipo",
      label: "Tipo",
      options: [
        { label: "Constituida", value: 1 },
        { label: "No constituida", value: 2 },
      ],
    },
    {
      type: "text",
      name: "nombre",
      label: "Nombre de la colectiva",
    },
    {
      type: "text",
      name: "id",
      label: "ID",
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
      <BtnRegistrar textoBtn={idCoparte ? "Actualizar" : "Registrar"} />
    </>
  )

  return (
    <>
      <div className="container">
        <div className="row mb-4">
          <div className="col-12 d-flex align-items-center">
            <BtnBack navLink="/copartes" />
            <Encabezado
              size="2"
              titulo={`${idCoparte ? "Editar" : "Registrar"} coparte`}
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

export { FormaCoparte }
