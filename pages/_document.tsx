import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html>
      <Head>
        <link
          rel="shortcut icon"
          href="https://static.wixstatic.com/media/86d1f6_788b0729ac7d46109935bd4b157b9f48%7Emv2.png/v1/fill/w_32%2Ch_32%2Clg_1%2Cusm_0.66_1.00_0.01/86d1f6_788b0729ac7d46109935bd4b157b9f48%7Emv2.png"
          type="image/png"
        />
      </Head>
      <body>
        <Main />
        <div id="modal"></div>
        <div id="menu_celular"></div>
        <NextScript />
      </body>
    </Html>
  )
}
