package main

import (
    "encoding/json"
    "github.com/qedus/osmpbf"
)

type Entity struct {
    ID int64 `json:"id"`
    Type string `json:"type"`
    Name string `json:"name"`
    Tags map[string]string `json:"tags"`
}

type Node struct {
    *Entity
    Lat float64 `json:"lat"`
    Lon float64 `json:"lon"`
}

type Way struct {
    *Entity
    Centroid map[string]string `json:"centroid"`
    Bounds map[string]string `json:"bounds"`
    Nodes []map[string]string `json:"nodes,omitempty"`
}

func createNode(node *osmpbf.Node) string {
    entity := Entity{node.ID, "node", node.Tags["name"], node.Tags}
    marshal := Node{&entity, node.Lat, node.Lon}

    json, _ := json.Marshal(marshal)

    return string(json)
}

func createWay(way *osmpbf.Way) string {
    entity := Entity{way.ID, "way", way.Tags["name"], way.Tags}

    json, _ := json.Marshal(entity)

    return string(json)
}
