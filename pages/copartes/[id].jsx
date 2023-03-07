import { useRouter } from 'next/router'
import { useCopartes } from '@contexts/copartes.context'
import { Heading } from '@components/Heading'
import { FormaCoparte } from '@components/FormaCoparte'
import { useEffect } from 'react'

const Coparte = () => {

    const { copartesDB, setEstadoForma, actulizarCoparte } = useCopartes()
    const router = useRouter()
    const idCoparte = router.query.id

    const coparte = copartesDB.current.find( cop => cop.id_coparte == idCoparte )

    useEffect(() => {
        setEstadoForma( coparte )
    }, [])

    return(
        <>
        <Heading titulo="Editar coparte" />
        <FormaCoparte onSubmit={actulizarCoparte} />
        </>
    )
}

export default Coparte