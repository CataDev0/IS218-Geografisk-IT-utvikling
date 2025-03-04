# IS218-Geografisk-IT-utvikling

Problemstilling: Skal du på gåtur, skitur eller sykkeltur i et flomutsatt eller snøskredsutsatt område? 

Implementering: 
    - Vi henter raster data fra kartverket, som legges oppå OpenStreetMap, og legger inn/henter ut geoJSON data fra supabase basert på datasett fra GeoNorge. 

Verktøy: 
- Leaflet.js
- Supabase
- TypeScript, HTML, GeoJSON
- bun.sh

Datasett:
- OpenStreetMap
- Turrutebasen
    -  (GeoNorge, Kartverket) (WMS)
- Flomsoner 
    - (GeoNorge, Norges vassdrags- og energidirektorat) (GeoJSON)
- Aktsomhetskart for snøskred 
    - (GeoNorge, Norges vassdrags- og energidirektorat) (GeoJSON)

![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

Env variables
- VITE_supabaseUrl
- VITE_supabaseKey

# proto-gis

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
