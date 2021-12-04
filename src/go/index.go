package main

import (
	"github.com/Tomburgs/agloe/batch"
	"github.com/Tomburgs/agloe/bitmask"
	"github.com/Tomburgs/agloe/idb"
	"github.com/Tomburgs/agloe/parser"
	"io"
	"log"
	"github.com/qedus/osmpbf"
)

func index(idb *idb.IDB) {
    bitmask := bitmask.NewBitmask()

    findWayRelatedNodes(&bitmask)

    if (len(bitmask) > 0) {
        indexNodes(&bitmask, idb)
    }
}

/*
 * Finds Nodes on which Way types depend on and adds their IDs to bitmask map
 */
func findWayRelatedNodes(mask *bitmask.Bitmask) {
    p = parser.NewParser()

    p.FetchFile(DEFAULT_FILENAME)
    p.StartDecoder()

    defer p.Close()

    for {
        entity, err := p.Parse()

        if err == io.EOF {
            break
        } else if err != nil {
            log.Fatal(err)
        } else {
            switch entity := entity.(type) {
            case *osmpbf.Way:
                for _, nodeId  := range entity.NodeIDs {
                    mask.Set(nodeId)
                }
            }
        }
    }
}

/*
 * Adds registered nodes in Bitmask to IndexedDB
 */
func indexNodes(mask *bitmask.Bitmask, db *idb.IDB) {
    writer := batch.WriterFunc(func (batch []interface{}) {
        transaction := db.NewTransaction("readwrite")

        for _, entry := range batch {
            transaction.SetIndex(entry)
        }

        transaction.Commit()
    })
    p := parser.NewParser()
    b := batch.NewBatcher(writer, 256, 0)

    p.FetchFile(DEFAULT_FILENAME)
    /*
     * We use osmpbf.Decode instead of agloe.Parse
     * because agloe.Parse checks if node has name property.
     */
    d := p.StartDecoder()

    defer p.Close()
    defer b.Commit()

    for {
        entity, err := d.Decode()

        if err == io.EOF {
            break
        } else if err != nil {
            log.Fatal(err)
        } else {
            switch entity := entity.(type) {
            case *osmpbf.Node:
                if (mask.Has(entity.ID)) {
                    b.Write(map[string]interface{}{
                        "nodeId": entity.ID,
                        "lat": entity.Lat,
                        "lon": entity.Lon,
                    })
                }
            }
        }
    }
}
