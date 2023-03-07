import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../assets/css/main.css'
import { AuthProvider } from '../contexts/auth.context'
import { CopartesProvider } from '@contexts/copartes.context'
import { MainHeader } from '../components/MainHeader'

export default function MyApp({ Component, pageProps }) {
    return(
        <AuthProvider>
            <MainHeader />
            <CopartesProvider>
                <Component {...pageProps} />
            </CopartesProvider>
        </AuthProvider>
    )
}