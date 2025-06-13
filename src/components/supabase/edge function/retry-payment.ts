// KODE DEBUGGING UNTUK FUNGSI: retry-payment
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  console.log("[+] Fungsi retry-payment dipanggil.");
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization')
        }
      }
    });
    console.log("[OK] Supabase client diinisialisasi.");
    console.log("[*] Mengambil order_id dari body request...");
    const { order_id } = await req.json();
    if (!order_id) {
      throw new Error("Order ID tidak ditemukan di dalam request body.");
    }
    console.log(`[INFO] Order ID yang akan diproses ulang: ${order_id}`);
    console.log("[*] Mengambil data user yang sedang login...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User tidak ditemukan.");
    }
    console.log(`[INFO] User ditemukan: ${user.id}`);
    console.log(`[*] Mencari transaksi dengan order_id: ${order_id} untuk user: ${user.id}...`);
    const { data: transaction, error: trxError } = await supabase.from('transaksi').select('*').eq('order_id', order_id).eq('id_kustomer', user.id).single();
    if (trxError) throw trxError;
    if (!transaction) {
      throw new Error(`Transaksi dengan order_id ${order_id} tidak ditemukan atau bukan milik Anda.`);
    }
    console.log("[OK] Transaksi ditemukan:", transaction);
    console.log(`[*] Memeriksa status pembayaran... Status saat ini: ${transaction.status_pembayaran}`);
    if (transaction.status_pembayaran !== 'pending') {
      throw new Error(`Transaksi ini sudah tidak bisa dibayar (status saat ini: ${transaction.status_pembayaran}).`);
    }
    console.log("[OK] Status adalah 'pending', pembayaran bisa dilanjutkan.");
    console.log(`[*] Mengambil detail item untuk transaksi internal id: ${transaction.id}...`);
    const { data: details, error: detailsError } = await supabase.from('detail_transaksi').select('*').eq('id_transaksi', transaction.id);
    if (detailsError) throw detailsError;
    console.log(`[OK] Ditemukan ${details.length} item detail.`);
    const itemDetailsForMidtrans = details.map((item)=>({
        id: item.id_produk.toString(),
        price: item.harga_satuan,
        quantity: item.jumlah,
        name: item.nama_produk
      }));
    itemDetailsForMidtrans.push({
      id: 'SHIPPING_COST',
      price: transaction.biaya_pengiriman,
      quantity: 1,
      name: 'Biaya Pengiriman'
    });
    console.log(`[INFO] Total item yang akan dikirim ke Midtrans: ${itemDetailsForMidtrans.length} (termasuk ongkir).`);
    const parameter = {
      transaction_details: {
        order_id: transaction.order_id,
        gross_amount: transaction.total_final
      },
      item_details: itemDetailsForMidtrans,
      customer_details: {
        first_name: transaction.pengiriman_nama_penerima,
        email: user.email,
        phone: transaction.pengiriman_no_telp
      }
    };
    console.log("[INFO] Parameter untuk Midtrans sudah siap.");
    console.log("[*] Memanggil API Midtrans untuk mendapatkan token baru...");
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    const midtransApiUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    const encodedServerKey = btoa(midtransServerKey + ':');
    const response = await fetch(midtransApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedServerKey}`
      },
      body: JSON.stringify(parameter)
    });
    const midtransResponse = await response.json();
    if (!response.ok) {
      throw new Error(`Gagal membuat token Midtrans: ${JSON.stringify(midtransResponse)}`);
    }
    console.log("[✓] SUKSES: Token baru dari Midtrans berhasil didapatkan.");
    return new Response(JSON.stringify(midtransResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error("[!] TERJADI ERROR di fungsi retry-payment:", error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
