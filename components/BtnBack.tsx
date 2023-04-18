import Link from "next/link"
import styles from "./styles/BtnBack.module.css"

interface BtnBackProps {
  navLink: string
}

const BtnBack = ({ navLink }: BtnBackProps) => {
  return(
    <Link href={navLink} className={styles.btnBack}>
      <i className="bi bi-arrow-left-circle"></i>
    </Link>
  )
}

export { BtnBack }