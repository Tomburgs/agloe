import { css } from 'otion';
import Head from 'next/head';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import { useDebounce } from 'react-use';
import { SearchView } from 'view/search';
import { MapView } from 'view/map';
import { Icon } from 'components/icon';
import { typography } from 'styles/typography';

const root = css({
  width: '100%',
  height: '100%',
  maxHeight: '600px',
  maxWidth: '500px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  boxShadow: '10px -10px 74px #e5e5e5, -10px 10px 74px #ffffff',
  overflow: 'hidden',
});

const credit = css({
  margin: 0,
  fontSize: typography.size[3],
  selectors: {
    '& svg': {
      width: 16,
      height: 16,
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
});

enum View {
  Search,
  Map,
}

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
    const [view, setView] = useState<View>(View.Search);
    const [selected, setSelected] = useState<Entity | null>(null);
    const [search, setSearch] = useState<string>('');
    const [results, setResults] = useState<Entity[]>([]);

    useDebounce(() => {
        if (search.length > 1) {
            streamInstanceRef.current = global.search(search);

            const reader = streamInstanceRef.current.getReader();
            const pushResult = (result: Entity) => setResults(results => [...results, result]);
            const processEntities = ({ done, value }: ReadableStreamDefaultReadResult<Entity>): void => {
                if (done) {
                    return;
                }

                if (value instanceof Promise) {
                    value.then(pushResult);
                } else if (value) {
                    pushResult(value);
                }

                reader.read().then(processEntities);
            };

            reader.read().then(processEntities);
        }
    }, 200, [search]);

    const onSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const { target: { value } } = event;

        setSearch(value);
        setResults([]);
    }, [setSearch, setResults]);

    const onSelect = useCallback((entity: Entity) => {
        setSelected(entity);
        setView(View.Map);
    }, []);

    const onBack = useCallback(() => {
        setSelected(null);
        setView(View.Search);
    }, []);

    return (
      <main className={styles.main}>
        <Head>
          <script src="/wasm_exec.js" />
        </Head>
        <div className={root}>
          {view === View.Search && (
            <SearchView
              search={search}
              onSearch={onSearch}
              onSelect={onSelect}
              disabled={!isWasmInstanceRunning}
              results={results}
            />
          )}
          {view === View.Map && (
            <MapView entity={selected!} onBack={onBack} />
          )}
        </div>
        <h6 className={credit}>
            Made with <Icon name="heart" /> in Copenhagen.<br />
            By <a href="https://github.com/Tomburgs" rel="noreferrer">@Tomburgs</a>.
        </h6>
      </main>
    );
}
