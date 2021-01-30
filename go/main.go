package main

import (
    "fmt"
    "io"
    "log"
	"net/http"
    "runtime"
    "github.com/qedus/osmpbf"
);

func main() {
    fmt.Println("Hej Hej!");

	resp, err := http.Get("/oldtown.osm.pbf");

    if err != nil {
        log.Fatal(err);
    }

	defer resp.Body.Close()

    decoder := osmpbf.NewDecoder(resp.Body);

    decoder.SetBufferSize(osmpbf.MaxBlobSize);

    err = decoder.Start(runtime.GOMAXPROCS(-1));

    if (err != nil) {
        log.Fatal(err);
    }

    var nc, wc, rc uint64;

	for {
		if v, err := decoder.Decode(); err == io.EOF {
			break
		} else if err != nil {
			log.Fatal(err)
		} else {
			switch v := v.(type) {
			case *osmpbf.Node:
				// Process Node v.
				nc++
			case *osmpbf.Way:
				// Process Way v.
				wc++
			case *osmpbf.Relation:
				// Process Relation v.
				rc++
			default:
				log.Fatalf("unknown type %T\n", v)
			}
		}
	}

	fmt.Printf("Nodes: %d, Ways: %d, Relations: %d\n", nc, wc, rc);
}
