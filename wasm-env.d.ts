declare module "*.wasm" {
    export default function(importObject?: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource>
}

