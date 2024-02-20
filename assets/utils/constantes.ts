const rolesUsuario = {
  SUPER_USUARIO: 1,
  ADMINISTRADOR: 2,
  COPARTE: 3,
}

const tiposGasto = {
  REEMBOLSO: 1,
  PAGO_A_PROVEEDOR: 2,
  ASIMILADOS: 3,
  HONORARIOS: 4,
  GASTOS_X_COMPROBAR: 5,
}

const tiposTitularesSolicitud = {
  COLABORADOR: 1,
  PROVEEDOR: 2,
}

const tiposColaborador = {
  ASIMILADOS: 1,
  HONORARIOS: 2,
  SIN_PAGO: 3
}

const estatusSolicitud = {
  REVISION: 1,
  AUTORIZADA: 2,
  RECHAZADA: 3,
  PROCESADA: 4,
  DEVOLUCION: 5,
}

const rubrosPresupuestales = {
  ASIMILADOS: 2,
  HONORARIOS: 3,
  PAGOS_EXTRANJERO: 22
}

export {
  rolesUsuario,
  tiposGasto,
  tiposTitularesSolicitud,
  estatusSolicitud,
  rubrosPresupuestales,
  tiposColaborador
}
