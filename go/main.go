package main

import (
    "fmt"
    "io"
    "log"
    "time"
    "syscall/js"
    "agloe/idb"
    "agloe/parser"
    "github.com/qedus/osmpbf"
)

var p *parser.Parser

func main() {
    db := idb.NewDB();
    db.Test();

    js.Global().Set("search", js.FuncOf(search))

    select {}
}

func search(this js.Value, args []js.Value) interface{} {
    search := args[0].String()
    p = parser.NewParser()
    p.SetSearch(search)

    readableStream := js.Global().Get("ReadableStream")
    readableStreamConstructor := map[string]interface{}{
        "start": js.FuncOf(stream),
    }

    return readableStream.New(readableStreamConstructor)
}

func stream(this js.Value, args []js.Value) interface{} {
    controller := args[0]

    go func() {
        start := time.Now()
        var nc, wc, rc uint64

        p.FetchFile("oldtown.osm.pbf")
        d := p.StartDecoder()

        defer p.Close()

        for {
            if v, err := d.Decode(); err == io.EOF {
                controller.Call("close")
                break
            } else if err != nil {
                log.Fatal(err)
            } else {
                switch v := v.(type) {
                case *osmpbf.Node:
                    // Process Node v.
                    if (p.IsValidEntity(v.Tags)) {
                        node := createNode(v)
                        controller.Call("enqueue", node)
                    }
                case *osmpbf.Way:
                    // Process Way v.
                    if (p.IsValidEntity(v.Tags)) {
                        way := createWay(v)
                        controller.Call("enqueue", way)
                    }
                case *osmpbf.Relation:
                    // Process Relation v.
                    if (p.IsValidEntity(v.Tags)) {
                        rc++
                    }
                default:
                    log.Fatalf("unknown type %T\n", v)
                }
            }

            controller.Call("enqueue", fmt.Sprintf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc))
        }

        elapsed := time.Since(start)

        fmt.Printf("Executed in %s\n", elapsed)
        fmt.Printf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc)
    }()

    return nil
}
