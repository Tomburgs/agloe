import SourceDocument, { Html, Head, Main, NextScript } from 'next/document';

export default class Document extends SourceDocument {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <script src="/wasm_exec.js" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}
