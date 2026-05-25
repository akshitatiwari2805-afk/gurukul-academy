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
/    // Localhost hata kar exact IP address daal rahe hain network lock todne ke liye
    const UPLOAD_URL = 'http://127.0.0.1:5000/api/upload';
    const FETCH_URL = 'http://127.0.0.1:5000/api/fetch';
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
            const files = await response.json();
            
            documentRenderTarget.innerHTML = ''; // Wipe loading feedback text
            
            if (files && files.length > 0) {
                files.forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.className = 'resource-item';
                    
                    const downloadPath = file.filePath || '#';
                    
                    fileItem.innerHTML = `
                        <div class="resource-details">
                            <h5>${file.title}</h5>
                            <p>Status: <span style="color:#f26e22; font-weight:600;">Available Node</span> | Timeline: ${new Date(file.uploadedAt).toLocaleDateString()}</p>
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
    window.executeLocalUploadSimulation = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Structured metadata title generator parameters string
        const fileCustomTitle = `${selectedVertical}_Class-${selectedClass}_${selectedSubject}_${file.name}`;
        
        const formData = new FormData();
        formData.append('pdfFile', file);
        formData.append('title', fileCustomTitle);

        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                alert(`🎉 Success! Target node securely written to Cloud Database.\n\nAssigned Title:\n${fileCustomTitle}`);
                loadExistingFilesFromCloud(); // Automatic data refresh engine pipeline execution
                fileInput.value = ''; // Clean input element state tracker
            } else {
                alert('❌ Transmission stream interrupted: ' + data.message);
            }
        } catch (error) {
            console.error('Transmission error trace:', error);
            alert('❌ Network pipe failure. Verify Express engine server state inside terminal logs.');
        }
    };
});