import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { CategoryManager } from './categories.js';

const firebaseConfig = {
    apiKey: "AIzaSyDy0AE6ew6K3DEqjkZhM4CRpbt2bD-0t5I",
    authDomain: "novasuite1a.firebaseapp.com",
    projectId: "novasuite1a",
    storageBucket: "novasuitestorage.app",
    messagingSenderId: "372384559285",
    appId: "1:372384559285:web:56252eb9dd86b624a44efc",
    measurementId: "G-DJF2XCV0Q8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Expose Firebase instances globally
window.auth = auth;
window.db = db;

function initAdminPanel() {
    const loginContainer = document.getElementById('login-container');
    const adminContent = document.getElementById('admin-content');
    const googleSignInBtn = document.getElementById('google-signin');
    const logoutBtn = document.getElementById('logout');
    const addServiceBtn = document.getElementById('add-service');
    
    const categoryManager = new CategoryManager();

    // Auth state observer
    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.classList.add('hidden');
            adminContent.classList.remove('hidden');
            initDashboard();
            loadServices(categoryManager); // Pass categoryManager to loadServices
        } else {
            loginContainer.classList.remove('hidden');
            adminContent.classList.add('hidden');
        }
    });

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!item.dataset.section) return;
            e.preventDefault();
            
            document.querySelector('.nav-item.active')?.classList.remove('active');
            item.classList.add('active');
            
            document.querySelector('.content-section.active')?.classList.remove('active');
            document.getElementById(item.dataset.section)?.classList.add('active');
        });
    });

    // Auth buttons
    googleSignInBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(error => {
            console.error('Login failed:', error);
            alert('Login failed');
        });
    });

    logoutBtn.addEventListener('click', () => signOut(auth));

    // Service management
    addServiceBtn.addEventListener('click', () => {
        const serviceName = prompt('Enter service name:');
        if (!serviceName) return;

        const serviceId = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        setDoc(doc(db, 'services', serviceId), {
            name: serviceName,
            status: 'operational'
        });
    });
}

async function initDashboard() {
    // Listen to services status
    onSnapshot(collection(db, 'services'), (snapshot) => {
        const services = snapshot.docs.map(doc => doc.data());
        const activeServices = services.filter(s => s.status === 'operational').length;
        document.getElementById('active-services').textContent = activeServices;
        
        const hasIssues = services.some(s => s.status !== 'operational');
        document.getElementById('system-status').textContent = hasIssues ? 'Degraded' : 'Operational';
        document.getElementById('system-status').style.color = hasIssues ? '#eab308' : '#22c55e';
    });
}

function loadServices(categoryManager) {
    onSnapshot(collection(db, 'services'), (snapshot) => {
        const categories = categoryManager.categories;
        const defaultCategory = categories.get('default');
        
        // Create service cards and add them to their categories
        snapshot.forEach(doc => {
            const service = doc.data();
            const card = createServiceCard(doc.id, service);
            card.dataset.serviceId = doc.id;

            // Find which category this service belongs to
            let found = false;
            for (const [id, category] of categories) {
                if (category.services && category.services.includes(doc.id)) {
                    const container = document.querySelector(`[data-category="${id}"]`);
                    if (container) {
                        container.appendChild(card);
                        found = true;
                        break;
                    }
                }
            }

            // If service isn't in any category, add to default
            if (!found) {
                const defaultContainer = document.querySelector('[data-category="default"]');
                if (defaultContainer) {
                    defaultContainer.appendChild(card);
                    if (!defaultCategory.services) defaultCategory.services = [];
                    if (!defaultCategory.services.includes(doc.id)) {
                        defaultCategory.services.push(doc.id);
                        categoryManager.saveToStorage();
                    }
                }
            }
        });
    });
}

function createServiceCard(id, service) {
    const div = document.createElement('div');
    div.className = 'service-card';
    div.innerHTML = `
        <div class="service-header">
            <strong>${service.name}</strong>
            <div class="service-controls">
                <select class="status-select" data-service-id="${id}" data-current="${service.status}">
                    <option value="operational" ${service.status === 'operational' ? 'selected' : ''}>Operational</option>
                    <option value="degraded" ${service.status === 'degraded' ? 'selected' : ''}>Degraded</option>
                    <option value="outage" ${service.status === 'outage' ? 'selected' : ''}>Outage</option>
                </select>
                <button class="delete-btn" data-service-id="${id}">🗑️</button>
            </div>
        </div>
    `;

    let pendingStatus = null;
    const select = div.querySelector('select');
    const modal = document.getElementById('incident-modal');
    const form = document.getElementById('incident-form');
    const cancelBtn = document.getElementById('cancel-incident');

    select.addEventListener('change', (e) => {
        pendingStatus = e.target.value;
        modal.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        select.value = select.dataset.current;
        pendingStatus = null;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!pendingStatus) return;

        const description = document.getElementById('incident-description').value;
        
        try {
            // Create incident record
            await addDoc(collection(db, 'incidents'), {
                serviceId: id,
                serviceName: service.name,
                description: description,
                oldStatus: select.dataset.current,
                newStatus: pendingStatus,
                date: new Date().toISOString()
            });

            // Update service status
            await updateServiceStatus(id, pendingStatus);
            
            // Update current status in select
            select.dataset.current = pendingStatus;
            
            // Reset and close modal
            form.reset();
            modal.classList.add('hidden');
            pendingStatus = null;
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
            select.value = select.dataset.current;
        }
    });

    div.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Delete service "${service.name}"?`)) {
            deleteDoc(doc(db, 'services', id));
        }
    });

    return div;
}

async function updateServiceStatus(serviceId, status) {
    try {
        await setDoc(doc(db, 'services', serviceId), { status }, { merge: true });
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Failed to update service status');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAdminPanel);
