
import { handlerRespuesta } from '../../../api/utils/response'
import { UsuariosServices } from '../../../api/services/usuarios'

const usuarios = async (req, res) => {

    const usuario = new UsuariosServices()

    switch(req.method){
        case 'GET':
            const resGet = await usuario.traerTodos()
            if(resGet.error){
                handlerRespuesta( res, 500, 'Error al obtener usuarios', resGet )
            }
            handlerRespuesta( res, 200, '', resGet )
            break
        case 'POST':
            const resPost = await usuario.crear( req.body )
            if(resPost.error){
                handlerRespuesta( res, 500, 'Error al crear usuario', resPost )
            }
            handlerRespuesta( res, 200, 'Usuario creado con éxito', resPost )
            break
        case 'PUT':
            const resPut = await usuario.actualizar( req.body )
            if(resPut.error){
                handlerRespuesta( res, 500, 'Error al actualizar usuario', resPut )
            }
            handlerRespuesta( res, 200, 'Usuario actualizado con éxito', resPut )
            break
    }
}

export default usuarios