package main

import (
    "io"
    "log"
    "fmt"
    "time"
    "syscall/js"
    "agloe/idb"
    "agloe/parser"
    "github.com/qedus/osmpbf"
)

const DEFAULT_FILENAME = "oldtown.osm.pbf"

var p *parser.Parser

func main() {
    db := idb.NewDB();
    db.Test();

    index()

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

        p.FetchFile(DEFAULT_FILENAME)
        p.StartDecoder()

        defer p.Close()

        for {
            entity, err := p.Parse()

            if err == io.EOF {
                controller.Call("close")
                break
            } else if err != nil {
                log.Fatal(err)
            } else {
                switch entity := entity.(type) {
                case *osmpbf.Node:
                    node := createNode(entity)
                    controller.Call("enqueue", node)
                case *osmpbf.Way:
                    way := createWay(entity)
                    controller.Call("enqueue", way)
                case *osmpbf.Relation:
                    // TODO: Create relations entity
                }
            }
        }

        elapsed := time.Since(start)

        fmt.Printf("Executed in %s\n", elapsed)
    }()

    return nil
}
