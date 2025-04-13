import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Use the exposed global instances from admin.js
const reportsContainer = document.getElementById('reports-container');
let currentType = 'bugs';

// Load reports of the selected type
async function loadReports(type) {
    if (!auth.currentUser) return;
    currentType = type;
    
    try {
        const reportsRef = collection(db, type);
        const reportsQuery = query(reportsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(reportsQuery);
        
        reportsContainer.innerHTML = '';
        
        snapshot.forEach(doc => {
            const report = doc.data();
            const card = createReportCard(doc.id, report, type);
            reportsContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Create HTML for a report card
function createReportCard(id, report, type) {
    const div = document.createElement('div');
    div.className = 'report-card';
    
    const status = report.status || 'new';
    const date = new Date(report.timestamp).toLocaleDateString();
    
    div.innerHTML = `
        <div class="report-header">
            <div>
                <h3>${type === 'bugs' ? report['bug-app'] : type === 'features' ? report['feature-app'] : report.type}</h3>
                <div class="report-meta">
                    From: ${report[`${type === 'bugs' ? 'bug' : type === 'features' ? 'feature' : type}-email`]} • ${date}
                </div>
            </div>
            <span class="report-status ${status}">${status}</span>
        </div>
        <div class="report-content">
            ${report.description || report['bug-description'] || report['feature-description'] || report['security-description'] || report['feedback-message']}
        </div>
        <div class="report-actions">
            <select class="status-select" data-id="${id}" data-type="${type}">
                <option value="new" ${status === 'new' ? 'selected' : ''}>New</option>
                <option value="in-progress" ${status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="resolved" ${status === 'resolved' ? 'selected' : ''}>Resolved</option>
                <option value="closed" ${status === 'closed' ? 'selected' : ''}>Closed</option>
            </select>
        </div>
    `;
    
    // Handle status changes
    div.querySelector('.status-select').addEventListener('change', async (e) => {
        const newStatus = e.target.value;
        const reportId = e.target.dataset.id;
        const reportType = e.target.dataset.type;
        
        try {
            await updateDoc(doc(db, reportType, reportId), {
                status: newStatus
            });
            
            div.querySelector('.report-status').className = `report-status ${newStatus}`;
            div.querySelector('.report-status').textContent = newStatus;
        } catch (error) {
            console.error('Error updating status:', error);
            e.target.value = status;
        }
    });
    
    return div;
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadReports('bugs');
        }
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            loadReports(btn.dataset.type);
        });
    });
});
