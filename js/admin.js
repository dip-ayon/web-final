// Function to handle switching between sections
const sectionButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.admin-section');

sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and sections
        sectionButtons.forEach(btn => btn.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        const sectionId = button.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');

        // Load data based on the section
        if (sectionId === 'artifacts') {
            loadArtifacts();
        } else if (sectionId === 'users') {
            loadUsers();
        } else if (sectionId === 'logs') {
            loadSystemLogs();
        } else if (sectionId === 'dashboard') {
            updateDashboardStats();
        } else if (sectionId === 'artifactGallery') { // New case for artifact gallery
            loadArtifactGallery();
        } else if (sectionId === 'reports') {
            loadReportsTable();
        }
    });
});

// Modal Handling (Open and Close Modals)
function openUploadModal() {
    document.getElementById('uploadModal').style.display = 'block';
}

function closeUploadModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

function openUserModal() {
    document.getElementById('userModal').style.display = 'block';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function openEditArtifactModal() {
    document.getElementById('editArtifactModal').style.display = 'block';
}

function closeEditArtifactModal() {
    document.getElementById('editArtifactModal').style.display = 'none';
}

function openEditUserModal() {
    document.getElementById('editUserModal').style.display = 'block';
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
}

function openGenericInfoModal(title, message) {
    alert(title + ': ' + message);
}

// Form Submission for Artifact Upload
if(document.getElementById('uploadForm')){
    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
    
        // Client-side validation for image count
        const imageInput = document.getElementById('artifactImages');
        if (imageInput.files.length > 5) {
            alert('Error: You can upload a maximum of 5 images.');
            return; // Stop the form submission
        }
    
        fetch('php/admin_api.php?action=addArtifact', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: Artifact uploaded successfully!');
                addLog('Artifact Added', `Artifact with collection number ${formData.get('collection_no')} was added.`);
                closeUploadModal();
                loadArtifacts();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error uploading artifact:', error);
            alert('Error: An error occurred while uploading the artifact.');
        });
    });
}


// Form Submission for Adding User
if(document.getElementById('userForm')){
    document.getElementById('userForm').addEventListener('submit', function(e) {
        e.preventDefault();
    
        const userData = new FormData(this);
    
        fetch('php/admin_api.php?action=addUser', {
            method: 'POST',
            body: userData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: User added successfully!');
                addLog('User Added', `User with email ${userData.get('email')} was added.`);
                closeUserModal();
                loadUsers();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error adding user:', error);
            alert('Error: An error occurred while adding the user.');
        });
    });
}


// Form Submission for Editing Artifact
if(document.getElementById('editArtifactForm')){
    document.getElementById('editArtifactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
    
        fetch('php/admin_api.php?action=updateArtifact', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: Artifact updated successfully!');
                addLog('Artifact Updated', `Artifact with ID ${formData.get('id')} was updated.`);
                closeEditArtifactModal();
                loadArtifacts();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating artifact:', error);
            alert('Error: An error occurred while updating the artifact.');
        });
    });
}


// Form Submission for Editing User
if(document.getElementById('editUserForm')){
    document.getElementById('editUserForm').addEventListener('submit', function(e) {
        e.preventDefault();
    
        const userData = new FormData(this);
    
        fetch('php/admin_api.php?action=updateUser', {
            method: 'POST',
            body: userData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: User updated successfully!');
                addLog('User Updated', `User with ID ${userData.get('id')} was updated.`);
                closeEditUserModal();
                loadUsers();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Error: An error occurred while updating the user.');
        });
    });
}


// Helper function to fetch artifacts
function fetchArtifacts(searchQuery, typeFilter, dateFilter) {
    let url = 'php/admin_api.php?action=getArtifacts';
    const params = new URLSearchParams();

    if (searchQuery) {
        params.append('search_query', searchQuery);
    }
    if (typeFilter) {
        params.append('type_filter', typeFilter);
    }
    if (dateFilter) {
        params.append('date_filter', dateFilter);
    }

    if (params.toString()) {
        url += '&' + params.toString();
    }

    return fetch(url).then(response => response.json());
}

