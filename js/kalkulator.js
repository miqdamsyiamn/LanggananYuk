// Kalkulator Iuran Module
class KalkulatorIuran {
    constructor() {
        this.BIAYA_LANGGANAN = 331890; // Biaya langganan tetap per bulan
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const jumlahOrangInput = document.getElementById('jumlah-orang');
        
        // Calculate on input change
        jumlahOrangInput.addEventListener('input', () => this.hitungIuran());
        
        // Handle form submission
        document.getElementById('kalkulator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.hitungIuran();
        });
    }

    // Calculate subscription fee per person
    hitungIuran() {
        const jumlahOrang = parseInt(document.getElementById('jumlah-orang').value) || 0;
        const hasilDiv = document.getElementById('hasil-perhitungan');
        
        if (jumlahOrang <= 0) {
            hasilDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle"></i> Masukkan jumlah orang yang valid
                </div>
            `;
            return;
        }

        const iuranPerOrang = Math.ceil(this.BIAYA_LANGGANAN / jumlahOrang);
        const totalBayar = iuranPerOrang * jumlahOrang;
        const selisih = totalBayar - this.BIAYA_LANGGANAN;

        hasilDiv.innerHTML = `
            <div class="alert alert-info">
                <h5 class="mb-3">Hasil Perhitungan:</h5>
                <p><strong>Iuran per orang:</strong> Rp ${this.formatRupiah(iuranPerOrang)}</p>
                <p><strong>Total yang terkumpul:</strong> Rp ${this.formatRupiah(totalBayar)}</p>
                ${selisih > 0 ? `<p><strong>Kelebihan:</strong> Rp ${this.formatRupiah(selisih)}</p>` : ''}
                <small class="text-muted">
                    <i class="bi bi-info-circle"></i> 
                    Biaya langganan: Rp ${this.formatRupiah(this.BIAYA_LANGGANAN)}/bulan
                </small>
            </div>
        `;
    }

    // Format number to Rupiah
    formatRupiah(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
}

// Initialize the calculator
const kalkulatorIuran = new KalkulatorIuran();
