import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Listen to service status changes
async function initServiceStatus() {
    try {
        const servicesRef = collection(db, 'services');
        const snapshot = await getDocs(servicesRef);
        
        snapshot.forEach(doc => {
            updateServiceUI(doc.id, doc.data());
        });
        updateOverallStatus();
        
        // Update timestamp
        document.getElementById('last-check').textContent = new Date().toLocaleString();
    } catch (error) {
        console.error("Failed to load service status:", error);
    }
}

function updateServiceUI(serviceId, serviceData) {
    const element = document.querySelector(`[data-service="${serviceId}"] .status-badge`);
    if (element) {
        element.textContent = serviceData.status;
        element.className = `status-badge ${serviceData.status}`;
    }
}

function updateOverallStatus() {
    const systemStatus = document.querySelector('.status-indicator');
    const statusDot = systemStatus.querySelector('.status-dot');
    const statusText = systemStatus.querySelector('.status-text');
    
    const servicesWithIssues = document.querySelectorAll('.status-badge:not(.operational)').length;
    
    if (servicesWithIssues === 0) {
        systemStatus.className = 'status-indicator operational';
        statusDot.style.background = '#22c55e';
        statusText.textContent = 'All Systems Operational';
    } else {
        systemStatus.className = 'status-indicator degraded';
        statusDot.style.background = '#eab308';
        statusText.textContent = 'Partial System Issues';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initServiceStatus();
    // Refresh status every minute
    setInterval(initServiceStatus, 60000);
});