// Load Artifacts and Populate Table
function loadArtifacts() {
    const searchQuery = document.getElementById('artifactSearch').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    fetchArtifacts(searchQuery, typeFilter, dateFilter)
    .then(data => {
        const tableBody = document.getElementById('artifactsTable');
        tableBody.innerHTML = ''; // Clear existing rows

        data.forEach(artifact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${artifact.collection_no}</td>
                <td>${artifact.accession_no}</td>
                <td>${artifact.collection_date}</td>
                <td>${artifact.donor}</td>
                <td>${artifact.description}</td>
                <td>${artifact.object_type}</td>
                <td>${artifact.object_head}</td>
                <td>
                    <button class="btn btn-outline" onclick="editArtifact(${artifact.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteArtifact(${artifact.id})">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading artifacts:', error);
        alert('Error: An error occurred while loading artifacts.');
    });
}

// Load Users and Populate Table
function loadUsers() {
    fetch('php/admin_api.php?action=getUsers')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.getElementById('usersTable');
        tableBody.innerHTML = ''; // Clear existing rows

        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role === 'admin' ? 'Administrator' : 'User'}</td>
                <td><span class="status-active">Active</span></td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-outline" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading users:', error);
        alert('Error: An error occurred while loading users.');
    });
}

// Example for editing an artifact
function editArtifact(id) {
    fetch(`php/admin_api.php?action=getArtifact&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            alert('Error: ' + data.error);
            return;
        }
        document.getElementById('editArtifactId').value = data.id;
        document.getElementById('editCollectionNumber').value = data.collection_no;
        document.getElementById('editAccessionNumber').value = data.accession_no;
        document.getElementById('editCollectionDate').value = data.collection_date;
        document.getElementById('editContributorName').value = data.donor;
        document.getElementById('editObjectType').value = data.object_type;
        document.getElementById('editObjectHead').value = data.object_head;
        document.getElementById('editDescription').value = data.description;
        document.getElementById('editMeasurement').value = data.measurement;
        document.getElementById('editGalleryNumber').value = data.gallery_no;
        document.getElementById('editFoundPlace').value = data.found_place;
        document.getElementById('editExperimentFormula').value = data.experiment_formula;
        document.getElementById('editSignificance').value = data.significance_comment;
        document.getElementById('editCorrection').value = data.correction;
        openEditArtifactModal();
    })
    .catch(error => {
        console.error('Error fetching artifact data:', error);
        alert('Error: An error occurred while fetching artifact data.');
    });
}

// Example for editing a user
function editUser(id) {
    fetch(`php/admin_api.php?action=getUser&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            alert('Error: ' + data.error);
            return;
        }
        document.getElementById('editUserId').value = data.id;
        document.getElementById('editUserName').value = data.name;
        document.getElementById('editUserEmail').value = data.email;
        document.getElementById('editUserRole').value = data.role;
        openEditUserModal();
    })
    .catch(error => {
        console.error('Error fetching user data:', error);
        alert('Error: An error occurred while fetching user data.');
    });
}

// Delete Artifact
function deleteArtifact(id) {
    if (confirm('Are you sure you want to delete this artifact?')) {
        const formData = new FormData();
        formData.append('id', id);

        fetch('php/admin_api.php?action=deleteArtifact', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: Artifact deleted successfully!');
                addLog('Artifact Deleted', `Artifact with ID ${id} was deleted.`);
                loadArtifacts();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting artifact:', error);
            alert('Error: An error occurred while deleting the artifact.');
        });
    }
}

// Delete User
function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        const formData = new FormData();
        formData.append('id', id);

        fetch('php/admin_api.php?action=deleteUser', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) {
                alert('Success: User deleted successfully!');
                addLog('User Deleted', `User with ID ${id} was deleted.`);
                loadUsers();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Error: An error occurred while deleting the user.');
        });
    }
}

