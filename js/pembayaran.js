// Pembayaran Module
class PembayaranManager {
    constructor() {
        this.BIAYA_LANGGANAN = 331890;
        this.initializeEventListeners();
        this.setupDateInputs();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Form submission
        const form = document.getElementById('pembayaran-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePembayaran();
            });
        }

        // Update anggota dropdown when shown
        const navPembayaran = document.getElementById('nav-pembayaran');
        if (navPembayaran) {
            navPembayaran.addEventListener('click', () => {
                this.updateAnggotaDropdown();
                this.loadPembayaranBulanIni();
            });
        }

        // Update info when month changes
        const bulanInput = document.getElementById('bulan-pembayaran');
        if (bulanInput) {
            bulanInput.addEventListener('change', () => {
                this.loadPembayaranBulanIni();
            });
        }

        // Update info when member changes
        const anggotaSelect = document.getElementById('anggota-pembayaran');
        if (anggotaSelect) {
            anggotaSelect.addEventListener('change', () => {
                this.showPaymentInfo();
            });
        }

        // Update info when payment amount changes
        const jumlahInput = document.getElementById('jumlah-bayar');
        if (jumlahInput) {
            jumlahInput.addEventListener('input', () => {
                this.showPaymentInfo();
            });
        }
    }

    // Setup date inputs with current date
    setupDateInputs() {
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const today = now.toISOString().split('T')[0];
        
        const bulanInput = document.getElementById('bulan-pembayaran');
        const tanggalInput = document.getElementById('tanggal-bayar');
        
        if (bulanInput) bulanInput.value = month;
        if (tanggalInput) tanggalInput.value = today;
    }

    // Save new pembayaran
    savePembayaran() {
        // Get form values
        const bulan = document.getElementById('bulan-pembayaran').value;
        const anggotaId = parseInt(document.getElementById('anggota-pembayaran').value);
        const jumlahBayar = parseInt(document.getElementById('jumlah-bayar').value);
        const tanggalBayar = document.getElementById('tanggal-bayar').value;

        // Validate inputs
        if (!bulan || !anggotaId || !jumlahBayar || !tanggalBayar) {
            alert('❌ Mohon lengkapi semua data pembayaran!');
            return;
        }

        if (jumlahBayar <= 0) {
            alert('❌ Jumlah pembayaran harus lebih dari 0!');
            return;
        }

        // Create new payment object
        const newPembayaran = {
            id: Date.now(),
            anggotaId: anggotaId,
            jumlahBayar: jumlahBayar,
            tanggalBayar: tanggalBayar
        };

        // Get existing payments
        const storageKey = `pembayaran_${bulan}`;
        let pembayaranList = [];
        const existingData = localStorage.getItem(storageKey);
        
        if (existingData) {
            try {
                pembayaranList = JSON.parse(existingData);
            } catch (e) {
                pembayaranList = [];
            }
        }

        // Add new payment
        if (!Array.isArray(pembayaranList)) {
            pembayaranList = [];
        }
        pembayaranList.push(newPembayaran);

        // Save to localStorage
        localStorage.setItem(storageKey, JSON.stringify(pembayaranList));

        // Handle excess payment
        const totalBayar = this.calculateTotalBayarAnggota(anggotaId, bulan);
        const perOrang = this.calculateIuranPerOrang();
        const saldoLebih = this.getSaldoLebih(anggotaId, bulan);
        const totalSetelahBayar = totalBayar + saldoLebih;
        const kelebihan = Math.max(0, totalSetelahBayar - perOrang);

        if (kelebihan > 0) {
            this.saveSaldoLebih(anggotaId, bulan, kelebihan);
        }

        // Reset form
        document.getElementById('jumlah-bayar').value = '';
        document.getElementById('anggota-pembayaran').selectedIndex = 0;

        // Refresh display
        this.loadPembayaranBulanIni();
        this.showPaymentInfo();

        alert('✅ Pembayaran berhasil disimpan!');
    }

    // Show payment information
    showPaymentInfo() {
        const anggotaId = parseInt(document.getElementById('anggota-pembayaran').value);
        const jumlahBayar = parseInt(document.getElementById('jumlah-bayar').value) || 0;
        const bulan = document.getElementById('bulan-pembayaran').value;
        const infoDiv = document.getElementById('info-pembayaran');

        if (!anggotaId || !bulan) {
            infoDiv.innerHTML = '';
            return;
        }

        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const anggota = anggotaList.find(a => a.id === anggotaId);
        if (!anggota) return;

        const iuranPerOrang = this.calculateIuranPerOrang();
        const totalBayarSebelumnya = this.calculateTotalBayarAnggota(anggotaId, bulan);
        const saldoLebih = this.getSaldoLebih(anggotaId, bulan);
        const totalSetelahBayar = totalBayarSebelumnya + jumlahBayar + saldoLebih;
        
        const kekurangan = Math.max(0, iuranPerOrang - totalSetelahBayar);
        const kelebihan = Math.max(0, totalSetelahBayar - iuranPerOrang);

        infoDiv.innerHTML = `
            <div class="alert alert-info">
                <h6 class="mb-2">Informasi Pembayaran:</h6>
                <p class="mb-1">Anggota: ${anggota.nama}</p>
                <p class="mb-1">Iuran yang harus dibayar: Rp ${this.formatRupiah(iuranPerOrang)}</p>
                <p class="mb-1">Sudah dibayar bulan ini: Rp ${this.formatRupiah(totalBayarSebelumnya)}</p>
                ${saldoLebih > 0 ? `<p class="mb-1">Saldo lebih bulan lalu: Rp ${this.formatRupiah(saldoLebih)}</p>` : ''}
                <hr>
                <p class="mb-1">Total setelah pembayaran ini: Rp ${this.formatRupiah(totalSetelahBayar)}</p>
                ${kekurangan > 0 ? `<p class="mb-1 text-warning">Kekurangan: Rp ${this.formatRupiah(kekurangan)}</p>` : ''}
                ${kelebihan > 0 ? `<p class="mb-1 text-success">Kelebihan: Rp ${this.formatRupiah(kelebihan)}</p>` : ''}
            </div>
        `;
    }

    // Get excess balance for a member in a month
    getSaldoLebih(anggotaId, bulan) {
        const saldoList = JSON.parse(localStorage.getItem('saldo_lebih') || '[]');
        return saldoList
            .filter(s => s.anggotaId === anggotaId && s.bulan === bulan)
            .reduce((total, s) => total + s.jumlah, 0);
    }

    // Update anggota dropdown
    updateAnggotaDropdown() {
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const dropdown = document.getElementById('anggota-pembayaran');
        
        // Clear current options except the first one
        while (dropdown.options.length > 1) {
            dropdown.remove(1);
        }

        // Add anggota options
        anggotaList.forEach(anggota => {
            const option = new Option(anggota.nama, anggota.id);
            dropdown.add(option);
        });
    }

    // Calculate total payment for a member in a month
    calculateTotalBayarAnggota(anggotaId, bulan) {
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        return pembayaranList
            .filter(p => p.anggotaId === anggotaId)
            .reduce((total, p) => total + p.jumlahBayar, 0);
    }

    // Calculate fee per person
    calculateIuranPerOrang() {
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        return Math.ceil(this.BIAYA_LANGGANAN / (anggotaList.length || 1));
    }

    // Save excess balance
    saveSaldoLebih(anggotaId, bulan, jumlah) {
        const [tahun, bulanNum] = bulan.split('-');
        const nextBulan = bulanNum === '12' 
            ? `${parseInt(tahun) + 1}-01`
            : `${tahun}-${String(parseInt(bulanNum) + 1).padStart(2, '0')}`;

        const saldoList = JSON.parse(localStorage.getItem('saldo_lebih') || '[]');
        
        // Remove any existing saldo for this member and month
        const filteredList = saldoList.filter(s => 
            !(s.anggotaId === anggotaId && s.bulan === nextBulan)
        );
        
        // Add new saldo
        filteredList.push({
            anggotaId,
            bulan: nextBulan,
            jumlah
        });

        localStorage.setItem('saldo_lebih', JSON.stringify(filteredList));
    }

    // Load payments for current month
    loadPembayaranBulanIni() {
        const bulan = document.getElementById('bulan-pembayaran').value;
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const tbody = document.getElementById('pembayaran-list');
        
        tbody.innerHTML = '';

        // Sort by date, newest first
        pembayaranList.sort((a, b) => new Date(b.tanggalBayar) - new Date(a.tanggalBayar));

        pembayaranList.forEach(pembayaran => {
            const anggota = anggotaList.find(a => a.id === pembayaran.anggotaId);
            if (!anggota) return;

            const totalBayar = this.calculateTotalBayarAnggota(pembayaran.anggotaId, bulan);
            const perOrang = this.calculateIuranPerOrang();
            const status = this.getStatusPembayaran(totalBayar, perOrang);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.formatDate(pembayaran.tanggalBayar)}</td>
                <td>${anggota.nama}</td>
                <td>Rp ${this.formatRupiah(pembayaran.jumlahBayar)}</td>
                <td>${status.icon} ${status.text}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="pembayaranManager.deletePembayaran('${pembayaran.id}', '${bulan}')">
                        <i class="bi bi-trash"></i> Hapus
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Delete payment
    deletePembayaran(paymentId, bulan) {
        if (!confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
            return;
        }

        const storageKey = `pembayaran_${bulan}`;
        const pembayaranList = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newList = pembayaranList.filter(p => p.id !== parseInt(paymentId));

        localStorage.setItem(storageKey, JSON.stringify(newList));
        this.loadPembayaranBulanIni();
        this.showPaymentInfo();
        
        alert('🗑️ Pembayaran berhasil dihapus!');
    }

    // Get payment status with icon
    getStatusPembayaran(totalBayar, perOrang) {
        if (totalBayar >= perOrang) {
            return { icon: '✅', text: 'Lunas' };
        } else if (totalBayar > 0) {
            return { icon: '🟡', text: 'Bayar Sebagian' };
        }
        return { icon: '❌', text: 'Belum Bayar' };
    }

    // Format date to locale string
    formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format number to Rupiah
    formatRupiah(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

// Initialize the PembayaranManager
const pembayaranManager = new PembayaranManager();
