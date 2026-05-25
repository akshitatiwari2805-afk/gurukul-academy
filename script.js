// App State variables - jo bache ki selections yaad rakhenge
let selectedVertical = 'Notes';
let selectedClass = '6th';
let selectedSubject = 'Science';

// Backend Server ka URL (Jo humne node server.js se chalu kiya hai)
const BACKEND_URL = "http://localhost:5000";

// STEP 1: Splash Loader Engine (2 seconds baad automatic desktop dikhayega)
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('splash-screen').style.opacity = '0';
        document.getElementById('splash-screen').style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app-wrapper').style.display = 'block';
        }, 500);
    }, 2000);
});

// STEP 2: Smooth Section Router Navigation
function showPage(pageId) {
    const views = document.querySelectorAll('.page-view');
    views.forEach(v => v.classList.remove('active'));
    
    const target = document.getElementById(pageId);
    if(target) {
        target.classList.add('active');
    }
}

// STEP 3: Handle Resource Vertical Selection (Notes vs Questions)
function chooseResourceVertical(type) {
    selectedVertical = type;
    document.getElementById('crumb-vertical').innerText = type;
    document.getElementById('crumb-path-vertical').innerText = type;
    document.getElementById('final-crumb-vertical').innerText = type;
    showPage('class-selection-page');
}

// STEP 4: Handle Class Selection (6th to 12th)
function chooseClassStandard(className) {
    selectedClass = className;
    document.getElementById('crumb-path-class').innerText = "Class " + className;
    document.getElementById('final-crumb-class').innerText = "Class " + className;
    showPage('subject-selection-page');
}

// STEP 5: Handle Subject Selection & Fetch Live Saved Files from Server
function chooseSubjectCourse(subjectName) {
    selectedSubject = subjectName;
    document.getElementById('final-crumb-subject').innerText = subjectName;
    document.getElementById('workspace-dynamic-title').innerText = `Class ${selectedClass} ${subjectName} — Core ${selectedVertical}`;
    
    // Final page display karo
    showPage('resource-action-page');
    
    // Backend server se fetch karo saari files jo saved hain
    fetchFilesFromServer();
}

/**
 * SERVER API CALL 1: Backend se saved files ki list lekar screen par dikhana (FIXED URL)
 */
function fetchFilesFromServer() {
    const targetBox = document.getElementById('document-render-target');
    targetBox.innerHTML = "<p style='color: #64748b;'>Loading files from server...</p>";

    fetch(`${BACKEND_URL}/api/files`)
        .then(response => response.json())
        .then(files => {
            targetBox.innerHTML = ""; // Loader text clear karein
            
            if(files.length === 0) {
                targetBox.innerHTML = "<p style='color: #64748b; padding: 10px;'>No files uploaded yet for this course.</p>";
                return;
            }

            // Loop lagakar har ek file ka real element render karein
            files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'resource-item';
                div.innerHTML = `
                    <div class="resource-details">
                        <h5>📄 ${file.name}</h5>
                        <p style="color: #2ecc71; font-weight: bold;">✓ Synced to Cloud Grid Workspace</p>
                    </div>
                    <a href="${BACKEND_URL}${file.url}" target="_blank" class="download-btn" style="text-decoration:none; padding: 8px 12px; background: #27ae60; color: white; border-radius: 4px; font-size: 14px;">⬇️ View / Download</a>
                `;
                targetBox.appendChild(div);
            });
        })
        .catch(error => {
            console.error("Error fetching files:", error);
            targetBox.innerHTML = "<p style='color: #e74c3c; padding: 10px;'>Backend server connected nahi hai!</p>";
        });
}

/**
 * SERVER API CALL 2: Real File Upload Logic via Multer Multi-part form
 */
function executeLocalUploadSimulation(e) {
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('pdfFile', file);

    fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert('Success: Item uploaded into dashboard container!');
            fetchFilesFromServer(); // Screen refresh karke naya card dikhao
        } else {
            alert('Upload failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        alert("Server error: Upload failed.");
    });
}