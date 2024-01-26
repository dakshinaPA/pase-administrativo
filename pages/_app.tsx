import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../assets/css/main.css"
import { SessionProvider } from "next-auth/react"
import { CatalogosProvider } from "../contexts/catalogos.context"
import { useEffect } from "react"
import { App } from "@components/App"

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js")
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <CatalogosProvider>
        <App>
          <Component {...pageProps} />
        </App>
      </CatalogosProvider>
    </SessionProvider>
  )
}
