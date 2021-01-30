import { useEffect, useState } from 'react';
import styles from './index.module.scss';

const instantiate = async (request: Promise<Response>, importObject: WebAssembly.Imports) => {
    if (WebAssembly.instantiateStreaming) {
        return WebAssembly.instantiateStreaming(request, importObject);
    }

    const response = await request;
    const source = await response.arrayBuffer();

    return WebAssembly.instantiate(source, importObject);
};

const initializeWasm = async (setIsInitialized: (isInitialized: boolean) => void) => {
    const go = new Go();

    const wasm = fetch('/main.wasm');
    const { instance } = await instantiate(wasm, go.importObject);

    go.run(instance);
    setIsInitialized(true);
};

export default function Home(): JSX.Element {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeWasm(setIsInitialized);
    }, []);

    console.log(isInitialized);

    return (
        <main className={ styles.main }>
            <div className={ styles.wrapper }>
                <input className={ styles.input } />
            </div>
        </main>
    );
}
