import SourceDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends SourceDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <script src="/wasm_exec.js" />
          {process.env.NEXT_PUBLIC_GTAG_TOKEN !== undefined && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTAG_TOKEN}`} />
              <script dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GTAG_TOKEN}');`
              }} />
            </>
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
