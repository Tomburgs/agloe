package main;

import (
    "strings"
);

func isValidEntity(Tags map[string]string) bool {
    name, ok := Tags["name"];

    return ok && strings.Contains(name, searchTerm);
}
