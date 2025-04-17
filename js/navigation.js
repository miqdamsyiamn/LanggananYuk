// Navigation Module
class Navigation {
    constructor() {
        this.sections = [
            'kalkulator',
            'anggota',
            'pembayaran',
            'dashboard',
            'riwayat'
        ];
        this.initializeEventListeners();
        this.showActiveSection();
    }

    // Initialize event listeners for navigation
    initializeEventListeners() {
        this.sections.forEach(section => {
            const navLink = document.getElementById(`nav-${section}`);
            if (navLink) {
                navLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showSection(section);
                });
            }
        });
    }

    // Show active section and hide others
    showSection(sectionId) {
        // Update navigation links
        this.sections.forEach(section => {
            const navLink = document.getElementById(`nav-${section}`);
            const sectionElement = document.getElementById(`${section}-section`);
            
            if (navLink) {
                navLink.classList.toggle('active', section === sectionId);
            }
            
            if (sectionElement) {
                sectionElement.style.display = section === sectionId ? 'block' : 'none';
            }
        });
    }

    // Show the active section based on navigation
    showActiveSection() {
        const activeNav = document.querySelector('.nav-link.active');
        if (activeNav) {
            const sectionId = activeNav.id.replace('nav-', '');
            this.showSection(sectionId);
        }
    }
}

// Initialize navigation
const navigation = new Navigation();
