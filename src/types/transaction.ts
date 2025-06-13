// Transaction types based on Supabase database schema
export interface Transaction {
    id: number;
    id_kustomer: string;
    order_id: string;
    total_harga: number;
    biaya_pengiriman: number;
    total_final: number;
    status_pembayaran: 'pending' | 'paid' | 'dibayar' | 'failed' | 'gagal' | 'kedaluwarsa' | 'dikembalikan';
    status_pengiriman: 'diproses' | 'dikirim' | 'diterima' | 'dibatalkan' | 'dikembalikan';
    midtrans_order_id?: string;
    payment_type?: string;
    payment_url?: string;
    pengiriman_nama_penerima: string;
    pengiriman_no_telp: string;
    pengiriman_alamat_lengkap: string;
    pengiriman_kota: string;
    pengiriman_provinsi: string;
    pengiriman_kode_pos: string;
    kurir?: string;
    no_resi?: string;
    tanggal_transaksi: string;
}

export interface TransactionDetail {
    id: number;
    id_transaksi: number;
    id_produk: number;
    jumlah: number;
    harga_satuan: number;
    nama_produk: string;
    created_at: string;
}

export interface MidtransResponse {
    token: string;
    redirect_url: string;
}

export interface RetryPaymentRequest {
    order_id: string;
}

export interface RetryPaymentResponse {
    token?: string;
    redirect_url?: string;
    error?: string;
}
