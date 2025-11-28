
const map = L.map('map').setView([-1.2862, 36.8774], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Category Icons
const categoryIcons = {
    "Wildlife & Nature": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/616/616408.png", iconSize: [32, 32], className: 'marker-icon' }),
    "History & Culture": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942801.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Shopping & Crafts": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Dining & Leisure": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png", iconSize: [32, 32], className: 'marker-icon' }),
    "Entertainment & Malls": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/833/833314.png", iconSize: [32, 32], className: 'marker-icon' })
};


// Layer groups per category
const layers = {};
Object.keys(categoryIcons).forEach(cat => {
    layers[cat] = L.layerGroup().addTo(map);
});


let allMarkers = []; // for searching

const panel = document.getElementById('info-panel');
const panelContent = document.getElementById('panel-content');
const closePanel = document.getElementById('close-panel');

closePanel.addEventListener('click', () => {
    panel.style.display = 'none';
});

fetch('sites.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(site => {
            const marker = L.marker([site.lat, site.lng], {
                icon: categoryIcons[site.category]
            }).addTo(layers[site.category]);

            marker._category = site.category;
            marker._name = site.name.toLowerCase();

            marker.on('click', () => {
                panelContent.innerHTML = `
                    <h2>${site.name}</h2>
					<img src="${site.image}" alt="${site.name}" />
                    <p>${site.description}</p>
                    <p><b>Fun Fact</b>: ${site.fun_facts}</p>
                    <p><b>Fees</b>: ${site.fees}</p>
                    <p><b>Open Hours</b>: ${site.open_hours}</p>
                    <a href="${site.link}" target="_blank">Visit Website</a>
                `;
                panel.style.display = 'block';
            });

            allMarkers.push(marker);
        });

        updateLegend();
    });

// Search functionality
const searchBox = document.getElementById("searchBox");
searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();

    allMarkers.forEach(m => {
        const inSearch = m._name.includes(query);
        const inCategory = document.querySelector(`input[data-category="${m._category}"]`).checked;

        if (inSearch && inCategory) layers[m._category].addLayer(m);
        else layers[m._category].removeLayer(m);
    });
});

// Category filter buttons
const checkboxes = document.querySelectorAll('.filter-checkbox');
checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
        const cat = cb.getAttribute('data-category');
        const isChecked = cb.checked;

        if (isChecked) map.addLayer(layers[cat]);
        else map.removeLayer(layers[cat]);
    });
});

// Dynamic Legend
function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';

    Object.keys(categoryIcons).forEach(cat => {
        legend.innerHTML += `
            <div class="legend-item">
                <img class="legend-icon" src="${categoryIcons[cat].options.iconUrl}" />
                ${cat}
            </div>
        `;
    });
}

