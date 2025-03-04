import * as L from 'leaflet';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import "leaflet/dist/leaflet.css";

export class GeoMap {
    private supabaseUrl?: string;
    private supabaseKey?: string;
    protected supabase: SupabaseClient<any, "public", any>;
    private map: L.Map;
    private layerControl?: L.Control.Layers;

    constructor() {

        if (!import.meta.env.VITE_supabaseUrl || !import.meta.env.VITE_supabaseKey) {
            throw new Error("Missing supabase env variables!")
        }

        // Initialize Supabase Client
        this.supabaseUrl = import.meta.env.VITE_supabaseUrl;
        this.supabaseKey = import.meta.env.VITE_supabaseKey;
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

        this.map = L.map('map').setView([58.15, 8], 13);  // Change initial coordinates

        this.map.locate({ setView: true, maxZoom: 16 });

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        (async () => {
            return Promise.all([
                this.createAndAddWMSTileLayer("Fotrute"),
                this.createAndAddWMSTileLayer("Skiloype"),
                this.createAndAddWMSTileLayer("SykkelRute")
            ])
        })()
            .then(([fotrute, skiloype, sykkel]) => {
                this.layerControl = L.control.layers({}, {
                    "<span style='color: #ff7f7f'>Fotrute</span>": fotrute,
                    "<span style='color: #1450a4'>Skiløype</span>": skiloype,
                    "<span style='color: black'>Sykkel</span>": sykkel
                }).addTo(this.map);
            });
    }

    async createAndAddWMSTileLayer(layer: string) {
        return L.tileLayer.wms("https://wms.geonorge.no/skwms1/wms.friluftsruter2", {
            layers: layer,
            transparent: true,
            format: 'image/png',
            attribution: '&copy; Kartverket'
        }).addTo(this.map);
    }
    // Load Trails from Supabase
    async loadTrails() {
        const { data, error } = await this.supabase
            .from('Trails')
            .select('*');

        if (error) {
            console.error("Error loading trails:", error);
            return;
        }

        // Add markers for each trail
        data.forEach((trail: { latitude: number; longitude: number; name: any; description: any; }) => {
            L.marker([trail.latitude, trail.longitude])
                .addTo(this.map)
                .bindPopup(`<b>${trail.name}</b><br>${trail.description}`);
        });
    }

    // Add functionality to save new trail
    async addTrail(name: string, description: string, latitude: number, longitude: number) {
        const { data, error } = await this.supabase
            .from('Trails')
            .insert([
                { name, description, latitude, longitude }
            ]);

        if (error) {
            console.error("Error adding trail:", error);
        } else {
            console.log('Trail added successfully:', data);
            this.loadTrails();  // Reload trails after adding new one
        }
    }

    // Load GeoJSON from Supabase and add to map
    async loadGeoJSONFromSupabase() {
        const { data, error } = await this.supabase
            .from('GeoData') // Your table containing GeoJSON data
            .select('geojson, name, color');  // Adjust this based on your table structure

        if (error) {
            console.error("Error loading GeoJSON from Supabase:", error);
            return;
        }

        // Iterate through the GeoJSON data
        data.forEach((geoData: { geojson: any, name: string, color: `#${string}` }) => {
            // Check if data is valid GeoJSON
            if (geoData.geojson && geoData.geojson.type === 'FeatureCollection') {
                const layer = L.geoJSON(geoData.geojson, {
                    style: () => {
                        return {
                            color: geoData.color,
                            weight: 5,
                            opacity: 0.75,
                            fillOpacity: 0.3,
                        };
                    },
                    attribution: "&copy; Norges vassdrags- og energidirektorat"
                }).addTo(this.map);

                if (geoData.name === "Snoskred") geoData.name = "Snøskred";

                this.layerControl?.addOverlay(layer, `<span style='color: ${geoData.color}'>${geoData.name[0].toUpperCase() + geoData.name.slice(1)}</span>`)

            } else {
                console.error('Invalid GeoJSON data for', geoData.name);
            }
        });
    }

    async loadGeoJSON(file: string, color: string) {

        const geoDataRow = await this.supabase
            .from("GeoData")
            .select("*")
            .textSearch("name", file)
            .limit(1);

        if (!geoDataRow.data?.length || geoDataRow.error) {
            try {
                const response = await fetch(`/${file}.geojson`); // Path starts from the root of your project
                const geojsonData = await response.json();
                // Check if data is valid GeoJSON
                if (geojsonData && geojsonData.type === 'FeatureCollection') {
                    await this.supabase.from("GeoData")
                        .insert([
                            {
                                name: file,
                                color,
                                geojson: geojsonData
                            }
                        ])
                } else {
                    console.error('Invalid GeoJSON data');
                }
            } catch (error) {
                console.error('Error loading GeoJSON file:', error);
            }
        }
    }

    async loadAllGeoJSON() {
        await Promise.all([
            this.loadGeoJSON("snoskred", "#ff3434"),
            this.loadGeoJSON("flomsoner", "#4271ff")
        ]);

        await this.loadGeoJSONFromSupabase();
    }
}