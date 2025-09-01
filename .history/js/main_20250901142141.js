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
        // Assumes backend supports gallery filtering by id or name
        const response = await fetch(`php/api.php?action=get_artifacts_by_gallery&gallery=${encodeURIComponent(galleryKey)}`);
        const data = await response.json();

        let artifacts = Array.isArray(data?.artifacts) ? data.artifacts : [];
        if (artifacts.length === 0) {
            // Fallback dummy data for Liberation War Museum
            artifacts = getDummyGalleryArtifacts(galleryKey);
        }

        renderGalleryArtifacts(artifacts, galleryKey);
    } catch (_) {
        const artifacts = getDummyGalleryArtifacts(galleryKey);
        renderGalleryArtifacts(artifacts, galleryKey);
    }
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
                slide.className = 'gallery-slide';
                slide.innerHTML = `<img src="${artifacts[i].image}" alt="${artifacts[i].title}" onclick="redirectToArtifactDetail(${i})">`;
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
        const response = await fetch('php/api.php?action=get_slideshow_images');
        slideshowImages = await response.json();
        renderSlideshow();
        startSlideshow();
    } catch (error) {
        console.error('Failed to load slideshow images:', error);
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

async function loadArtifacts(filter = 'all') {
    try {
        let url = 'php/api.php?action=get_top_visited_artifacts'; // Default to top visited
        if (filter !== 'all') {
            url = `php/api.php?action=search_artifacts&type=object_type&value=${filter}`;
        }
        const response = await fetch(url);
        const data = await response.json();

        displayArtifacts(data.artifacts);
    } catch (error) {
        console.error('Failed to load artifacts:', error);
    }
}


function displayArtifacts(artifacts) {
    const grid = document.getElementById('artifactsGrid');
    if (!grid) return;

    if (artifacts.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No artifacts found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = artifacts.map(artifact => `
        <div class="artifact-card" data-aos="fade-up" onclick="viewArtifact(${artifact.id})">
            <div class="artifact-img">
                <img src="assets/images/${artifact.images[0]}" alt="${artifact.object_head || 'Artifact'}">
                <div class="artifact-overlay">
                    <button class="btn btn-primary">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                </div>
            </div>
            <div class="artifact-info">
                <h3>${artifact.object_head || 'Unnamed Artifact'}</h3>
                <div class="artifact-meta">
                    <span><i class="fas fa-hashtag"></i> ${artifact.collection_no}</span>
                    <span><i class="fas fa-user"></i> ${artifact.donor || 'Unknown'}</span>
                </div>
                <p>${artifact.description ? artifact.description.substring(0, 100) + '...' : 'No description available'}</p>
                <div class="artifact-tags">
                    <span class="tag">${artifact.object_type || 'Unknown Type'}</span>
                    <span class="tag">${artifact.collection_date || 'Unknown Date'}</span>
                </div>
            </div>
        </div>
    `).join('');
}


function updateResultCount(count) {
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
        resultCount.textContent = count;
    }
}

async function viewArtifact(id) {
    try {
        const response = await fetch(`php/api.php?action=get_artifact_by_id&id=${id}`);
        const artifact = await response.json();

        if (artifact) {
            const modal = document.getElementById('artifactModal');
            const modalBody = document.getElementById('artifactModalBody');

            let imagesHtml = '';
            if (artifact.images && artifact.images.length > 0) {
                imagesHtml = artifact.images.map(image => `<img src="assets/images/${image}" alt="${artifact.object_head}" class="img-fluid mb-2">`).join('');
            }

            modalBody.innerHTML = `
                <h2>${artifact.object_head}</h2>
                <div class="row">
                    <div class="col-md-6">
                        ${imagesHtml}
                    </div>
                    <div class="col-md-6">
                        <p><strong>Collection No:</strong> ${artifact.collection_no}</p>
                        <p><strong>Accession No:</strong> ${artifact.accession_no}</p>
                        <p><strong>Collection Date:</strong> ${artifact.collection_date}</p>
                        <p><strong>Donor:</strong> ${artifact.donor}</p>
                        <p><strong>Object Type:</strong> ${artifact.object_type}</p>
                        <p><strong>Description:</strong> ${artifact.description}</p>
                        <p><strong>Measurement:</strong> ${artifact.measurement}</p>
                        <p><strong>Gallery No:</strong> ${artifact.gallery_no}</p>
                        <p><strong>Found Place:</strong> ${artifact.found_place}</p>
                        <p><strong>Significance/Comment:</strong> ${artifact.significance_comment}</p>
                    </div>
                </div>
            `;
            modal.style.display = 'block';
            addLog('View Artifact', `Visitor viewed artifact with ID ${id}`);
        }
    } catch (error) {
        console.error('Failed to load artifact details:', error);
    }
}

function closeArtifactModal() {
    const modal = document.getElementById('artifactModal');
    if (modal) {
        modal.style.display = 'none';
    }
}


// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close user dropdown when clicking outside
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !event.target.closest('.user-menu')) {
        userDropdown.classList.remove('active');
    }
};

