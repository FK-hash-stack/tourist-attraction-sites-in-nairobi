// MAIN.JS — Nairobi Tourist Map

const map = L.map('map').setView([-1.286389, 36.817223], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Category Icons
const categoryIcons = {
    "Park": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [32, 32] }),
    "Museum": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/2942/2942801.png", iconSize: [32, 32] }),
    "Landmark": L.icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/854/854878.png", iconSize: [32, 32] })
};

// Layer groups per category
const layers = {
    "Park": L.layerGroup().addTo(map),
    "Museum": L.layerGroup().addTo(map),
    "Landmark": L.layerGroup().addTo(map)
};

let allMarkers = []; // for searching

// Load Site Data
fetch('sites.json')
    .then(res => res.json())
    .then(data => {
        data.forEach(site => {
            const popupHTML = `
                <h3>${site.name}</h3>
                <img src="${site.image}" style="width:200px;border-radius:6px;" />
                <p>${site.description}</p>
                <a href="${site.link}" target="_blank">Visit Website</a>
            `;

            const marker = L.marker([site.lat, site.lng], {
                icon: categoryIcons[site.category]
            }).bindPopup(popupHTML);

            marker._category = site.category;
            marker._name = site.name.toLowerCase();

            layers[site.category].addLayer(marker);
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
