import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../assets/css/main.css"
import { AuthProvider } from "../contexts/auth.context"
import { CatalogosProvider } from "../contexts/catalogos.context"
import { MainHeader } from "@components/MainHeader"
import { MainContenedor } from "@components/MainContenedor"

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CatalogosProvider>
        <MainHeader />
        <MainContenedor>
          <Component {...pageProps} />
        </MainContenedor>
      </CatalogosProvider>
    </AuthProvider>
  )
}