// Handle form submissions
document.addEventListener('submit', function(e) {
    if (e.target.id === 'loginForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        loginUser(credentials);
    }

    if (e.target.id === 'registerForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: password
        };
        registerUser(userData);
    }
});

function addLog(action, details) {
    const userId = currentUser ? currentUser.id : null;
    fetch('php/admin_api.php?action=add_log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, action: action, details: details })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Failed to add log');
        }
    })
    .catch(error => {
        console.error('Error adding log:', error);
    });
}

// Hero Slideshow Functions
let heroSlideIndex = 0;
let heroSlideshowInterval;

function initializeHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-slide-indicators .hero-indicator');
    
    if (slides.length === 0) return;
    
    // Show first slide initially
    showHeroSlide(0);
    
    // Auto-advance slides every 5 seconds
    heroSlideshowInterval = setInterval(() => {
        changeHeroSlide(1);
    }, 5000);
    
    // Pause on hover
    const slideshow = document.querySelector('.hero-slideshow-container');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', () => clearInterval(heroSlideshowInterval));
        slideshow.addEventListener('mouseleave', () => {
            heroSlideshowInterval = setInterval(() => {
                changeHeroSlide(1);
            }, 5000);
        });
    }
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-slide-indicators .hero-indicator');
    
    if (slides.length === 0) return;
    
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    heroSlideIndex = index;
}

function changeHeroSlide(direction) {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    
    heroSlideIndex += direction;
    
    // Handle wraparound
    if (heroSlideIndex >= slides.length) {
        heroSlideIndex = 0;
    } else if (heroSlideIndex < 0) {
        heroSlideIndex = slides.length - 1;
    }
    
    showHeroSlide(heroSlideIndex);
    
    // Reset auto-advance timer
    clearInterval(heroSlideshowInterval);
    heroSlideshowInterval = setInterval(() => {
        changeHeroSlide(1);
    }, 5000);
}

function currentHeroSlide(slideNumber) {
    const targetIndex = slideNumber - 1; // Convert to 0-based index
    showHeroSlide(targetIndex);
    
    // Reset auto-advance timer
    clearInterval(heroSlideshowInterval);
    heroSlideshowInterval = setInterval(() => {
        changeHeroSlide(1);
    }, 5000);
}

// Featured Artifacts Slideshow Functions
let featuredSlideIndex = 0;
let featuredSlideshowInterval;

function initializeFeaturedSlideshow() {
    const slides = document.querySelectorAll('.featured-slide');
    const indicators = document.querySelectorAll('.slide-indicators .indicator');
    
    if (slides.length === 0) return;
    
    // Show first slide initially
    showFeaturedSlide(0);
    
    // Auto-advance slides every 6 seconds
    featuredSlideshowInterval = setInterval(() => {
        changeSlide(1);
    }, 6000);
    
    // Pause on hover
    const slideshow = document.querySelector('.featured-slideshow-container');
    if (slideshow) {
        slideshow.addEventListener('mouseenter', () => clearInterval(featuredSlideshowInterval));
        slideshow.addEventListener('mouseleave', () => {
            featuredSlideshowInterval = setInterval(() => {
                changeSlide(1);
            }, 6000);
        });
    }
}

function showFeaturedSlide(index) {
    const slides = document.querySelectorAll('.featured-slide');
    const indicators = document.querySelectorAll('.slide-indicators .indicator');
    
    if (slides.length === 0) return;
    
    // Remove active class from all slides and indicators
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Add active class to current slide and indicator
    slides[index].classList.add('active');
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
    
    featuredSlideIndex = index;
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.featured-slide');
    if (slides.length === 0) return;
    
    featuredSlideIndex += direction;
    
    // Handle wraparound
    if (featuredSlideIndex >= slides.length) {
        featuredSlideIndex = 0;
    } else if (featuredSlideIndex < 0) {
        featuredSlideIndex = slides.length - 1;
    }
    
    showFeaturedSlide(featuredSlideIndex);
    
    // Reset auto-advance timer
    clearInterval(featuredSlideshowInterval);
    featuredSlideshowInterval = setInterval(() => {
        changeSlide(1);
    }, 6000);
}

function currentSlide(slideNumber) {
    const targetIndex = slideNumber - 1; // Convert to 0-based index
    showFeaturedSlide(targetIndex);
    
    // Reset auto-advance timer
    clearInterval(featuredSlideshowInterval);
    featuredSlideshowInterval = setInterval(() => {
        changeSlide(1);
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