package dbutil

import (
	"github.com/hack-pad/go-indexeddb/idb"
	"log"
	"syscall/js"
)

func handleUpgrade(db *idb.Database, oldVersion uint, newVersion uint) error {
	if oldVersion < 1 {
		objectStore, err := db.CreateObjectStore(
			DBObjectStoreRel,
			idb.ObjectStoreOptions{
				KeyPath:       js.ValueOf("nodeId"),
				AutoIncrement: false,
			},
		)

		if err != nil {
			log.Fatal(err)
		}

		_, err = objectStore.CreateIndex(
			DBObjectStoreRelIndex,
			js.ValueOf("nodeId"),
			idb.IndexOptions{
				Unique:     true,
				MultiEntry: false,
			},
		)

		if err != nil {
			log.Fatal(err)
		}
	}

	return nil
}
