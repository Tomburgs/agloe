package idb

import (
    "syscall/js"
)

const (
    DB_NAME = "agloe"
    DB_VERSION = 1
    DB_OBJECT_STORE_REL = "relations"
    DB_OBJECT_STORE_INDEX = "by_nodeId"
)

type IDB struct {
    db js.Value
}

func NewDB() *IDB {
    idb := js.Global().Get("indexedDB")
    idbOpenReq := idb.Call("open", DB_NAME, DB_VERSION)

    setup := &Setup{
        db: make(chan js.Value, 2),
    }

    idbOpenReq.Set("onerror", js.FuncOf(setup.handleError))
    idbOpenReq.Set("onsuccess", js.FuncOf(setup.handleSuccess))
    idbOpenReq.Set("onupgradeneeded", js.FuncOf(setup.handleUpgrade))

    return &IDB{ <-setup.db }
}
