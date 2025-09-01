// Global variables
let currentUser = null;
let currentSlideIndex = 0;
let slideshowInterval;
let slideshowImages = []; // To store images fetched from DB

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSlideshowImages(); // Load slideshow images first
    loadArtifacts();
    wireMapPointsToArtifacts();
});

// Initialize the application
function initializeApp() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
        currentUser = JSON.parse(localStorage.getItem('user'));
        updateAuthButtons();
    }

    // Set default admin email in login form for convenience
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.placeholder = 'admin@museum.org';
    }

    // Initialize AOS (Animate On Scroll)
    // Ensure AOS is loaded before initializing
    if (window.AOS) {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    } else {
        // Fallback if AOS is not loaded, or handle it differently
        console.warn("AOS library not found. Animations may not work.");
    }
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            scrollToSection(target);

            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Search functionality
    const searchInput = document.getElementById('slideshowSearchValue');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchArtifactsFromSlideshow();
            }
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterArtifacts(btn.dataset.filter);
        });
    });

    // Smooth scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
        });
    });
}

// Map -> open artifacts section for a clicked gallery/location
function wireMapPointsToArtifacts() {
    const mapContainer = document.getElementById('mapImage');
    if (!mapContainer) return;

    // Delegate clicks on dynamically created points
    mapContainer.addEventListener('click', async (e) => {
        const point = e.target.closest('.point');
        if (!point) return;

        const id = point.dataset.id;
        // Use id or title as the gallery key; fallback to all
        await loadArtifactsByGallery(id);
        scrollToSection('artifacts');
    });
}

async function loadArtifactsByGallery(galleryKey) {
    try {
        // For now, use dummy data since backend might not be ready
        const artifacts = getDummyGalleryArtifacts(galleryKey);
        renderGalleryArtifacts(artifacts, galleryKey);
        
        // Uncomment when backend is ready:
        // const response = await fetch(`php/api.php?action=get_artifacts_by_gallery&gallery=${encodeURIComponent(galleryKey)}`);
        // const data = await response.json();
        // let artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
        // if (artifacts.length === 0) {
        //     artifacts = getDummyGalleryArtifacts(galleryKey);
        // }
        // renderGalleryArtifacts(artifacts, galleryKey);
    } catch (error) {
        console.log('Using fallback data:', error);
        const artifacts = getDummyGalleryArtifacts(galleryKey);
        renderGalleryArtifacts(artifacts, galleryKey);
    }
}

function getDummyGalleryArtifacts(galleryKey) {
    // Dummy data for Liberation War Museum artifacts
    const allArtifacts = {
        'gallery1': [
            {
                id: '1',
                title: "Freedom Fighter's Personal Diary",
                description: "A handwritten diary documenting the liberation struggle",
                image: "assets/images/img1.jpg"
            },
            {
                id: '2',
                title: "Mukti Bahini Uniform",
                description: "Original uniform worn by freedom fighters",
                image: "assets/images/img2.jpg"
            },
            {
                id: '3',
                title: "Liberation War Documents",
                description: "Official documents from the war period",
                image: "assets/images/img3.jpg"
            },
            {
                id: '4',
                title: "War Photographs",
                description: "Historical photographs from 1971",
                image: "assets/images/img4.jpg"
            },
            {
                id: '5',
                title: "Radio Equipment",
                description: "Communication equipment used during the war",
                image: "assets/images/img5.jpg"
            },
            {
                id: '6',
                title: "Liberation War Medals",
                description: "Medals awarded to freedom fighters",
                image: "assets/images/img1.jpg"
            }
        ],
        'gallery2': [
            {
                id: '7',
                title: "Historical Weapons",
                description: "Weapons used during the liberation war",
                image: "assets/images/img2.jpg"
            },
            {
                id: '8',
                title: "War Maps",
                description: "Strategic maps from the liberation period",
                image: "assets/images/img3.jpg"
            },
            {
                id: '9',
                title: "Freedom Fighter Letters",
                description: "Personal letters from the war period",
                image: "assets/images/img4.jpg"
            }
        ],
        'gallery3': [
            {
                id: '10',
                title: "Liberation War Artifacts",
                description: "Various artifacts from the liberation struggle",
                image: "assets/images/img5.jpg"
            },
            {
                id: '11',
                title: "Historical Newspapers",
                description: "Newspapers from the liberation period",
                image: "assets/images/img1.jpg"
            },
            {
                id: '12',
                title: "War Memorabilia",
                description: "Personal items from freedom fighters",
                image: "assets/images/img2.jpg"
            }
        ]
    };
    
    return allArtifacts[galleryKey] || allArtifacts['gallery1'];
}

