package parser

import (
    "io"
    "log"
    "runtime"
    "strings"
    "net/http"
    "github.com/qedus/osmpbf"
)

type Parser struct {
    decoder *osmpbf.Decoder
    file io.ReadCloser
    search string
}

func NewParser() *Parser {
    return &Parser{ search: "" }
}

func (p *Parser) IsValidEntity(Tags map[string]string) bool {
    search := p.search
    name, ok := Tags["name"]

    return ok && strings.Contains(name, search)
}

func (p *Parser) SetSearch(search string) {
    p.search = search
}

func (p *Parser) Close() {
    file := p.file
    file.Close()
}

func (p *Parser) FetchFile(filename string) {
    resp, err := http.Get("/" + filename)

    if err != nil {
        log.Fatal(err)
    }

    file := resp.Body

    p.file = file
}

func (p *Parser) StartDecoder() *osmpbf.Decoder {
    if p.file == nil {
        log.Fatal("No file set")
    }

    decoder := osmpbf.NewDecoder(p.file)
    decoder.SetBufferSize(osmpbf.MaxBlobSize)
    err := decoder.Start(runtime.GOMAXPROCS(-1))

    if err != nil {
        log.Fatal(err)
    }

    p.decoder = decoder

    return decoder
}
