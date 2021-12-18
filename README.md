<p align="center">
    <img
      width="700px"
      alt="Agloe"
      src="https://github.com/Tomburgs/agloe/raw/master/.github/logo.png"
    />
</p>

## What is Agloe

Agloe is a privacy concerned geocoder which combines Go with WebAssembly in order to parse highly compressed Open Street Map (OSM) files all in the browser.

We host a live version [here](https://agloe.vercel.app), so give it a go.


## How it works

The core of the application is written in Go. We utilize various browser APIs such as WebAssembly, IndexedDB, and read/write streams to create a geocoder which does not depend on any backend services for searching & locating entities.

## Limits of Agloe

Agloe is not a replacement for any of the major geodata service providers, such as MapBox, Pelias, Apple Maps, or Google Maps for when you need to parse the entire world for geographic locations.

That being said, it is more than able to parse regions or cities for coordinates / bounds for things such as stores, streets, monuments, cafes, etc. If you're looking to make a widget that could let your users search for stuff within a city, give Agloe a shot.

## Browser support

Agloe is supported in the latest version of every major browser.
