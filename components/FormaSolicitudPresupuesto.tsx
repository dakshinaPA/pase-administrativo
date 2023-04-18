import {
  FormContainer,
  InputContainer,
  BtnRegistrar,
  BtnCancelar,
} from "@components/FormContainer"
import { Encabezado } from "@components/Encabezado"
import { BtnBack } from "@components/BtnBack"
import { useForm } from "@hooks/useForm"
import { SolicitudPresupuesto } from "@api/models/solicitudesPresupuestos.model"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { ApiCall, ApiCallRes } from "@assets/utils/apiCalls"
import { Loader } from "@components/Loader"

const FormaSolicitudPresupuesto = () => {
  const estadoInicialForma: SolicitudPresupuesto = {
    tipoGasto: 1,
    proveedor: "",
    clabe: 0,
    banco: "",
    titular: "",
    rfc: "",
    email: "",
    email2: "",
    partida: 1,
    descripcion: "",
    importe: 0,
    comprobante: 1,
  }

  const { estadoForma, setEstadoForma, handleInputChange } =
    useForm(estadoInicialForma)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const idSolicitudPresupuesto = router.query.id

  useEffect(() => {
    if (idSolicitudPresupuesto) {
      obtenerUsuario()
    }
  }, [])

  const obtenerUsuario = async () => {
    setIsLoading(true)

    const { error, data } = await ApiCall.get(
      `/api/presupuestos/${idSolicitudPresupuesto}`
    )

    if (!error) {
      setEstadoForma(data[0])
    }
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    let res: ApiCallRes

    if (idSolicitudPresupuesto) {
      res = await ApiCall.put(
        `/api/presupuestos/${idSolicitudPresupuesto}`,
        estadoForma
      )
    } else {
      res = await ApiCall.post(
        `/api/presupuestos/${idSolicitudPresupuesto}`,
        estadoForma
      )
    }

    if (!res.error) {
      router.push("/presupuestos")
    }
    setIsLoading(false)
  }

  const cancelar = () => {
    router.push("/presupuestos")
  }

  const inputsForma = [
    {
      type: "select",
      name: "tipoGasto",
      label: "Tipo de gasto",
      options: [
        { value: 1, label: "Programación" },
        { value: 2, label: "Reembolso" },
        { value: 3, label: "Asimilados" },
      ],
    },
    {
      type: "text",
      name: "proveedor",
      label: "Proveedor",
      placeholder: "Escribe el proveedor",
    },
    {
      type: "number",
      name: "clabe",
      label: "CLABE interbancaria",
    },
    {
      type: "text",
      name: "banco",
      label: "Nombre del banco",
    },
    {
      type: "text",
      name: "titular",
      label: "Titular de la cuenta",
    },
    {
      type: "text",
      name: "rfc",
      label: "RFC del proveedor",
    },
    {
      type: "text",
      name: "email",
      label: "Correo electrónico",
    },
    {
      type: "text",
      name: "email2",
      label: "Correo electrónico alterno",
    },
    {
      type: "select",
      name: "partida",
      label: "Partida presupuestal",
      options: [
        { value: 1, label: "Algo" },
        { value: 2, label: "Reembolso" },
      ],
    },
    {
      type: "textarea",
      name: "descripcion",
      label: "Descripción del gasto",
    },
    {
      type: "number",
      name: "importe",
      label: "Importe",
    },
    {
      type: "select",
      name: "comprobante",
      label: "Comprobante",
      options: [
        { value: 1, label: "Factura" },
        { value: 2, label: "Recibo de asimilados" },
        { value: 3, label: "Recibo de honorarios" },
        { value: 4, label: "Invoice" },
        { value: 5, label: "Recibo no deducible" },
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
      <BtnRegistrar
        textoBtn={idSolicitudPresupuesto ? "Actualizar" : "Registrar"}
      />
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
              titulo={`${
                idSolicitudPresupuesto ? "Editar" : "Registrar"
              } usuario`}
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

export { FormaSolicitudPresupuesto }