// Load Reports Table
function loadReportsTable() {
    const searchQuery = document.getElementById('reportSearch').value;

    fetchArtifacts(searchQuery, '', '')
    .then(data => {
        const table = document.getElementById('reportsTable');
        const tableBody = table.getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear existing rows

        // Column visibility
        const columns = {};
        document.querySelectorAll('#reportsTable thead input[type="checkbox"]').forEach(checkbox => {
            if(checkbox.dataset.column) {
                columns[checkbox.dataset.column] = checkbox.checked;
            }
        });

        // Sorting
        const sortButtons = document.querySelectorAll('#reportsTable .sort-btn');
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortKey = button.dataset.sort;
                const sortOrder = button.dataset.order || 'asc';
                data.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) {
                        return sortOrder === 'asc' ? -1 : 1;
                    }
                    if (a[sortKey] > b[sortKey]) {
                        return sortOrder === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
                button.dataset.order = sortOrder === 'asc' ? 'desc' : 'asc';
                loadReportsTable();
            });
        });


        data.forEach(artifact => {
            const row = document.createElement('tr');

            let rowHTML = '';
            if (columns.collection_no) rowHTML += `<td>${artifact.collection_no}</td>`;
            if (columns.accession_no) rowHTML += `<td>${artifact.accession_no}</td>`;
            if (columns.object_head) rowHTML += `<td>${artifact.object_head}</td>`;
            if (columns.object_type) rowHTML += `<td>${artifact.object_type}</td>`;
            if (columns.donor) rowHTML += `<td>${artifact.donor}</td>`;
            if (columns.collection_date) rowHTML += `<td>${artifact.collection_date}</td>`;
            if (columns.description) rowHTML += `<td>${artifact.description}</td>`;
            row.innerHTML = rowHTML;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading reports table:', error);
        alert('Error: An error occurred while loading the reports table.');
    });
}

