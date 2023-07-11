import styles from "./styles/Tooltip.module.css"

const Tooltip = ({ children, texto }) => {
  return (
    <div className={styles.tooltip}>
      {children}
      <small>{texto}</small>
    </div>
  )
}

const TooltipInfo = ({texto}) => {
  return(
    <Tooltip texto={texto}>
      <i className="bi bi-info-circle"></i>
    </Tooltip>
  )
}

export { Tooltip, TooltipInfo }
