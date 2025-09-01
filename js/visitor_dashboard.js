// js/visitor_dashboard.js

let currentModalImageIndex = 0;
let currentModalImageZoom = 1;
let modalImages = [];

let currentPage = 1;
const artifactsPerPage = 10; // Number of artifacts to display per page

document.addEventListener('DOMContentLoaded', () => {
    console.log('visitor_dashboard.js loaded and DOMContentLoaded fired.');

    const artifactGalleryTab = document.getElementById('artifact-gallery-tab');
    const profileSettingsTab = document.getElementById('profile-settings-tab');
    const logoutButton = document.getElementById('logout-button');

    const artifactGallerySection = document.getElementById('artifact-gallery');
    const profileSettingsSection = document.getElementById('profile-settings');

    // Search elements
    const artifactSearchType = document.getElementById('artifactSearchType');
    const artifactSearchValue = document.getElementById('artifactSearchValue');
    const searchArtifactsBtn = document.getElementById('searchArtifactsBtn');

    // Modal elements
    const artifactModal = document.getElementById('artifactModal');
    const artifactModalBody = document.getElementById('artifactModalBody');
    const closeBtn = artifactModal ? artifactModal.querySelector('.close-btn') : null;

    // Pagination element
    const paginationContainer = document.getElementById('pagination-container');

    // Profile Settings Form
    const profileSettingsForm = document.getElementById('profileSettingsForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    // Function to show a specific tab
    const showTab = (tabToShow, activeTabLink) => {
        console.log('Showing tab:', tabToShow.id);
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        // Deactivate all tab links
        document.querySelectorAll('.main-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show the selected tab content
        tabToShow.classList.add('active');

        // Activate the corresponding tab link
        if (activeTabLink) {
            activeTabLink.classList.add('active');
        }
    };

    // Event Listeners for tab clicks
    if (artifactGalleryTab) {
        artifactGalleryTab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Artifact Gallery tab clicked.');
            currentPage = 1; // Reset to first page on tab switch
            showTab(artifactGallerySection, artifactGalleryTab);
            loadArtifacts(); // Load artifacts when this tab is active
        });
    }

    if (profileSettingsTab) {
        profileSettingsTab.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Profile Settings tab clicked.');
            showTab(profileSettingsSection, profileSettingsTab);
            loadUserProfile();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Logout button clicked.');
            // In a real application, you would clear session/local storage and redirect to login page
            addLog('User Logout', 'Visitor logged out');
            alert('Logging out...');
            window.location.href = 'index.html'; // Redirect to home/login page
        });
    }

    // Event Listeners for search
    if (searchArtifactsBtn) {
        searchArtifactsBtn.addEventListener('click', () => {
            performArtifactSearch();
        });
    }

    if (artifactSearchValue) {
        artifactSearchValue.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performArtifactSearch();
            }
        });
    }

    const performArtifactSearch = () => {
        currentPage = 1; // Reset to first page on new search
        const type = artifactSearchType.value;
        const value = artifactSearchValue.value.trim();
        addLog('Search Artifacts', `Visitor searched for "${value}" in category "${type}"`);
        loadArtifacts(type, value);
    };

    // Function to load and filter artifacts
    const loadArtifacts = async (searchType = null, searchValue = null) => {
        const artifactGrid = document.querySelector('.artifacts-grid');
        if (!artifactGrid) {
            console.error('Artifact grid not found.');
            return;
        }
        artifactGrid.innerHTML = '<p>Loading artifacts...</p>'; // Placeholder

        let url = `php/api.php?action=search_artifacts&page=${currentPage}&limit=${artifactsPerPage}`;
        if (searchType && searchValue) {
            // Map frontend search types to backend database column names
            let backendSearchType;
            switch (searchType) {
                case 'name':
                    backendSearchType = 'object_head';
                    break;
                case 'category':
                    backendSearchType = 'object_type';
                    break;
                case 'date':
                    backendSearchType = 'collection_date';
                    break;
                case 'description':
                    backendSearchType = 'description';
                    break;
                default:
                    backendSearchType = searchType; // Fallback, though should be mapped
            }
            url += `&type=${backendSearchType}&value=${encodeURIComponent(searchValue)}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            const artifacts = data.artifacts;
            const totalArtifacts = data.total_artifacts;

            artifactGrid.innerHTML = ''; // Clear placeholder
            if (artifacts.length === 0) {
                artifactGrid.innerHTML = '<p>No artifacts found matching your search criteria.</p>';
            } else {
                artifacts.forEach(artifact => {
                    const artifactCard = document.createElement('div');
                    artifactCard.classList.add('artifact-card');
                    // Assuming artifact.images is an array and the first image is used
                    const imageUrl = artifact.images && artifact.images.length > 0 ? `assets/images/${artifact.images[0]}` : 'assets/images/placeholder.jpg'; // Use a placeholder if no image
                    const shortDescription = artifact.description ? artifact.description.substring(0, 100) + '...' : 'No description available.';

                    artifactCard.innerHTML = `
                        <div class="artifact-img">
                            <img src="${imageUrl}" alt="${artifact.object_head || 'Artifact'}">
                        </div>
                        <div class="artifact-info">
                            <h3>${artifact.object_head || 'Unnamed Artifact'}</h3>
                            <p class="artifact-meta">${artifact.object_type || 'Unknown Type'} | ${artifact.collection_date || 'Unknown Date'}</p>
                            <p>${shortDescription}</p>
                            <button class="btn btn-primary btn-sm view-info-btn" data-id="${artifact.id}">
                                <i class="fas fa-info-circle"></i> View Info
                            </button>
                        </div>
                    `;
                    artifactGrid.appendChild(artifactCard);
                });

                // Attach event listeners to newly created buttons
                document.querySelectorAll('.view-info-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const artifactId = e.currentTarget.dataset.id;
                        viewArtifact(artifactId);
                    });
                });
            }
            renderPagination(totalArtifacts, currentPage, artifactsPerPage, searchType, searchValue);
        } catch (error) {
            console.error('Error loading artifacts:', error);
            artifactGrid.innerHTML = '<p>Failed to load artifacts. Please try again later.</p>';
        }
    };

    // Function to render pagination controls
    const renderPagination = (totalArtifacts, currentPage, artifactsPerPage, searchType, searchValue) => {
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalArtifacts / artifactsPerPage);
        paginationContainer.innerHTML = ''; // Clear previous pagination

        if (totalPages <= 1) return; // No pagination needed for 1 or less pages

        const ul = document.createElement('ul');
        ul.classList.add('pagination');

        // Previous button
        const prevLi = document.createElement('li');
        const prevLink = document.createElement('a');
        prevLink.href = '#';
        prevLink.textContent = 'Previous';
        prevLink.classList.add('page-link');
        if (currentPage === 1) {
            prevLi.classList.add('disabled');
        } else {
            prevLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage--;
                loadArtifacts(searchType, searchValue);
            });
        }
        prevLi.appendChild(prevLink);
        ul.appendChild(prevLi);

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = i;
            link.classList.add('page-link');
            if (i === currentPage) {
                li.classList.add('active');
            }
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                loadArtifacts(searchType, searchValue);
            });
            li.appendChild(link);
            ul.appendChild(li);
        }

        // Next button
        const nextLi = document.createElement('li');
        const nextLink = document.createElement('a');
        nextLink.href = '#';
        nextLink.textContent = 'Next';
        nextLink.classList.add('page-link');
        if (currentPage === totalPages) {
            nextLi.classList.add('disabled');
        } else {
            nextLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage++;
                loadArtifacts(searchType, searchValue);
            });
        }
        nextLi.appendChild(nextLink);
        ul.appendChild(nextLi);

        paginationContainer.appendChild(ul);
    };

    // Function to view single artifact details in a modal
    window.viewArtifact = async (id) => {
        console.log('Viewing artifact with ID:', id);
        addLog('View Artifact', `Visitor viewed artifact with ID ${id}`);
        if (!artifactModal || !artifactModalBody) return;

        artifactModalBody.innerHTML = '<p>Loading artifact details...</p>';
        openArtifactModal();

        try {
            const response = await fetch(`php/api.php?action=get_artifact_by_id&id=${id}`);
            const artifact = await response.json();

            if (artifact.error) {
                artifactModalBody.innerHTML = `<p>${artifact.error}</p>`;
                return;
            }

            modalImages = artifact.images || [];
            currentModalImageIndex = 0;
            currentModalImageZoom = 1;

            const renderModalContent = () => {
                const currentImageSrc = modalImages.length > 0 ? `assets/images/${modalImages[currentModalImageIndex]}` : 'assets/images/placeholder.jpg';

                artifactModalBody.innerHTML = `
                    <div class="artifact-details-content">
                        <div class="image-viewer">
                            <img id="modal-image" src="${currentImageSrc}" alt="${artifact.object_head || 'Artifact'}" style="transform: scale(${currentModalImageZoom});">
                            ${modalImages.length > 1 ? `
                                <button class="nav-arrow left" id="prev-modal-image"><i class="fas fa-chevron-left"></i></button>
                                <button class="nav-arrow right" id="next-modal-image"><i class="fas fa-chevron-right"></i></button>
                            ` : ''}
                            <div class="zoom-controls">
                                <button id="zoom-out-modal"><i class="fas fa-search-minus"></i></button>
                                <button id="zoom-in-modal"><i class="fas fa-search-plus"></i></button>
                            </div>
                        </div>
                        <div class="details-text">
                            <h2>${artifact.object_head || 'Unnamed Artifact'}</h2>
                            <p><strong>Collection No:</strong> ${artifact.collection_no || 'N/A'}</p>
                            <p><strong>Accession No:</strong> ${artifact.accession_no || 'N/A'}</p>
                            <p><strong>Collection Date:</strong> ${artifact.collection_date || 'N/A'}</p>
                            <p><strong>Donor:</strong> ${artifact.donor || 'N/A'}</p>
                            <p><strong>Object Type:</strong> ${artifact.object_type || 'N/A'}</p>
                            <p><strong>Description:</strong> ${artifact.description || 'No description available.'}</p>
                            <p><strong>Measurement:</strong> ${artifact.measurement || 'N/A'}</p>
                            <p><strong>Gallery No:</strong> ${artifact.gallery_no || 'N/A'}</p>
                            <p><strong>Found Place:</strong> ${artifact.found_place || 'N/A'}</p>
                            <p><strong>Significance/Comment:</strong> ${artifact.significance_comment || 'N/A'}</p>
                        </div>
                    </div>
                `;

                // Attach event listeners for navigation and zoom after content is rendered
                if (modalImages.length > 1) {
                    document.getElementById('prev-modal-image').addEventListener('click', () => {
                        currentModalImageIndex = (currentModalImageIndex - 1 + modalImages.length) % modalImages.length;
                        renderModalContent();
                    });
                    document.getElementById('next-modal-image').addEventListener('click', () => {
                        currentModalImageIndex = (currentModalImageIndex + 1) % modalImages.length;
                        renderModalContent();
                    });
                }

                document.getElementById('zoom-in-modal').addEventListener('click', () => {
                    currentModalImageZoom = Math.min(currentModalImageZoom + 0.1, 3); // Max zoom 3x
                    document.getElementById('modal-image').style.transform = `scale(${currentModalImageZoom})`;
                });

                document.getElementById('zoom-out-modal').addEventListener('click', () => {
                    currentModalImageZoom = Math.max(currentModalImageZoom - 0.1, 0.5); // Min zoom 0.5x
                    document.getElementById('modal-image').style.transform = `scale(${currentModalImageZoom})`;
                });
            };

            renderModalContent();

        } catch (error) {
            console.error('Failed to load artifact details:', error);
            artifactModalBody.innerHTML = '<p>Failed to load artifact details. Please try again.</p>';
        }
    };

    // Modal functions
    const openArtifactModal = () => {
        if (artifactModal) {
            artifactModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }
    };

    window.closeArtifactModal = () => {
        if (artifactModal) {
            artifactModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
            // Reset zoom and image index when closing modal
            currentModalImageZoom = 1;
            currentModalImageIndex = 0;
            modalImages = [];
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeArtifactModal);
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === artifactModal) {
            closeArtifactModal();
        }
    };

    // Load user profile
    function loadUserProfile() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
        }
    }

    // Handle profile settings form submission
    if (profileSettingsForm) {
        profileSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            const updatedUser = {
                id: user.id,
                name: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value
            };

            try {
                const response = await fetch('php/admin_api.php?action=updateVisitorProfile', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedUser)
                });
                const data = await response.json();
                if (data.success) {
                    alert('Profile updated successfully');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('adminName', data.user.name);
                } else {
                    alert('Error updating profile: ' + data.message);
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                alert('An error occurred while updating your profile.');
            }
        });
    }

    // Handle change password form submission
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (newPassword !== confirmPassword) {
                alert('New passwords do not match.');
                return;
            }

            try {
                const response = await fetch('php/admin_api.php?action=changeVisitorPassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        id: user.id,
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })
                });
                const data = await response.json();
                if (data.success) {
                    alert('Password changed successfully');
                    changePasswordForm.reset();
                } else {
                    alert('Error changing password: ' + data.message);
                }
            } catch (error) {
                console.error('Error changing password:', error);
                alert('An error occurred while changing your password.');
            }
        });
    }

    // Initial load: show artifact gallery and load artifacts
    // Ensure elements exist before trying to show them
    if (artifactGallerySection && artifactGalleryTab) {
        showTab(artifactGallerySection, artifactGalleryTab);
        loadArtifacts();
    } else {
        console.error('Initial tab elements not found.');
    }
});

function addLog(action, details) {
    const userId = null; // Visitor is not logged in, so user_id is null
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

let slideIndex = 0;
showSlides();

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides() {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  if (slides.length === 0) return;
  if (slideIndex >= slides.length) {slideIndex = 0}
  if (slideIndex < 0) {slideIndex = slides.length - 1}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex].style.display = "block";
  slideIndex++;
  setTimeout(showSlides, 2000); // Change image every 2 seconds
}

window.plusSlides = plusSlides;
