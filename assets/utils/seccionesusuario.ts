class RolUsario {

    id: number
    nombre: string
    secciones: AccionUsuario[]

    constructor( id: number, nombre: string, secciones: AccionUsuario[] ){
        this.id = id
        this.nombre = nombre
        this.secciones = secciones
    }
}

class AccionUsuario {

    id: number
    titulo: string
    link: string
    icon: string

    constructor( id: number, titulo: string, link: string, icon: string ){
        this.id = id
        this.titulo = titulo
        this.link = link
        this.icon = icon
    }
}

//SECCIONES

const USUARIOS = new AccionUsuario( 1, 'Usuarios', '/usuarios', 'bi-person-add')
const ASIMILADOS = new AccionUsuario( 2, 'Registro de asimilados', '/asimilados/registro', 'bi-ui-checks' )
const SOLICITUDES_PRESUPUETO = new AccionUsuario( 3, 'Solicitudes presupuesto', '/presupuestos', 'bi-ui-checks' )
const COPARTES = new AccionUsuario( 4, 'Copartes', '/copartes', 'bi-list-ul' )
// const REGISTRO_COPARTE = new AccionUsuario( 2, 'Registrar coparte', '/copartes/registro', 'bi-person-add')
// const VER_SOLCIITUD_PRESUPUESTO = new AccionUsuario( 4, 'Solicitudes', '/presupuestos/', 'bi-ui-checks' )
// const EDITAR_SOLCIITUD_PRESUPUESTO = new AccionUsuario( 6, 'Editar solicitudes', '/presupuestos/', 'bi-ui-checks' )


//ROLES

const SUPER_USUARIO = new RolUsario( 1, 'SUPER_USUARIO', [ COPARTES, USUARIOS, SOLICITUDES_PRESUPUETO ])
const ADMINISTRADOR = new RolUsario( 2, 'ADMINISTRADOR', [ COPARTES, SOLICITUDES_PRESUPUETO ])
const COPARTE = new RolUsario( 3, 'COPARTE', [ SOLICITUDES_PRESUPUETO, ASIMILADOS ])

const ROLES = [ SUPER_USUARIO, ADMINISTRADOR, COPARTE ]


export { ROLES }