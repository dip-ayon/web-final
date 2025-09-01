function changeImage(imagePath) {
    const mainImage = document.getElementById('mainArtifactImage');
    mainImage.src = imagePath;

    // Remove 'active' class from all thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.classList.remove('active');
    });

    // Add 'active' class to the clicked thumbnail
    const clickedThumbnail = document.querySelector(`.thumbnail[onclick*='${imagePath}']`);
    if (clickedThumbnail) {
        clickedThumbnail.classList.add('active');
    }
}

let currentZoom = 1;

function zoomIn() {
    const mainImage = document.getElementById('mainArtifactImage');
    currentZoom += 0.2;
    mainImage.style.transform = `scale(${currentZoom})`;
    mainImage.style.transformOrigin = 'center center';
}

function zoomOut() {
    const mainImage = document.getElementById('mainArtifactImage');
    if (currentZoom > 1) {
        currentZoom -= 0.2;
        mainImage.style.transform = `scale(${currentZoom})`;
    }
}
