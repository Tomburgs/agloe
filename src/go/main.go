package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"
	"sync"
	"syscall/js"
	"time"

	"github.com/Tomburgs/agloe/dbutil"
	"github.com/Tomburgs/agloe/parser"
	"github.com/hack-pad/go-indexeddb/idb"

	"github.com/qedus/osmpbf"
)

const DEFAULT_FILENAME = "oldtown.osm.pbf"

var p *parser.Parser
var db *idb.Database
var searchTerm string

func main() {
    db = dbutil.NewDBConnection()

    index(db)

    js.Global().Set("search", js.FuncOf(search))

    select {}
}

func search(this js.Value, args []js.Value) interface{} {
    search := args[0].String()
    searchTerm = search
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
    term := searchTerm

    lookupWayNodes := func (resolve js.Value, arg ...interface{}) {
        node := arg[0].(*osmpbf.Way)
        rank := arg[1].(int)

        resolved := []LatLon{}

        txn, _ := db.Transaction(idb.TransactionReadOnly, dbutil.DBObjectStoreRel)
        store, _ := txn.ObjectStore(dbutil.DBObjectStoreRel)
        index, _ := store.Index(dbutil.DBObjectStoreRelIndex)

        wg := new(sync.WaitGroup)
        wg.Add(len(node.NodeIDs))

        for _, nodeId := range node.NodeIDs {
            ctx := context.Background()
            req, _ := index.Get(js.ValueOf(nodeId))

            req.ListenSuccess(
                ctx,
                func() {
                    entry, _ := req.Result()
                    resolved = append(resolved, LatLon{entry.Get("lat").Float(), entry.Get("lon").Float()})
                    wg.Done()
                },
            )
        }

        wg.Wait()

        way := createWay(node, resolved, rank, term)
        resolve.Invoke(way)

        elapsed := time.Since(start)
        fmt.Printf("Executed for %d in %s\n", node.ID, elapsed)

        defer txn.Commit()
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
                    node := createNode(entity, rank, term)
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