function getGalleryMeta(galleryKey) {
    const galleryMeta = {
        'gallery1': {
            title: "Archaeology Collections",
            description: "After the Indus Valley Civilization, India came into the age of different rulers and dynasties. During the ancient and medieval period of Indian history, many dynasties like the Maurya, Shunga, Satavahana, Kushana, Gupta, Vardhanas, Pratiharas (in the north), Palas, Sena (in the east), Maitrakas (in the west), Chola, Chalukya, Hoysalas, Vijayanagar, Nayakas (in the south) has emerged in a different part of India. Various type of art was patronized during this period which includes religious structures, Fort, Mausoleums, and sculptures made of different materials etc. Many selected examples of various art style, which flourished simultaneously in different regions are exhibited in the \"Maurya, Sunga and Satavahana Art\", \"Kushan and Ikshvaku Art\", \"Gupta Art, Early and late Medieval Art\" Galleries of National Museum, Delhi."
        },
        'gallery2': {
            title: "Liberation War Gallery",
            description: "This gallery showcases artifacts and documents from the Liberation War of Bangladesh in 1971. It includes personal items, weapons, documents, and photographs that tell the story of the struggle for independence."
        },
        'gallery3': {
            title: "Historical Documents Gallery",
            description: "A collection of important historical documents, letters, and newspapers from the liberation period. These artifacts provide insight into the political and social context of the time."
        }
    };
    
    return galleryMeta[galleryKey] || galleryMeta['gallery1'];
}

function renderGalleryArtifacts(artifacts, galleryKey) {
    const section = document.getElementById('galleryArtifactsSection');
    const title = document.getElementById('galleryArtifactsTitle');
    const desc = document.getElementById('galleryArtifactsDesc');
    const slideshow = document.getElementById('gallerySlideshow');
    const prevBtn = document.getElementById('galleryPrevBtn');
    const nextBtn = document.getElementById('galleryNextBtn');
    if (!section || !slideshow) return;

    const galleryMeta = getGalleryMeta(galleryKey);
    title.textContent = galleryMeta.title;
    if (desc) desc.textContent = galleryMeta.description;
    section.style.display = 'block';

    let currentIndex = 0;
    const itemsPerView = 3;
    const totalSlides = Math.ceil(artifacts.length / itemsPerView);

    function renderSlides() {
        const startIndex = currentIndex * itemsPerView;
        const endIndex = Math.min(startIndex + itemsPerView, artifacts.length);
        
        slideshow.innerHTML = '';
        
        for (let i = startIndex; i < endIndex; i++) {
            if (artifacts[i]) {
                const slide = document.createElement('div');
                slide.className = 'gallery-slide parallax-slide';
                slide.style.transform = `translateX(${(i - startIndex) * 100}%)`;
                slide.innerHTML = `
                    <div class="slide-content">
                        <img src="${artifacts[i].image}" alt="${artifacts[i].title}" onclick="redirectToArtifactDetail(${i})">
                        <div class="slide-overlay">
                            <h3>${artifacts[i].title}</h3>
                            <p>${artifacts[i].description}</p>
                        </div>
                    </div>
                `;
                slideshow.appendChild(slide);
            }
        }
        
        // Show/hide navigation buttons
        if (prevBtn) prevBtn.style.display = currentIndex > 0 ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = currentIndex < totalSlides - 1 ? 'flex' : 'none';
    }

    window.galleryChangeSlide = function(direction) {
        currentIndex = Math.max(0, Math.min(totalSlides - 1, currentIndex + direction));
        renderSlides();
    };

    window.redirectToArtifactDetail = function(index) {
        const artifact = artifacts[index];
        if (artifact) {
            window.location.href = `artifact_detail.html?id=${artifact.id || index}&title=${encodeURIComponent(artifact.title)}`;
        }
    };

    renderSlides();
}

