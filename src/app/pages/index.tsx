import { css } from 'otion';
import { Map } from 'components/map';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import {useDebounce} from 'react-use';

const root = css({
    display: 'flex',
    justifyContent: 'center',
    flexFlow: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '600px',
});

const map = css({
    overflow: 'hidden',
    borderRadius: '5px',
});

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
    const streamInstanceRef = useRef<ReadableStream | null>(null);
    const [search, setSearch] = useState<string>('');
    const [results, setResults] = useState<Entity[]>([]);

    useDebounce(() => {
        if (search.length > 2) {
            streamInstanceRef.current = global.search(search);

            const reader = streamInstanceRef.current.getReader();
            const pushResult = (result: Entity) => setResults(results => [...results, result]);
            const processEntities = ({ done, value }) => {
                if (done) {
                    return;
                }

                if (value instanceof Promise) {
                    value.then(pushResult);
                } else {
                    pushResult(value);
                }

                return reader.read().then(processEntities);
            };

            reader.read().then(processEntities);
        }
    }, 200, [search]);

    const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = event;

        setSearch(value);
        setResults([]);
    }, [setSearch, setResults]);

    return (
        <main className={styles.main}>
            <div className={root}>
                <input
                  className={styles.input}
                  value={search}
                  onChange={onSearch}
                  placeholder={
                    isWasmInstanceRunning
                      ? 'Search...'
                      : 'Loading WebAssembly instance...'
                  }
                  disabled={!isWasmInstanceRunning}
                />
                <ul>
                    {results.map((entity) => (
                        <li>{entity.name}</li>
                    ))}
                </ul>
                <div className={map}>
                    <Map />
                </div>
            </div>
        </main>
    );
}
