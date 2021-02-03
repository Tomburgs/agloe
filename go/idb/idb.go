package idb

import (
    "fmt"
    "syscall/js"
)

const DB_NAME = "agloe"
const DB_VERSION = 1

type IDB struct {
    db js.Value
}

func NewDB() *IDB {
    idb := js.Global().Get("indexedDB")
    idbOpenReq := idb.Call("open", DB_NAME, DB_VERSION)

    setup := &Setup{
        db: make(chan js.Value),
    }

    idbOpenReq.Set("onerror", js.FuncOf(setup.handleError))
    idbOpenReq.Set("onsuccess", js.FuncOf(setup.handleSuccess))
    idbOpenReq.Set("onupgradeneeded", js.FuncOf(setup.handleUpgrade))

    return &IDB{ <-setup.db }
}

func (idb *IDB) Test() {
    fmt.Println(idb.db)
}
