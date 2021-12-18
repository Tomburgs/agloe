package parser

import (
	"errors"
	"io"
	"log"
	"net/http"
	"runtime"
	"strings"

	"github.com/lithammer/fuzzysearch/fuzzy"
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

func (p *Parser) GetRank(Tags map[string]string) int {
    search := p.search
    name, ok := Tags["name"]

    if !ok {
        return -1;
    }

    /*
     * If we get a 1:1 match anywhere in the string then it's automatically 0.
     */
    if strings.Contains(strings.ToLower(name), search) {
        return 0;
    }

    /*
     * If all else fails, find Levenshtein distance.
     */
    return fuzzy.RankMatchFold(search, name);
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

func (p *Parser) Parse() (interface{}, int, error) {
    decoder := p.decoder
    entity, err := decoder.Decode()

    if err != nil {
        return nil, -1, err
    }

    switch entity := entity.(type) {
        case *osmpbf.Node:
            rank := p.GetRank(entity.Tags);

            if (rank > -1) {
                return entity, rank, nil
            }
        case *osmpbf.Way:
            rank := p.GetRank(entity.Tags);

            if (rank > -1) {
                return entity, rank, nil
            }
        case *osmpbf.Relation:
            rank := p.GetRank(entity.Tags);

            if (rank > -1) {
                return entity, rank, nil
            }
        default:
            err := errors.New("unknown type")
            return nil, -1, err
    }

    return nil, -1, nil
}
