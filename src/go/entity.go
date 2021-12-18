package main

import (
	"encoding/json"
	"syscall/js"
	"github.com/qedus/osmpbf"
)

type Metadata struct {
    Rank int `json:"rank"`
    Search string `json:"search"`
}

type Entity struct {
    ID int64 `json:"id"`
    Type string `json:"type"`
    Name string `json:"name"`
    Tags map[string]string `json:"tags"`
    Metadata Metadata `json:"metadata"`
}

type LatLon struct {
    Lat float64 `json:"lat"`
    Lon float64 `json:"lon"`
}

type Node struct {
    *Entity
    *LatLon
}

type Way struct {
    *Entity
    Nodes []LatLon `json:"nodes,omitempty"`
}

func createNode(node *osmpbf.Node, rank int, search string) js.Value {
    entity := Entity{
        node.ID,
        "node",
        node.Tags["name"],
        node.Tags,
        Metadata{rank, search},
    }
    latlon := LatLon{node.Lat, node.Lon}
    marshal := Node{&entity, &latlon}

    json, _ := json.Marshal(marshal)

    return createJSObject(string(json))
}

func createWay(node *osmpbf.Way, nodes []LatLon, rank int, search string) js.Value {
    entity := Entity{
        node.ID,
        "way",
        node.Tags["name"],
        node.Tags,
        Metadata{rank, search},
    }
    way := Way{&entity, nodes}

    json, _ := json.Marshal(way)

    return createJSObject(string(json))
}

func createJSObject(entity string) js.Value {
    JSON := js.Global().Get("JSON")

    return JSON.Call("parse", entity)
}
