// Create the map
const map = L.map('map').setView([37.7749, -122.4194], 5);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch the earthquake data
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Function to determine marker size based on magnitude
        const markerSize = magnitude => magnitude * 4;

        // Function to determine marker color based on depth
        const markerColor = depth => {
            return depth > 90 ? 'red' :
                   depth > 70 ? 'orange' :
                   depth > 50 ? 'gold' :
                   depth > 30 ? 'yellow' :
                   depth > 10 ? 'lime' :
                                'green';
        };

        // Add GeoJSON layer to the map
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.circleMarker(latlng, {
                    radius: markerSize(feature.properties.mag),
                    fillColor: markerColor(feature.geometry.coordinates[2]),
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: (feature, layer) => {
                layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
            }
        }).addTo(map);

        // Add legend to the map
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            const depths = [0, 10, 30, 50, 70, 90];
            const labels = [];

            // Loop through depth intervals and generate a label with a colored square for each interval
            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);
    });
