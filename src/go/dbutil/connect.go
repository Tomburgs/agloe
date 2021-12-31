package dbutil

import (
	"context"
	"log"
	"github.com/hack-pad/go-indexeddb/idb"
)

const (
    DBName = "agloe"
    DBVersion = 1
    DBObjectStoreRel = "relations"
    DBObjectStoreRelIndex = "by_nodeId"
)

func NewDBConnection() *idb.Database {
    ctx := context.Background()
    instance := idb.Global()
    idbOpenReq, err := instance.Open(ctx, DBName, DBVersion, handleUpgrade)

    if err != nil {
        log.Fatal(err)
    }

    db, err := idbOpenReq.Await(ctx)

    if err != nil {
        log.Fatal(err)
    }

    return db
}
