import { useEffect, useRef } from "react"

interface PieChartProps {
  lado: number
  porcentaje: number
}

const PieChart = ({ lado,  porcentaje }: PieChartProps) => {
  const ref = useRef(null)
  const ladoCanva = lado
  const mitadLado = ladoCanva / 2
  const porcentajeAGrados = (porcentaje * 360) / 100
  const radianes =
    porcentaje === 100
      ? 3.5 * Math.PI
      : ((porcentajeAGrados - 90) * Math.PI) / 180
  const anchoLinea = lado / 10
  const radio = mitadLado - anchoLinea / 2

  useEffect(() => {
    const ctx = ref.current.getContext("2d")
    ctx.lineWidth = anchoLinea

    ctx.strokeStyle = "#dee2e6"
    ctx.beginPath()
    ctx.arc(mitadLado, mitadLado, radio, 1.5 * Math.PI, 3.5 * Math.PI)
    ctx.stroke()

    if (porcentaje > 0) {
      ctx.strokeStyle = "#a9c030"
      ctx.beginPath()
      ctx.arc(mitadLado, mitadLado, radio, 1.5 * Math.PI, radianes)
      ctx.stroke()
    }

    ctx.font = "20px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${porcentaje}%`, mitadLado, mitadLado)

    // return () => {
    //   console.log('me voa limpiar')
    // }
  }, [])

  return (
    <canvas
      ref={ref}
      width={ladoCanva}
      height={ladoCanva}
    ></canvas>
  )
}

export { PieChart }
