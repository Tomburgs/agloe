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

const useWasm = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const go = new Go();

        const wasm = fetch('/main.wasm');

        instantiate(wasm, go.importObject)
            .then(({ instance }) => {
                go.run(instance);
                setIsInitialized(true);
            });
    }, []);

    return isInitialized;
};

export default function Home(): JSX.Element {
    const isWasmInstanceRunning = useWasm();

    return (
        <main className={ styles.main }>
            <div className={ styles.wrapper }>
                {!isWasmInstanceRunning && (
                    <p>Loading WebAssembly instance</p>
                )}
                <input className={ styles.input } disabled={!isWasmInstanceRunning} />
            </div>
        </main>
    );
}
