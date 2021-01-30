package main

import (
    "fmt"
    "io"
    "log"
    "time"
    "runtime"
    "net/http"
    "github.com/qedus/osmpbf"
);

func main() {
    fmt.Println("Hej Hej!");

    start := time.Now();

    file := getFile("/oldtown.osm.pbf");
    decoder := startDecoder(file);

    defer file.Close();

    var nc, wc, rc uint64;

    for {
        if v, err := decoder.Decode(); err == io.EOF {
            break;
        } else if err != nil {
            log.Fatal(err);
        } else {
            switch v := v.(type) {
            case *osmpbf.Node:
                // Process Node v.
                nc++;
            case *osmpbf.Way:
                // Process Way v.
                wc++;
            case *osmpbf.Relation:
                // Process Relation v.
                rc++;
            default:
                log.Fatalf("unknown type %T\n", v);
            }
        }
    }

    elapsed := time.Since(start);

    fmt.Printf("Executed in %s\n", elapsed);
    fmt.Printf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc);
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
