// Riwayat Module
class RiwayatManager {
    constructor() {
        this.BIAYA_LANGGANAN = 331890;
        this.initializeEventListeners();
        this.setupDateInput();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Update riwayat when shown
        document.getElementById('nav-riwayat').addEventListener('click', () => {
            this.loadRiwayat();
        });

        // Update when month changes
        document.getElementById('riwayat-bulan').addEventListener('change', () => {
            this.loadRiwayat();
        });

        // Export buttons
        document.getElementById('export-pdf').addEventListener('click', () => {
            this.exportToPDF();
        });

        document.getElementById('export-excel').addEventListener('click', () => {
            this.exportToExcel();
        });
    }

    // Setup date input with current month
    setupDateInput() {
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        document.getElementById('riwayat-bulan').value = month;
    }

    // Load payment history
    loadRiwayat() {
        const bulan = document.getElementById('riwayat-bulan').value;
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        const tbody = document.getElementById('riwayat-list');
        
        tbody.innerHTML = '';

        // Sort by date
        pembayaranList.sort((a, b) => new Date(b.tanggalBayar) - new Date(a.tanggalBayar));

        pembayaranList.forEach(pembayaran => {
            const anggota = anggotaList.find(a => a.id === pembayaran.anggotaId);
            if (!anggota) return;

            const totalBayar = this.calculateTotalBayarAnggota(pembayaran.anggotaId, bulan);
            const perOrang = this.calculateIuranPerOrang(bulan);
            const status = this.getStatusPembayaran(totalBayar, perOrang);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${this.formatDate(pembayaran.tanggalBayar)}</td>
                <td>${anggota.nama}</td>
                <td>Rp ${this.formatRupiah(pembayaran.jumlahBayar)}</td>
                <td>${status.icon} ${status.text}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Export to PDF
    exportToPDF() {
        const bulan = document.getElementById('riwayat-bulan').value;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        const monthName = new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        doc.setFontSize(16);
        doc.text(`Laporan Pembayaran - ${monthName}`, 20, 20);

        // Prepare data
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');
        
        // Create table data
        const tableData = pembayaranList.map(pembayaran => {
            const anggota = anggotaList.find(a => a.id === pembayaran.anggotaId);
            if (!anggota) return null;

            const totalBayar = this.calculateTotalBayarAnggota(pembayaran.anggotaId, bulan);
            const perOrang = this.calculateIuranPerOrang(bulan);
            const status = this.getStatusPembayaran(totalBayar, perOrang);

            return [
                this.formatDate(pembayaran.tanggalBayar),
                anggota.nama,
                `Rp ${this.formatRupiah(pembayaran.jumlahBayar)}`,
                status.text
            ];
        }).filter(row => row !== null);

        // Add table
        doc.autoTable({
            head: [['Tanggal', 'Nama', 'Jumlah Bayar', 'Status']],
            body: tableData,
            startY: 30,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        // Save PDF
        doc.save(`Laporan_Pembayaran_${bulan}.pdf`);
        alert('✅ PDF berhasil di-export!');
    }

    // Export to Excel
    exportToExcel() {
        const bulan = document.getElementById('riwayat-bulan').value;
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        const anggotaList = JSON.parse(localStorage.getItem('anggota') || '[]');

        // Prepare worksheet data
        const wsData = [
            ['Tanggal', 'Nama', 'Jumlah Bayar', 'Status'] // Header
        ];

        // Add data rows
        pembayaranList.forEach(pembayaran => {
            const anggota = anggotaList.find(a => a.id === pembayaran.anggotaId);
            if (!anggota) return;

            const totalBayar = this.calculateTotalBayarAnggota(pembayaran.anggotaId, bulan);
            const perOrang = this.calculateIuranPerOrang(bulan);
            const status = this.getStatusPembayaran(totalBayar, perOrang);

            wsData.push([
                this.formatDate(pembayaran.tanggalBayar),
                anggota.nama,
                pembayaran.jumlahBayar,
                status.text
            ]);
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Pembayaran');

        // Save Excel file
        const monthName = new Date(bulan + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        XLSX.writeFile(wb, `Laporan_Pembayaran_${bulan}.xlsx`);
        alert('✅ Excel berhasil di-export!');
    }

    // Calculate total payment for a member in a month
    calculateTotalBayarAnggota(anggotaId, bulan) {
        const pembayaranList = JSON.parse(localStorage.getItem(`pembayaran_${bulan}`) || '[]');
        return pembayaranList
            .filter(p => p.anggotaId === anggotaId)
            .reduce((total, p) => total + p.jumlahBayar, 0);
    }

    // Calculate fee per person for a month
    calculateIuranPerOrang(bulan) {
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

// Initialize the RiwayatManager
const riwayatManager = new RiwayatManager();
