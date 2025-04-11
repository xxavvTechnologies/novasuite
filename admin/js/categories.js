export class CategoryManager {
    constructor() {
        this.categories = new Map();
        this.servicesGrid = document.getElementById('services-grid');
        this.loadFromStorage();
        this.setupEventListeners();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('serviceCategories');
        if (saved) {
            this.categories = new Map(Object.entries(JSON.parse(saved)));
        }
        if (this.categories.size === 0) {
            this.categories.set('default', { name: 'Services', services: [] });
        }
        this.renderCategories();
    }

    saveToStorage() {
        localStorage.setItem('serviceCategories', 
            JSON.stringify(Object.fromEntries(this.categories))
        );
    }

    renderCategories() {
        this.servicesGrid.innerHTML = '';
        
        // Add default category if none exist
        if (this.categories.size === 0) {
            this.categories.set('default', { name: 'Services', services: [] });
        }

        this.categories.forEach((category, id) => {
            const container = document.createElement('div');
            container.className = 'category-container';
            container.dataset.categoryId = id;
            container.innerHTML = `
                <div class="category-header">
                    <span class="category-name">${category.name}</span>
                    <button class="secondary-button rename-category">Rename</button>
                </div>
                <div class="category-services" data-category="${id}"></div>
            `;
            this.servicesGrid.appendChild(container);
        });

        // Don't call setupDragAndDrop here since cards aren't loaded yet
    }

    setupDragAndDrop() {
        const serviceCards = document.querySelectorAll('.service-card');
        const categoryContainers = document.querySelectorAll('.category-services');

        serviceCards.forEach(card => {
            card.draggable = true;
            card.addEventListener('dragstart', e => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.serviceId);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });

        categoryContainers.forEach(container => {
            container.addEventListener('dragover', e => {
                e.preventDefault();
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', async e => {
                e.preventDefault();
                container.classList.remove('drag-over');
                const serviceId = e.dataTransfer.getData('text/plain');
                const categoryId = container.dataset.category;
                await this.moveServiceToCategory(serviceId, categoryId);
            });
        });
    }

    async moveServiceToCategory(serviceId, categoryId) {
        try {
            const category = this.categories.get(categoryId);
            if (!category.services) category.services = [];
            category.services.push(serviceId);

            // Remove from other categories
            this.categories.forEach((cat, id) => {
                if (id !== categoryId && cat.services) {
                    cat.services = cat.services.filter(s => s !== serviceId);
                }
            });

            this.saveToStorage();
            this.renderCategories();
        } catch (error) {
            console.error('Error moving service:', error);
            alert('Failed to move service');
        }
    }

    setupEventListeners() {
        const addCategoryBtn = document.createElement('button');
        addCategoryBtn.className = 'primary-button';
        addCategoryBtn.textContent = 'Add Category';
        addCategoryBtn.style.marginRight = '1rem';
        document.getElementById('add-service').parentNode.insertBefore(
            addCategoryBtn,
            document.getElementById('add-service')
        );

        addCategoryBtn.addEventListener('click', () => {
            const name = prompt('Enter category name:');
            if (!name) return;

            const categoryId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            this.categories.set(categoryId, { name, services: [] });
            this.saveToStorage();
            this.renderCategories();
        });

        this.servicesGrid.addEventListener('click', e => {
            if (e.target.classList.contains('rename-category')) {
                const container = e.target.closest('.category-container');
                const categoryId = container.dataset.categoryId;
                const category = this.categories.get(categoryId);
                const newName = prompt('Enter new category name:', category.name);
                
                if (newName && newName !== category.name) {
                    category.name = newName;
                    this.saveToStorage();
                    this.renderCategories();
                }
            }
        });
    }
}
