import { GeoMap } from './GeoMap';

const geoMap = new GeoMap();

// Call loadTrails to populate the map
geoMap.loadTrails();

geoMap.loadGeoJSON("snoskred", "#ff3434");
geoMap.loadGeoJSON("flomsoner", "#4271ff");
// Example to add a trail
geoMap.addTrail("New Trail", "A beautiful trail in the mountains", 58.14813, 8.03330);
  