// Print Report
function printReport() {
    const table = document.getElementById('reportsTable');
    const selectedColumns = [];
    table.querySelectorAll('thead input[type="checkbox"]:checked').forEach(checkbox => {
        if(checkbox.dataset.column) {
            selectedColumns.push(checkbox.dataset.column);
        }
    });

    const tableToPrint = table.cloneNode(true);

    // Handle header row: remove checkboxes but keep text content
    const headerRow = tableToPrint.querySelector('thead tr');
    if (headerRow) {
        for (let j = headerRow.cells.length - 1; j >= 0; j--) {
            const cell = headerRow.cells[j];
            const checkbox = cell.querySelector('input[type="checkbox"]');
            if (checkbox) {
                // Remove the checkbox, but keep the text content (column title)
                checkbox.remove();
            }
        }
    }

    // Handle body rows: remove cells for unselected columns and any remaining checkboxes
    const bodyRows = tableToPrint.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
        for (let j = row.cells.length - 1; j >= 0; j--) {
            const cell = row.cells[j];
            const checkbox = cell.querySelector('input[type="checkbox"]');
            // If it's a checkbox column and not selected, or if it's the row selector checkbox
            if ((checkbox && checkbox.dataset.column && !selectedColumns.includes(checkbox.dataset.column)) || (checkbox && !checkbox.dataset.column)) {
                row.deleteCell(j);
            } else if (checkbox) { // If it's a selected checkbox column, just remove the checkbox element
                checkbox.remove();
            }
        }
    });

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Report</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/admin.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(tableToPrint.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Download Report as Excel
function downloadReportAsExcel() {
    const table = document.getElementById('reportsTable');
    const selectedColumns = [];
    table.querySelectorAll('thead input[type="checkbox"]:checked').forEach(checkbox => {
        if(checkbox.dataset.column) {
            selectedColumns.push(checkbox.dataset.column);
        }
    });

    let csv = [];
    const rows = table.rows;
    for (let i = 0; i < rows.length; i++) {
        let row = [];
        const cells = rows[i].cells;
        for (let j = 0; j < cells.length; j++) {
            const checkbox = cells[j].querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.dataset.column && checkbox.checked) {
                row.push(cells[j].innerText);
            } else if (!checkbox) {
                row.push(cells[j].innerText);
            }
        }
        csv.push(row.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link);
    link.click();
}

// Artifact Gallery Functions
let currentImages = [];
let currentImageIndex = 0;
let currentZoomLevel = 1;

function loadArtifactGallery() {
    const searchQuery = document.getElementById('galleryArtifactSearch').value;
    const typeFilter = document.getElementById('galleryTypeFilter').value;
    const dateFilter = document.getElementById('galleryDateFilter').value;

    fetchArtifacts(searchQuery, typeFilter, dateFilter)
    .then(data => {
        const cardsContainer = document.getElementById('artifactCardsContainer');
        cardsContainer.innerHTML = ''; // Clear existing cards

        if (data.length === 0) {
            cardsContainer.innerHTML = '<p>No artifacts found.</p>';
            return;
        }

        data.forEach(artifact => {
            const card = document.createElement('div');
            card.classList.add('artifact-card');
            
            const imageUrl = artifact.images ? `assets/images/${artifact.images.split(',')[0]}` : 'assets/images/placeholder.jpg'; // Use first image or placeholder

            card.innerHTML = `
                <img src="${imageUrl}" alt="${artifact.object_head}">
                <div class="artifact-card-content">
                    <h3>${artifact.object_head}</h3>
                    <p><strong>Collection No.:</strong> ${artifact.collection_no}</p>
                    <p><strong>Type:</strong> ${artifact.object_type}</p>
                    <p><strong>Donor:</strong> ${artifact.donor}</p>
                    <div class="artifact-card-actions">
                        <button class="btn btn-primary" onclick="openArtifactDetailsModal(${artifact.id})">
                            View More
                        </button>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    })
    .catch(error => {
        console.error('Error loading artifact gallery:', error);
        alert('Error: An error occurred while loading the artifact gallery.');
    });
}

function openArtifactDetailsModal(id) {
    fetch(`php/admin_api.php?action=getArtifact&id=${id}`)
    .then(response => response.json())
    .then(data => {
        if(data.error) {
            alert('Error: ' + data.error);
            return;
        }
        document.getElementById('detailObjectHead').textContent = data.object_head;
        document.getElementById('detailCollectionNo').textContent = data.collection_no;
        document.getElementById('detailAccessionNo').textContent = data.accession_no;
        document.getElementById('detailObjectType').textContent = data.object_type;
        document.getElementById('detailDonor').textContent = data.donor;
        document.getElementById('detailCollectionDate').textContent = data.collection_date;
        document.getElementById('detailMeasurement').textContent = data.measurement;
        document.getElementById('detailGalleryNo').textContent = data.gallery_no;
        document.getElementById('detailFoundPlace').textContent = data.found_place;
        document.getElementById('detailExperimentFormula').textContent = data.experiment_formula;
        document.getElementById('detailSignificanceComment').textContent = data.significance_comment;
        document.getElementById('detailCorrection').textContent = data.correction;
        document.getElementById('detailDescription').textContent = data.description;

        currentImages = data.images ? data.images.split(',') : [];
        currentImageIndex = 0;
        currentZoomLevel = 1;
        updateImageViewer();

        document.getElementById('artifactDetailsModal').style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching artifact details:', error);
        alert('Error: An error occurred while fetching artifact details.');
    });
}

function closeArtifactDetailsModal() {
    document.getElementById('artifactDetailsModal').style.display = 'none';
}

function updateImageViewer() {
    const detailImage = document.getElementById('detailImage');
    if (currentImages.length > 0) {
        detailImage.src = `assets/images/${currentImages[currentImageIndex]}`;
        detailImage.style.transform = `scale(${currentZoomLevel})`;
    } else {
        detailImage.src = 'assets/images/placeholder.jpg';
        detailImage.style.transform = `scale(1)`;
    }
}

// Load System Logs and Populate Table
function loadSystemLogs(page = 1) {
    const tableBody = document.getElementById('logsTableBody');
    const logActionFilter = document.getElementById('logActionFilter').value;
    if (!tableBody) {
        console.error('logsTableBody not found');
        return;
    }

    fetch(`php/admin_api.php?action=getSystemLogs&page=${page}&filter=${logActionFilter}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        tableBody.innerHTML = ''; // Clear existing rows

        data.logs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${log.created_at}</td>
                <td>${log.user_name || 'N/A'}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;
            tableBody.appendChild(row);
        });

        renderLogsPagination(data.totalPages, page);
    })
    .catch(error => {
        console.error('Error loading system logs:', error);
        tableBody.innerHTML = `<tr><td colspan="4">Error loading system logs: ${error.message}</td></tr>`;
    });
}

function renderLogsPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('logsPagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.innerText = i;
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            loadSystemLogs(i);
        });
        paginationContainer.appendChild(pageLink);
    }
}

