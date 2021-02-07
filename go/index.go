package main

import (
    "io"
    "log"
    "agloe/parser"
    "agloe/bitmask"
    "github.com/qedus/osmpbf"
)

func index() {
    bitmask := bitmask.NewBitmask()
    findWayRelatedNodes(&bitmask)

    if (len(bitmask) > 0) {
        indexNodes(&bitmask)
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
func indexNodes(mask *bitmask.Bitmask) {
    p = parser.NewParser()

    p.FetchFile(DEFAULT_FILENAME)
    /*
     * We use osmpbf.Decode instead of agloe.Parse
     * because agloe.Parse checks if node has name property.
     */
    d := p.StartDecoder()

    defer p.Close()

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
                    // TODO: Add to IndexedDB
                }
            }
        }
    }
}
