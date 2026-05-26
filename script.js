document.addEventListener('DOMContentLoaded', () => {
    // Elements references mapping directly to HTML structures
    const splashScreen = document.getElementById('splash-screen');
    const appWrapper = document.getElementById('app-wrapper');
    const fileInput = document.getElementById('real-file-input-trigger');
    const documentRenderTarget = document.getElementById('document-render-target');

    // Filter pipeline trackers
    let selectedVertical = '';
    let selectedClass = '';
    let selectedSubject = '';

    // Endpoints routes   
    const UPLOAD_URL = 'https://gurukul-academy-theta.vercel.app/api/upload';
    const FETCH_URL = 'https://gurukul-academy-theta.vercel.app/api/fetch';

    // === SEQUENTIAL STEP 1: AUTO DISMISS SPLASH LOADER ===
    function stopSplashScreen() {
        if (splashScreen) {
            splashScreen.style.setProperty('display', 'none', 'important');
        }
        if (appWrapper) {
            appWrapper.style.setProperty('display', 'block', 'important');
        }
    }
    setTimeout(stopSplashScreen, 1000); // 1 Second transition hold

    // === SEQUENTIAL STEP 2: MULTI-MODULE WORKSPACE PAGE ENGINE ===
    window.showPage = function(pageId) {
        document.querySelectorAll('.page-view').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    };

    window.chooseResourceVertical = function(verticalType) {
        selectedVertical = verticalType;
        document.getElementById('crumb-vertical').innerText = verticalType;
        document.getElementById('crumb-path-vertical').innerText = verticalType;
        document.getElementById('final-crumb-vertical').innerText = verticalType;
        showPage('class-selection-page');
    };

    window.chooseClassStandard = function(classStandard) {
        selectedClass = classStandard;
        document.getElementById('crumb-path-class').innerText = `Class ${classStandard}`;
        document.getElementById('final-crumb-class').innerText = `Class ${classStandard}`;
        showPage('subject-selection-page');
    };

    window.chooseSubjectCourse = function(subjectName) {
        selectedSubject = subjectName;
        document.getElementById('final-crumb-subject').innerText = subjectName;
        
        const titleHeader = document.getElementById('workspace-dynamic-title');
        if (titleHeader) {
            titleHeader.innerText = `Class ${selectedClass} ${selectedSubject} — Core ${selectedVertical}`;
        }
        
        // Trigger Cloud Stream Sync whenever workspace window initializes
        loadExistingFilesFromCloud();
        showPage('resource-action-page');
    };

    // === SEQUENTIAL STEP 3: SYNC REAL DATA FROM MONGO DB REPOSITORY ===
    async function loadExistingFilesFromCloud() {
        if (!documentRenderTarget) return;
        
        documentRenderTarget.innerHTML = '<p style="color: #cbd5e1; font-weight: 500;">Syncing workspace stream pipeline with MongoDB Cloud...</p>';
        
        try {
            const response = await fetch(FETCH_URL);
            const result = await response.json(); // 👈 Response format updated
            
            documentRenderTarget.innerHTML = ''; // Wipe loading feedback text
            
            // ⚠️ Backend returns { success: true, data: [...] }
            if (result.success && result.data && result.data.length > 0) {
                result.data.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'resource-item';
                    
                    // ⚠️ Properties mapped to database schema (url and title/name)
                    const downloadPath = file.url || '#';
                    const displayTitle = file.title || file.name || 'Untitled Document';
                    const uploadDate = file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A';
                    
                    fileItem.innerHTML = `
                        <div class="resource-details">
                            <h5>${displayTitle}</h5>
                            <p>Status: <span style="color:#22c55e; font-weight:600;">Cloud Live</span> | Timeline: ${uploadDate}</p>
                        </div>
                        <a href="${downloadPath}" target="_blank" class="portal-btn" style="text-decoration: none; display: inline-block;">📥 Download PDF</a>
                    `;
                    documentRenderTarget.appendChild(fileItem);
                });
            } else {
                documentRenderTarget.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">No files found in this cloud vault query path.</p>';
            }
        } catch (error) {
            console.error("Database connection stream error:", error);
            documentRenderTarget.innerHTML = '<p style="color: #ef4444; font-weight: 500;">Failed to sync with Cloud Repository. Ensure Server is live.</p>';
        }
    }

    // === SEQUENTIAL STEP 4: TRIGGER REPOSITORY FILE TRANSMISSION UPLOAD ===
    async function executeLocalUploadSimulation(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Structured metadata title generator parameters string
        const fileCustomTitle = `${selectedVertical}_Class-${selectedClass}_${selectedSubject}_${file.name}`;
        
        const formData = new FormData();
        formData.append('file', file); // 👈 ⚠️ Fixed: Changed 'pdfFile' to 'file' to match backend upload.single('file')
        formData.append('title', fileCustomTitle);
        formData.append('subject', selectedSubject);
        formData.append('classLevel', selectedClass);

        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(`🎉 Success! Target node securely written to Cloudinary & MongoDB.\n\nAssigned Title:\n${fileCustomTitle}`);
                loadExistingFilesFromCloud(); // Automatic data refresh engine pipeline execution
                if (fileInput) fileInput.value = ''; // Clean input element state tracker
            } else {
                alert('❌ Transmission stream interrupted: ' + data.message);
            }
        } catch (error) {
            console.error('Transmission error trace:', error);
            alert('❌ Network pipe failure. Verify Express engine server state inside terminal logs.');
        }
    }
    
    // Global window pipeline exposure
    window.executeLocalUploadSimulation = executeLocalUploadSimulation;
});