// Slideshow functionality
async function loadSlideshowImages() {
    try {
        // Use dummy data instead of API call since backend is not available
        slideshowImages = [
            { image_path: 'img1.jpg', caption: 'Liberation War Museum' },
            { image_path: 'img2.jpg', caption: 'Historical Artifacts' },
            { image_path: 'img3.jpg', caption: 'Freedom Fighters Memorial' },
            { image_path: 'img4.jpg', caption: 'War Memorial' },
            { image_path: 'img5.jpg', caption: 'Museum Collections' }
        ];
        renderSlideshow();
        startSlideshow();
        
        // Uncomment when backend is ready:
        // const response = await fetch('php/api.php?action=get_slideshow_images');
        // slideshowImages = await response.json();
        // renderSlideshow();
        // startSlideshow();
    } catch (error) {
        console.error('Failed to load slideshow images:', error);
        // Use fallback dummy data
        slideshowImages = [
            { image_path: 'img1.jpg', caption: 'Liberation War Museum' },
            { image_path: 'img2.jpg', caption: 'Historical Artifacts' },
            { image_path: 'img3.jpg', caption: 'Freedom Fighters Memorial' }
        ];
        renderSlideshow();
        startSlideshow();
    }
}

function renderSlideshow() {
    const slideshowContainer = document.querySelector('.slideshow');
    const slideIndicatorsContainer = document.querySelector('.slide-indicators');

    if (!slideshowContainer || !slideIndicatorsContainer || slideshowImages.length === 0) return;

    // Clear existing slides and indicators
    slideshowContainer.querySelectorAll('.slides').forEach(slide => slide.remove());
    slideIndicatorsContainer.innerHTML = '';

    slideshowImages.forEach((image, index) => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slides', 'fade');
        if (index === 0) slideDiv.style.display = 'block';
        slideDiv.setAttribute('data-aos', 'zoom-in');

        slideDiv.innerHTML = `
            <img src="assets/images/${image.image_path}" alt="${image.caption}">
            <div class="hero-overlay"></div>
            <div class="hero-text" data-aos="fade-up" data-aos-delay="300">
                <div class="hero-badge">
                    <i class="fas fa-star"></i>
                    <span>Digital Archive</span>
                </div>
                <h2 class="hero-title">${image.caption}</h2>
                <p class="hero-subtitle">Explore the artifacts and stories from the Liberation War of Bangladesh</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary btn-hero" onclick="openExploreModal()">
                        <i class="fas fa-search"></i>
                        Explore Exhibits
                    </button>
                    <button class="btn btn-outline btn-hero" onclick="scrollToSection('about')">
                        <i class="fas fa-info-circle"></i>
                        Learn More
                    </button>
                </div>
            </div>
        `;
        slideshowContainer.insertBefore(slideDiv, slideshowContainer.querySelector('.slideshow-nav.prev'));

        const indicatorSpan = document.createElement('span');
        indicatorSpan.classList.add('indicator');
        if (index === 0) indicatorSpan.classList.add('active');
        indicatorSpan.setAttribute('onclick', `currentSlide(${index})`);
        slideIndicatorsContainer.appendChild(indicatorSpan);
    });

    setupSlideshow();
}

function setupSlideshow() {
    let slideIndex = 0;
    showSlides();

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides() {
        let i;
        let slides = document.getElementsByClassName("slides");
        let dots = document.getElementsByClassName("indicator");
        if (slideIndex >= slides.length) {slideIndex = 0}
        if (slideIndex < 0) {slideIndex = slides.length - 1}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex].style.display = "block";
        dots[slideIndex].className += " active";
    }

    // Make plusSlides and currentSlide globally accessible for the onclick attributes
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;

    // Automatic slideshow
    setInterval(() => {
        plusSlides(1);
    }, 5000);
}


function startSlideshow() {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
        currentSlideIndex = index;
    }
    
    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }
    
    // Auto-advance slides
    slideshowInterval = setInterval(nextSlide, 5000);
    
    // Pause on hover
    const slideshow = document.querySelector('.slideshow');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', () => clearInterval(slideshowInterval));
        slideshow.addEventListener('mouseleave', () => {
            slideshowInterval = setInterval(nextSlide, 5000);
        });
    }
}

// Global slideshow functions
window.plusSlides = function(n) {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    currentSlideIndex = (currentSlideIndex + n + slides.length) % slides.length;
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
    
    // Reset interval
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    }, 5000);
};

