export type Queries = Record<string, string | number>

export interface Nota {
  id?: number
  id_usuario: number
  usuario?: string
  mensaje: string
  dt_registro?: string
}