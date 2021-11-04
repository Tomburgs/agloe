package idb

import (
    "log"
    "syscall/js"
)

type Setup struct {
    db chan js.Value
}

func (s *Setup) handleError(this js.Value, args []js.Value) interface{} {
    log.Fatal("Couldn't connect to IndexedDB");

    return nil;
}

func (s *Setup) handleSuccess(this js.Value, args []js.Value) interface{} {
    db := getDBInstance(args)

    s.db <- db

    return nil
}

func (s *Setup) handleUpgrade(this js.Value, args []js.Value) interface{} {
    event := args[0]
    oldVersion := event.Get("oldVersion").Int()
    db := getDBInstance(args)

    if (oldVersion < 1) {
        store := db.Call("createObjectStore", DB_OBJECT_STORE_REL, map[string]interface{}{"keyPath": "nodeId"})
        store.Call("createIndex", DB_OBJECT_STORE_INDEX, "nodeId", map[string]interface{}{"unique": true})
    }

    s.db <- db

    return nil
}

func getDBInstance(args []js.Value) js.Value {
    event := args[0]
    result := event.Get("target").Get("result")

    return result
}
