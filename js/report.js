import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

// Handle form tab switching
document.querySelectorAll('.report-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelector('.report-tab.active').classList.remove('active');
        tab.classList.add('active');
        
        document.querySelector('.report-form.active').classList.remove('active');
        document.getElementById(`${tab.dataset.form}-form`).classList.add('active');
    });
});

// Handle form submissions
const forms = {
    'bug-form': 'bugs',
    'feature-form': 'features',
    'security-form': 'security',
    'feedback-form': 'feedback'
};

Object.entries(forms).forEach(([formId, collectionName]) => {
    document.getElementById(formId).addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = {};
        
        // Gather all form inputs
        form.querySelectorAll('input, select, textarea').forEach(input => {
            formData[input.id] = input.value;
        });
        
        try {
            await addDoc(collection(window.db, collectionName), {
                ...formData,
                timestamp: new Date().toISOString(),
                status: 'new'
            });
            
            // Reset form and show success message
            form.reset();
            alert('Thank you for your submission!');
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your form. Please try again.');
        }
    });
});
