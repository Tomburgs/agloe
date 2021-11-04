package idb

import (
	"syscall/js"
)

type Transaction struct {
    instance js.Value
    store js.Value
    index js.Value
}

func (idb *IDB) NewTransaction(mode string) *Transaction {
    db := idb.db
    instance := db.Call("transaction", DB_OBJECT_STORE_REL, mode)
    store := instance.Call("objectStore", DB_OBJECT_STORE_REL)
    index := store.Call("index", DB_OBJECT_STORE_INDEX)

    return &Transaction{instance, store, index}
}

func (t *Transaction) Commit() {
    instance := t.instance
    instance.Call("commit")
}

func (t *Transaction) GetCursorForBounds(low int64, high int64, iterator js.Func) {
    store := t.store
    idbKeyRange := js.Global().Get("IDBKeyRange")
    bounds := idbKeyRange.Call("bound", low, high)

    request := store.Call("openCursor", bounds, "nextunique")

    request.Set("onsuccess", iterator)
}

func (t *Transaction) GetMany(key []int64, handler js.Func) js.Value {
    index := t.index
    promise := js.Global().Get("Promise")
    promises := js.Global().Get("Array").New()

    for _, key := range key {
        getIndexPromise := js.FuncOf(
            func (this js.Value, args []js.Value) interface{} {
                resolve := args[0]
                reject := args[1]

                call := index.Call("get", key)

                handleOnSuccess := js.FuncOf(
                    func (this js.Value, args []js.Value) interface{} {
                        event := args[0]
                        result := event.Get("target").Get("result")

                        return resolve.Invoke(result)
                    },
                )
                handleOnError := js.FuncOf(
                    func (this js.Value, args []js.Value) interface{} {
                        return reject.Invoke()
                    },
                )

                call.Set("onsuccess", handleOnSuccess)
                call.Set("onerror", handleOnError)

                return nil
            },
        )

        promises.Call("push", promise.New(getIndexPromise))
    }

    return promise.Call("all", promises).Call("then", handler)
}

func (t *Transaction) GetIndex(key interface{}) js.Value {
    index := t.index
    value := index.Call("get", key)

    return value
}

func (t *Transaction) SetIndex(item interface{}) {
    store := t.store
    store.Call("put", item)
}
