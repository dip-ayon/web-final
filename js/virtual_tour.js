const tourRooms = [
    {
        image: 'assets/images/museum_room1.jpg',
        description: 'Welcome to the main hall. Explore the exhibits around you.',
        hotspots: [
            { top: '50%', left: '20%', text: 'Historic Document', link: 'gallery.html?artifact=tour_document1' },
            { top: '60%', left: '70%', text: 'Freedom Fighter's Uniform', link: 'gallery.html?artifact=tour_uniform1' }
        ]
    },
    {
        image: 'assets/images/museum_room2.jpg',
        description: 'Discover ancient artifacts in this section.',
        hotspots: [
            { top: '40%', left: '30%', text: 'Ancient Pottery', link: 'gallery.html?artifact=tour_pottery1' },
            { top: '70%', left: '50%', text: 'Old Coins', link: 'gallery.html?artifact=tour_coins1' }
        ]
    },
    {
        image: 'assets/images/museum_room3.jpg',
        description: 'View the powerful war photography collection.',
        hotspots: [
            { top: '35%', left: '60%', text: 'War Photo Album', link: 'gallery.html?artifact=tour_photo1' }
        ]
    }
];

let currentRoomIndex = 0;

function updateTourDisplay() {
    const currentRoom = tourRooms[currentRoomIndex];
    document.getElementById('tourImage').src = currentRoom.image;
    document.getElementById('tourDescription').innerText = currentRoom.description;

    const hotspotsContainer = document.getElementById('tourHotspots');
    hotspotsContainer.innerHTML = ''; // Clear existing hotspots

    currentRoom.hotspots.forEach(hotspot => {
        const a = document.createElement('a');
        a.href = hotspot.link;
        a.className = 'hotspot';
        a.style.top = hotspot.top;
        a.style.left = hotspot.left;
        a.innerText = hotspot.text;
        hotspotsContainer.appendChild(a);
    });
}

function changeTourRoom(direction) {
    if (direction === 'next') {
        currentRoomIndex = (currentRoomIndex + 1) % tourRooms.length;
    } else if (direction === 'prev') {
        currentRoomIndex = (currentRoomIndex - 1 + tourRooms.length) % tourRooms.length;
    }
    updateTourDisplay();
}

// Initialize the tour when the page loads
document.addEventListener('DOMContentLoaded', updateTourDisplay);
