
// Location data - coordinates and information
const locationsData = [
    {
        id: 1,
        x: 20,
        y: 20,
        title: "Main Entrance",
        content: "The main entrance to the facility with accessibility features, information desk, and security checkpoints. Open 24/7 for authorized personnel.",
        icon: "fas fa-door-open"
    },
    {
        id: 2,
        x: 80,
        y: 25,
        title: "Conference Center",
        content: "State-of-the-art conference facilities with capacity for up to 500 people. Features advanced audio-visual equipment and flexible seating arrangements.",
        icon: "fas fa-users"
    },
    {
        id: 3,
        x: 35,
        y: 60,
        title: "Research Wing",
        content: "The research and development area with specialized laboratories, testing facilities, and collaboration spaces for innovation projects.",
        icon: "fas fa-flask"
    },
    {
        id: 4,
        x: 75,
        y: 70,
        title: "Cafeteria",
        content: "The main dining area offering a variety of meals, snacks, and beverages. Open from 7:00 AM to 7:00 PM on weekdays.",
        icon: "fas fa-utensils"
    },
    {
        id: 5,
        x: 45,
        y: 35,
        title: "Administration",
        content: "Administrative offices and support services. Human resources, finance, and facility management are located in this section.",
        icon: "fas fa-building"
    },
    {
        id: 6,
        x: 20,
        y: 10,
        title: "Library",
        content: "Resource center with extensive collections of books, journals, and digital resources. Study areas and computer stations available.",
        icon: "fas fa-book"
    },
    {
        id: 7,
        x: 25,
        y: 75,
        title: "Recreation Area",
        content: "Employee recreation space with fitness equipment, lounge areas, and outdoor seating. Perfect for breaks and informal meetings.",
        icon: "fas fa-dumbbell"
    }
];

// DOM elements
const mapImage = document.getElementById('mapImage');
const detailsPanel = document.getElementById('detailsPanel');
const detailsContent = document.getElementById('detailsContent');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');

// Create points on the map
locationsData.forEach(location => {
    const pointElement = document.createElement('div');
    pointElement.className = 'point';
    pointElement.style.left = `${location.x}%`;
    pointElement.style.top = `${location.y}%`;
    pointElement.dataset.id = location.id;
    
    const icon = document.createElement('i');
    icon.className = location.icon;
    pointElement.appendChild(icon);
    
    const label = document.createElement('div');
    label.className = 'point-label';
    label.textContent = location.title;
    label.style.top = '-40px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    
    pointElement.appendChild(label);
    mapImage.appendChild(pointElement);
    
    // Add click event to each point: open artifacts section instead of modal
    pointElement.addEventListener('click', () => {
        // expose dataset id for delegation in main.js
        pointElement.dataset.id = location.id;
        if (window.loadArtifactsByGallery) {
            window.loadArtifactsByGallery(location.id);
            if (window.scrollToSection) {
                window.scrollToSection('artifacts');
            }
        }
    });
});

// Show details for a location
// Deprecated modal open; kept no-op to avoid errors
function showLocationDetails() { }

// Close details panel
// Disable modal controls

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetails();
    }
});
