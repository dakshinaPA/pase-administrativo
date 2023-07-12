import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html>
      <Head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
      </Head>
      <body>
        <Main />
        <div id="modal"></div>
        <NextScript />
      </body>
    </Html>
  )
}
