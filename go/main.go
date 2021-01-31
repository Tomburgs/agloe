package main

import (
    "fmt"
    "io"
    "log"
    "time"
    "runtime"
    "syscall/js"
    "net/http"
    "github.com/qedus/osmpbf"
);

var searchTerm string;

func main() {
    js.Global().Set("search", js.FuncOf(search));

    select {};
}

func search(this js.Value, args []js.Value) interface{} {
    searchTerm = args[0].String();

    readableStream := js.Global().Get("ReadableStream");
    readableStreamConstructor := map[string]interface{}{
        "start": js.FuncOf(stream),
    };

    return readableStream.New(readableStreamConstructor);
}

func stream(this js.Value, args []js.Value) interface{} {
    controller := args[0];

    go func() {
        start := time.Now();
        var nc, wc, rc uint64;

        file := getFile("/oldtown.osm.pbf");
        decoder := startDecoder(file);

        defer file.Close();

        for {
            if v, err := decoder.Decode(); err == io.EOF {
                break;
            } else if err != nil {
                log.Fatal(err);
            } else {
                switch v := v.(type) {
                case *osmpbf.Node:
                    // Process Node v.
                    if (isValidEntity(v.Tags)) {
                        nc++;
                    }
                case *osmpbf.Way:
                    // Process Way v.
                    if (isValidEntity(v.Tags)) {
                        wc++;
                    }
                case *osmpbf.Relation:
                    // Process Relation v.
                    if (isValidEntity(v.Tags)) {
                        rc++;
                    }
                default:
                    log.Fatalf("unknown type %T\n", v);
                }
            }

            controller.Call("enqueue", fmt.Sprintf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc));
        }

        elapsed := time.Since(start);

        fmt.Printf("Executed in %s\n", elapsed);
        fmt.Printf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc);
    }();

    return nil;
}

func getFile(filename string) io.ReadCloser {
    resp, err := http.Get(filename);

    if err != nil {
        log.Fatal(err);
    }

    return resp.Body;
}

func startDecoder(file io.ReadCloser) *osmpbf.Decoder {
    decoder := osmpbf.NewDecoder(file);
    decoder.SetBufferSize(osmpbf.MaxBlobSize);

    err := decoder.Start(runtime.GOMAXPROCS(-1));

    if err != nil {
        log.Fatal(err);
    }

    return decoder;
}
