const galleries = [
    {
        id: 'gallery1',
        name: 'Gallery 1: The Beginning',
        description: 'This gallery covers the early stages of the liberation war.',
        coords: { x: 25, y: 30 },
        artifacts: ['artifact1', 'artifact2']
    },
    {
        id: 'gallery2',
        name: 'Gallery 2: The War',
        description: 'This gallery showcases artifacts from the war period.',
        coords: { x: 60, y: 50 },
        artifacts: ['artifact3', 'artifact4']
    },
    {
        id: 'gallery3',
        name: 'Gallery 3: The Aftermath',
        description: 'This gallery explores the aftermath of the war.',
        coords: { x: 40, y: 75 },
        artifacts: ['artifact5']
    }
];

function loadGalleryMarkers() {
    const mapMarkersContainer = document.getElementById('mapMarkers');
    
    mapMarkersContainer.innerHTML = '';

    galleries.forEach(gallery => {
        const marker = document.createElement('div');
        marker.className = 'map-marker';
        marker.style.left = `${gallery.coords.x}%`;
        marker.style.top = `${gallery.coords.y}%`;
        marker.dataset.galleryid = gallery.id;
        marker.onclick = () => showGalleryDetails(gallery.id);

        mapMarkersContainer.appendChild(marker);
    });
}

function showGalleryDetails(galleryId) {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) return;

    const galleryDisplaySection = document.getElementById('gallery-display-section');
    const galleryName = document.getElementById('gallery-name');
    const galleryDescription = document.getElementById('gallery-description');
    const artifactCardsContainer = document.getElementById('artifact-cards-container');

    galleryName.innerText = gallery.name;
    galleryDescription.innerText = gallery.description;
    
    artifactCardsContainer.innerHTML = '';

    gallery.artifacts.forEach(artifactId => {
        const artifact = artifactsData[artifactId];
        if (!artifact) return;

        const card = document.createElement('div');
        card.className = 'artifact-card';
        card.onclick = () => {
            window.location.href = `artifact_detail.html?id=${artifact.id}`;
        };

        card.innerHTML = `
            <img src="${artifact.image}" alt="${artifact.name}">
            <div class="artifact-card-content">
                <h3>${artifact.name}</h3>
            </div>
        `;
        artifactCardsContainer.appendChild(card);
    });

    galleryDisplaySection.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    const museumMapImage = document.getElementById('museumMapImage');
    if (museumMapImage.complete) {
        loadGalleryMarkers();
    } else {
        museumMapImage.onload = loadGalleryMarkers;
    }
});