window.currentSlide = function(n) {
    const slides = document.querySelectorAll('.slides');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    currentSlideIndex = n - 1;
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
    
    // Reset interval
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        slides[currentSlideIndex].classList.add('active');
        indicators[currentSlideIndex].classList.add('active');
    }, 5000);
};

// Smooth scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Authentication functions
async function registerUser(userData) {
    try {
        const response = await fetch('php/admin_api.php?action=register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Registration successful! Please login.', 'success');
            addLog('User Registered', `User with email ${userData.email} has registered.`);
            closeRegisterModal();
            openLoginModal();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

async function loginUser(credentials) {
    try {
        const response = await fetch('php/admin_api.php?action=login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('adminName', data.user.name);
            localStorage.setItem('adminEmail', data.user.email);
            currentUser = data.user;

            updateAuthButtons();
            closeLoginModal();
            showNotification(`Welcome back, ${data.user.name}!`, 'success');
            addLog('User Login', `User ${data.user.name} logged in.`);

            // Redirect based on user role
            if (data.user.role === 'admin') {
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else if (data.user.role === 'visitor') { // Assuming 'visitor' role for regular users
                setTimeout(() => {
                    window.location.href = 'visitor_dashboard.html';
                }, 1000);
            } else { // Default to visitor dashboard for any other non-admin role
                setTimeout(() => {
                    window.location.href = 'visitor_dashboard.html';
                }, 1000);
            }
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
}

function logout() {
    addLog('User Logout', `User ${currentUser.name} logged out.`);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
    updateAuthButtons();
    showNotification('Logged out successfully', 'success');
}

function updateAuthButtons() {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (currentUser) {
        authButtons.innerHTML = `
            <div class="user-menu">
                <button class="btn btn-outline btn-glow" onclick="toggleUserMenu()">
                    <i class="fas fa-user"></i>
                    ${currentUser.name}
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="#" onclick="showProfile()">
                        <i class="fas fa-user-circle"></i>
                        Profile
                    </a>
                    ${currentUser.role === 'admin' ?
                        '<a href="admin.html"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
                    <a href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Logout
                    </a>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline btn-glow" onclick="openLoginModal()">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </button>
            <button class="btn btn-primary btn-glow" onclick="openRegisterModal()">
                <i class="fas fa-user-plus"></i>
                Register
            </button>
        `;
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// Modal functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openExploreModal() {
    scrollToSection('exhibits');
}

// Search and filter functions
async function searchArtifactsFromSlideshow() {
    const searchType = document.getElementById('slideshowSearchType')?.value;
    const searchValue = document.getElementById('slideshowSearchValue')?.value;

    if (!searchValue.trim()) {
        showNotification('Please enter a search term', 'warning');
        return;
    }

    try {
        const response = await fetch(`php/api.php?action=search_artifacts&type=${searchType}&value=${encodeURIComponent(searchValue)}`);
        const data = await response.json();

        displayArtifacts(data.artifacts);
        updateResultCount(data.artifacts.length);
        addLog('Search Artifacts', `Visitor searched for "${searchValue}"`);

        if (data.artifacts.length === 0) {
            showNotification('No artifacts found matching your search', 'info');
        } else {
            // Scroll to exhibits section
            scrollToSection('exhibits');
        }
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    }
}

function filterArtifacts(filter) {
    // This would typically make an API call with filter parameters
    // For now, we'll just show a notification
    showNotification(`Filtering by: ${filter}`, 'info');
    addLog('Filter Artifacts', `Visitor filtered by "${filter}"`);
    loadArtifacts(filter);
}

async function loadArtifacts() {
    try {
        const response = await fetch('php/api.php?action=get_artifacts');
        const data = await response.json();
        
        if (data && Array.isArray(data.artifacts)) {
            renderFeaturedArtifactsCoverflow(data.artifacts);
        } else {
            // Fallback: use dummy data
            const dummyArtifacts = [
                {
                    id: 1,
                    title: "Freedom Fighter's Diary",
                    description: "Personal diary from the liberation war",
                    image: "assets/images/img1.jpg"
                },
                {
                    id: 2,
                    title: "Mukti Bahini Uniform",
                    description: "Original uniform worn by freedom fighters",
                    image: "assets/images/img2.jpg"
                },
                {
                    id: 3,
                    title: "Liberation War Documents",
                    description: "Official documents from 1971",
                    image: "assets/images/img3.jpg"
                },
                {
                    id: 4,
                    title: "Historical Photographs",
                    description: "Rare photographs from the war period",
                    image: "assets/images/img4.jpg"
                },
                {
                    id: 5,
                    title: "War Memorabilia",
                    description: "Personal items from freedom fighters",
                    image: "assets/images/img5.jpg"
                }
            ];
            renderFeaturedArtifactsCoverflow(dummyArtifacts);
        }
    } catch (error) {
        console.error('Failed to load artifacts:', error);
        // Use dummy data as fallback
        const dummyArtifacts = [
            {
                id: 1,
                title: "Freedom Fighter's Diary",
                description: "Personal diary from the liberation war",
                image: "assets/images/img1.jpg"
            },
            {
                id: 2,
                title: "Mukti Bahini Uniform",
                description: "Original uniform worn by freedom fighters",
                image: "assets/images/img2.jpg"
            },
            {
                id: 3,
                title: "Liberation War Documents",
                description: "Official documents from 1971",
                image: "assets/images/img3.jpg"
            },
            {
                id: 4,
                title: "Historical Photographs",
                description: "Rare photographs from the war period",
                image: "assets/images/img4.jpg"
            },
            {
                id: 5,
                title: "War Memorabilia",
                description: "Personal items from freedom fighters",
                image: "assets/images/img5.jpg"
            }
        ];
        renderFeaturedArtifactsCoverflow(dummyArtifacts);
    }
}

function renderFeaturedArtifactsCoverflow(artifacts) {
    const container = document.querySelector('.featured-slideshow');
    if (!container) return;

    container.innerHTML = '';
    
    artifacts.forEach((artifact, index) => {
        const slide = document.createElement('div');
        slide.className = 'featured-slide';
        slide.innerHTML = `
            <img src="${artifact.image}" alt="${artifact.title}">
            <div class="featured-slide-content">
                <h3>${artifact.title}</h3>
                <p>${artifact.description}</p>
            </div>
        `;
        container.appendChild(slide);
    });

    // Add navigation buttons
    const prevBtn = document.createElement('button');
    prevBtn.className = 'slideshow-nav prev-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.onclick = () => changeFeaturedSlide(-1);
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'slideshow-nav next-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.onclick = () => changeFeaturedSlide(1);
    
    container.parentElement.appendChild(prevBtn);
    container.parentElement.appendChild(nextBtn);
}

function getArtifactImage(artifact) {
    // This function would typically fetch the image URL from an API
    // For now, it returns a placeholder or a default image
    return artifact.image || 'assets/images/placeholder.jpg';
}

function changeFeaturedSlide(direction) {
    const slides = document.querySelectorAll('.featured-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;
    slides.forEach((slide, index) => {
        if (slide.classList.contains('active')) {
            currentIndex = index;
        }
    });

    const newIndex = (currentIndex + direction + slides.length) % slides.length;
    showFeaturedSlide(newIndex);

    // Reset auto-advance timer
    clearInterval(featuredSlideshowInterval);
    featuredSlideshowInterval = setInterval(() => {
        changeFeaturedSlide(1);
    }, 6000);
}

function currentFeaturedSlide(slideNumber) {
    const targetIndex = slideNumber - 1; // Convert to 0-based index
    showFeaturedSlide(targetIndex);
    
    // Reset auto-advance timer
    clearInterval(featuredSlideshowInterval);
    featuredSlideshowInterval = setInterval(() => {
        changeFeaturedSlide(1);
    }, 6000);
}

// Initialize both slideshows when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all elements are rendered
    setTimeout(() => {
        initializeHeroSlideshow();
        initializeFeaturedSlideshow();
    }, 500);
});

// Export functions for global access
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.openExploreModal = openExploreModal;
window.searchArtifactsFromSlideshow = searchArtifactsFromSlideshow;
window.scrollToSection = scrollToSection;
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;
window.viewArtifact = viewArtifact;
window.closeArtifactModal = closeArtifactModal;
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.changeHeroSlide = changeHeroSlide;
window.currentHeroSlide = currentHeroSlide;
window.loadArtifactsByGallery = loadArtifactsByGallery;