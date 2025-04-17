// Dashboard Module
class DashboardManager {
    constructor() {
        this.BIAYA_LANGGANAN = 331890;
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Update dashboard when shown
        document.getElementById('nav-dashboard').addEventListener('click', () => {
            this.updateDashboard();
        });
    }

    // Update all dashboard components
    updateDashboard() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        this.updateStatusTable(currentMonth);
        this.updateTotalCards(currentMonth);
    }

    // Update status table
    updateStatusTable(bulan) {
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const saldoList = JSON.parse(localStorage.getItem('saldo_lebih') || '[]');
        const tbody = document.getElementById('status-list');
        const iuranPerOrang = this.calculateIuranPerOrang();
        
        tbody.innerHTML = '';

        anggotaList.forEach(anggota => {
            // Calculate total payment
            const totalBayar = pembayaranList
                .filter(p => p.anggotaId === anggota.id)
                .reduce((sum, p) => sum + p.jumlahBayar, 0);

            // Calculate excess from previous month
            const saldoLebih = saldoList
                .filter(s => s.anggotaId === anggota.id && s.bulan === bulan)
                .reduce((sum, s) => sum + s.jumlah, 0);

            // Calculate status
            const totalDenganSaldo = totalBayar + saldoLebih;
            const status = this.getStatusPembayaran(totalDenganSaldo, iuranPerOrang);
            const kekurangan = Math.max(0, iuranPerOrang - totalDenganSaldo);
            const kelebihan = Math.max(0, totalDenganSaldo - iuranPerOrang);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${anggota.nama}</td>
                <td>Rp ${this.formatRupiah(iuranPerOrang)}</td>
                <td>Rp ${this.formatRupiah(totalBayar)}</td>
                <td>${status.icon} ${status.text}</td>
                <td>Rp ${this.formatRupiah(kekurangan)}</td>
                <td>Rp ${this.formatRupiah(kelebihan)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update total cards
    updateTotalCards(bulan) {
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const iuranPerOrang = this.calculateIuranPerOrang();
        
        // Calculate totals
        const totalTerkumpul = pembayaranList.reduce((sum, p) => sum + p.jumlahBayar, 0);
        const targetTotal = iuranPerOrang * anggotaList.length;
        const totalKekurangan = Math.max(0, this.BIAYA_LANGGANAN - totalTerkumpul);
        const totalKelebihan = Math.max(0, totalTerkumpul - this.BIAYA_LANGGANAN);

        // Update cards
        document.getElementById('total-terkumpul').textContent = `Rp ${this.formatRupiah(totalTerkumpul)}`;
        document.getElementById('total-kekurangan').textContent = `Rp ${this.formatRupiah(totalKekurangan)}`;
        document.getElementById('total-kelebihan').textContent = `Rp ${this.formatRupiah(totalKelebihan)}`;
    }

    // Calculate fee per person
    calculateIuranPerOrang() {
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        return Math.ceil(this.BIAYA_LANGGANAN / (anggotaList.length || 1));
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

    // Format number to Rupiah
    formatRupiah(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

// Initialize the DashboardManager
const dashboardManager = new DashboardManager();
