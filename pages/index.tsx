import { useEffect } from 'react';

const instantiate = async (request: Promise<Response>, importObject: WebAssembly.Imports) => {
    if (WebAssembly.instantiateStreaming) {
        return WebAssembly.instantiateStreaming(request, importObject);
    }

    const response = await request;
    const source = await response.arrayBuffer();

    return WebAssembly.instantiate(source, importObject);
};

const initializeWasm = async () => {
    const go = new Go();

    const wasm = fetch('/main.wasm');
    const { instance } = await instantiate(wasm, go.importObject);

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
