import L from 'leaflet';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class GeoMap {
    private supabaseUrl: string;
    private supabaseKey: string;
    protected supabase: SupabaseClient<any, "public", any>;
    private map: L.Map;

    constructor() {
        // Initialize Supabase Client
        this.supabaseUrl = 'https://ywupeuivnasbbtltqnoj.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3dXBldWl2bmFzYmJ0bHRxbm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2Nzg4NDMsImV4cCI6MjA1NjI1NDg0M30.Rp0Iz4rAvbSPqdfwgLmUNEoJFpoOmgf_4Ya5K1kmX1o';
        this.supabase = createClient(this.supabaseUrl, this.supabaseKey);

        this.map = L.map('map').setView([58.15, 8], 13);  // Change initial coordinates

        this.map.locate({setView: true, maxZoom: 16});

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(this.map);

        const fotrute = L.tileLayer.wms("https://wms.geonorge.no/skwms1/wms.friluftsruter2", {
            layers: "Fotrute",
            transparent: true,
            format: 'image/png',
            attribution: '&copy; Kartverket'
        }).addTo(this.map);

        const skiloype = L.tileLayer.wms("https://wms.geonorge.no/skwms1/wms.friluftsruter2", {
            layers: "Ruter",
            transparent: true,
            format: 'image/png',
            attribution: '&copy; Kartverket'
        }).addTo(this.map);

        const sykkel = L.tileLayer.wms("https://wms.geonorge.no/skwms1/wms.friluftsruter2", {
            layers: "SykkelRute",
            transparent: true,
            format: 'image/png',
            attribution: '&copy; Kartverket'
        }).addTo(this.map);

        L.control.layers({}, {
            "Fotrute": fotrute,
            "Skiløype": skiloype,
            "Sykkel": sykkel
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

    async loadGeoJSON(fil: string, farge: string) {
        
        try {
            const response = await fetch(`/${fil}.geojson`); // Path starts from the root of your project
            const geojsonData = await response.json();
            // Check if data is valid GeoJSON
            if (geojsonData && geojsonData.type === 'FeatureCollection') {
                // Add the GeoJSON data to the map
                L.geoJSON(geojsonData, {
                    style: () => { 
                    return {
                        color: farge,
                        weight: 5,
                        opacity: 0.75,
                        fillOpacity: 0.3, 
                    };
                }
                }).addTo(this.map);
            } else {
                console.error('Invalid GeoJSON data');
            }
        } catch (error) {
            console.error('Error loading GeoJSON file:', error);
        }
    }
}