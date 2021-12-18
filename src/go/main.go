package main

import (
	"github.com/Tomburgs/agloe/idb"
	"github.com/Tomburgs/agloe/parser"
	"fmt"
	"io"
	"log"
	"strings"
	"syscall/js"
	"time"

	"github.com/qedus/osmpbf"
)

const DEFAULT_FILENAME = "oldtown.osm.pbf"

var p *parser.Parser
var db *idb.IDB

func main() {
    db = idb.NewDB();

    index(db)

    js.Global().Set("search", js.FuncOf(search))

    select {}
}

func search(this js.Value, args []js.Value) interface{} {
    search := args[0].String()
    p = parser.NewParser()
    p.SetSearch(strings.ToLower(search))

    readableStream := js.Global().Get("ReadableStream")
    readableStreamConstructor := map[string]interface{}{
        "start": js.FuncOf(stream),
    }

    return readableStream.New(readableStreamConstructor)
}

type RelStruct struct{
    id int64
    nodes []int64
}

func createPromiseRequest(request func (resolve js.Value, args ...interface{}), passed ...interface{}) js.Value {
    handler := js.FuncOf(func (this js.Value, args []js.Value) interface{} {
        resolve := args[0]
        go request(resolve, passed...)
        return nil
    })

    promise := js.Global().Get("Promise")

    return promise.New(handler)
}

func stream(this js.Value, args []js.Value) interface{} {
    controller := args[0]
    start := time.Now()

    lookupWayNodes := func (resolve js.Value, arg ...interface{}) {
        node := arg[0].(*osmpbf.Way)
        rank := arg[1].(int)

        handler := js.FuncOf(func (this js.Value, args []js.Value) interface{} {
            resolved := []LatLon{}
            entries := args[0]

            entries.Call("forEach", js.FuncOf(func (this js.Value, args []js.Value) interface{} {
                entry := args[0]

                resolved = append(resolved, LatLon{entry.Get("lat").Float(), entry.Get("lon").Float()})

                return nil
            }))

            way := createWay(node, resolved, rank)

            resolve.Invoke(way)

            elapsed := time.Since(start)
            fmt.Printf("Executed for %d in %s\n", node.ID, elapsed)

            return nil
        })

        transaction := db.NewTransaction("readonly")
        transaction.GetMany(node.NodeIDs, handler)
        defer transaction.Commit()
    }

    go func() {
        p.FetchFile(DEFAULT_FILENAME)
        p.StartDecoder()

        defer p.Close()

        for {
            entity, rank, err := p.Parse()

            if err == io.EOF {
                controller.Call("close")
                break
            } else if err != nil {
                log.Fatal(err)
            } else {
                switch entity := entity.(type) {
                case *osmpbf.Node:
                    node := createNode(entity, rank)
                    controller.Call("enqueue", node)
                case *osmpbf.Way:
                    promise := createPromiseRequest(lookupWayNodes, entity, rank)
                    controller.Call("enqueue", promise)
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
