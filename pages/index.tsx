import { useEffect } from 'react';

const initializeWasm = async () => {
    const go = new Go();

    const { default: wasm } = await import('go/main.wasm');
    const { instance } = await wasm(go.importObject);

    go.run(instance);
};

export default function Home(): JSX.Element {
    useEffect(() => {
        initializeWasm();
    });

    return (
        <div>
            <h1>Hej Hej!</h1>
        </div>
    );
}