function addLog(action, details) {
    const userId = 1; // Replace with actual user ID from session or auth
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

// Update Dashboard Statistics
function updateDashboardStats() {
    fetch('php/admin_api.php?action=getDashboardStats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalViews').textContent = data.stats.total_views;
                document.getElementById('recentUploads').textContent = data.stats.total_photos;
            } else {
                console.error('Error fetching dashboard stats:', data.message);
            }
        })
        .catch(error => console.error('Error fetching dashboard stats:', error));

    // Fetch total artifacts
    fetch('php/admin_api.php?action=getArtifacts')
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalArtifacts').textContent = data.length;
    })
    .catch(error => console.error('Error fetching total artifacts:', error));

    // Fetch total users
    fetch('php/admin_api.php?action=getUsers')
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalUsers').textContent = data.length;
    })
    .catch(error => console.error('Error fetching total users:', error));

    // Fetch recent activity (system logs)
    fetch('php/admin_api.php?action=getSystemLogs')
    .then(response => response.json())
    .then(data => {
        const recentActivityDiv = document.getElementById('recentActivity');
        recentActivityDiv.innerHTML = '';
        // Display up to 5 recent activities
        data.logs.slice(0, 5).forEach(log => {
            const activityItem = document.createElement('div');
            activityItem.classList.add('activity-item');
            activityItem.innerHTML = `
                <span class="activity-time">${new Date(log.created_at).toLocaleString()}</span>
                <span class="activity-description">${log.details}</span>
            `;
            recentActivityDiv.appendChild(activityItem);
        });
    })
    .catch(error => console.error('Error fetching recent activity:', error));
}

// Initial data load when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const adminName = localStorage.getItem('adminName');
    const adminEmail = localStorage.getItem('adminEmail');

    if (adminName && adminEmail) {
        document.getElementById('adminName').textContent = adminName;
        document.getElementById('adminEmail').textContent = adminEmail;
    }

    if(document.getElementById('logActionFilter')){
        document.getElementById('logActionFilter').addEventListener('change', () => loadSystemLogs());
    }

    if(window.location.pathname.includes("admin.html")){
        updateDashboardStats();
        loadUsers();
        loadSystemLogs();
    
        // Event Listeners for Artifact Search
        document.getElementById('artifactSearch').addEventListener('keyup', loadArtifacts);
        document.querySelector('#artifacts .search-btn').addEventListener('click', loadArtifacts);
        document.getElementById('typeFilter').addEventListener('change', loadArtifacts);
        document.getElementById('dateFilter').addEventListener('change', loadArtifacts);
    
        // Event Listeners for Reports Tab
        document.getElementById('reportSearch').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                loadReportsTable();
            }
        });
    
        document.querySelector('#reports .search-btn').addEventListener('click', function() {
            loadReportsTable();
        });
    
        document.querySelectorAll('#reportsTable thead input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                loadReportsTable();
            });
        });
    
        document.getElementById('prevImage').addEventListener('click', () => {
            if (currentImages.length > 1) {
                currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
                updateImageViewer();
            }
        });
    
        document.getElementById('nextImage').addEventListener('click', () => {
            if (currentImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % currentImages.length;
                updateImageViewer();
            }
        });
    
        document.getElementById('zoomIn').addEventListener('click', () => {
            currentZoomLevel = Math.min(currentZoomLevel + 0.1, 3); // Max zoom 3x
            updateImageViewer();
        });
    
        document.getElementById('zoomOut').addEventListener('click', () => {
            currentZoomLevel = Math.max(currentZoomLevel - 0.1, 0.5); // Min zoom 0.5x
            updateImageViewer();
        });
    
        // Event Listeners for Artifact Gallery Filters and Search
        document.getElementById('galleryArtifactSearch').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                loadArtifactGallery();
            }
        });
    
        document.querySelector('#artifactGallery .search-btn').addEventListener('click', function() {
            loadArtifactGallery();
        });
    
        document.getElementById('galleryTypeFilter').addEventListener('change', loadArtifactGallery);
        document.getElementById('galleryDateFilter').addEventListener('change', loadArtifactGallery);
    }
});

// Logout function
function logout() {
    fetch('php/admin_api.php?action=logout', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'index.html'; // Redirect to login page
        } else {
            alert('Error: ' + (data.message || 'Failed to logout.'));
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
        alert('Error: An error occurred during logout.');
    });
}
