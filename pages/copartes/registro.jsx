
// import { estadosRepublica } from '@assets/utils/common'
import { useCopartes } from '@contexts/copartes.context'
import { FormaCoparte } from '@components/FormaCoparte'
import { Heading } from '@components/Heading'
import { useEffect } from 'react'


const RegistroCoparte = () => {

    const { agregarCoparte, limpiarForma } = useCopartes()

    useEffect(() => {
        limpiarForma()
    }, [])

    return(
        <>
        <Heading titulo="Registro de coparte" />
        <FormaCoparte onSubmit={agregarCoparte} />
        </>
    )
}

export default RegistroCoparte