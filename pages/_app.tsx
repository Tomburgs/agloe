import { AppProps } from 'next/app';
import 'styles/_main.scss';

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <Component { ...pageProps } />
    );
}
