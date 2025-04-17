// Anggota Management Module
class AnggotaManager {
    constructor() {
        this.storageKey = 'anggota';
        this.initializeEventListeners();
        this.loadAnggota();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Save new anggota
        document.getElementById('saveAnggota').addEventListener('click', () => {
            const namaInput = document.getElementById('nama');
            const nama = namaInput.value.trim();
            
            if (nama) {
                this.addAnggota(nama);
                namaInput.value = '';
                bootstrap.Modal.getInstance(document.getElementById('addAnggotaModal')).hide();
            }
        });

        // Update existing anggota
        document.getElementById('updateAnggota').addEventListener('click', () => {
            const id = document.getElementById('edit-id').value;
            const nama = document.getElementById('edit-nama').value.trim();
            
            if (nama) {
                this.updateAnggota(parseInt(id), nama);
                bootstrap.Modal.getInstance(document.getElementById('editAnggotaModal')).hide();
            }
        });

        // Handle enter key in modals
        ['addAnggotaForm', 'editAnggotaForm'].forEach(formId => {
            document.getElementById(formId).addEventListener('submit', (e) => {
                e.preventDefault();
                document.activeElement.click();
            });
        });
    }

    // Load anggota from localStorage
    loadAnggota() {
        const anggotaList = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        this.renderAnggotaList(anggotaList);
    }

    // Render anggota list to table
    renderAnggotaList(anggotaList) {
        const tbody = document.getElementById('anggota-list');
        tbody.innerHTML = '';

        anggotaList.forEach((anggota, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${anggota.nama}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="anggotaManager.showEditModal(${anggota.id}, '${anggota.nama}')">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="anggotaManager.deleteAnggota(${anggota.id})">
                        <i class="bi bi-trash"></i> Hapus
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Add new anggota
    addAnggota(nama) {
        const anggotaList = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const newId = anggotaList.length > 0 ? Math.max(...anggotaList.map(a => a.id)) + 1 : 1;
        
        anggotaList.push({
            id: newId,
            nama: nama
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(anggotaList));
        this.renderAnggotaList(anggotaList);
        alert('✅ Anggota berhasil ditambahkan!');
    }

    // Show edit modal
    showEditModal(id, nama) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nama').value = nama;
        new bootstrap.Modal(document.getElementById('editAnggotaModal')).show();
    }

    // Update existing anggota
    updateAnggota(id, newNama) {
        const anggotaList = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        const index = anggotaList.findIndex(a => a.id === id);
        
        if (index !== -1) {
            anggotaList[index].nama = newNama;
            localStorage.setItem(this.storageKey, JSON.stringify(anggotaList));
            this.renderAnggotaList(anggotaList);
            alert('✅ Data anggota berhasil diperbarui!');
        }
    }

    // Delete anggota
    deleteAnggota(id) {
        if (confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
            const anggotaList = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
            const filteredList = anggotaList.filter(a => a.id !== id);
            
            localStorage.setItem(this.storageKey, JSON.stringify(filteredList));
            this.renderAnggotaList(filteredList);
            alert('🗑️ Anggota berhasil dihapus!');
        }
    }
}

// Initialize the AnggotaManager
const anggotaManager = new AnggotaManager();
