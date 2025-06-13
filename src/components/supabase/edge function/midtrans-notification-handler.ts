// // KODE DEBUGGING SUPER DETAIL
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
// serve(async (req)=>{
//   try {
//     const notificationJson = await req.json();
//     const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
//     // console.log("--- MEMULAI PROSES DEBUGGING VERIFIKASI TANDA TANGAN ---");
//     // console.log("RAW NOTIFICATION BODY DARI MIDTRANS:", JSON.stringify(notificationJson, null, 2));
//     if (!serverKey) {
//       // console.error("FATAL: MIDTRANS_SERVER_KEY tidak ditemukan di secrets!");
//       throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan di secrets.");
//     }
//     // 1. Ambil semua komponen dari notifikasi Midtrans
//     const signatureKey = notificationJson.signature_key;
//     const orderId = notificationJson.order_id;
//     const statusCode = notificationJson.status_code;
//     const grossAmount = notificationJson.gross_amount; // Kita gunakan format asli dulu: "12345.00"
//     // Mencetak setiap komponen satu per satu
//     // console.log(`- Order ID      : [${orderId}]`);
//     // console.log(`- Status Code   : [${statusCode}]`);
//     // console.log(`- Gross Amount  : [${grossAmount}]`);
//     // console.log(`- Server Key (preview): [${serverKey.substring(0, 10)}...]`);
//     // 2. Buat string panjang yang akan di-hash, sesuai dokumentasi
//     const stringToHash = orderId + statusCode + grossAmount + serverKey;
//     // console.log("-> String Final yang akan di-hash:", stringToHash);
//     // 3. Proses Hashing menggunakan Web Crypto API (SHA-512)
//     const encoder = new TextEncoder();
//     const data = encoder.encode(stringToHash);
//     const hashBuffer = await crypto.subtle.digest('SHA-512', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
//     // 4. Perbandingan Kunci
//     // console.log("   Signature Key (dari Midtrans):", signatureKey);
//     // console.log("   Hash yang kita hasilkan      :", hash);
//     if (signatureKey !== hash) {
//       console.error("--> HASIL: TIDAK COCOK! Verifikasi Gagal.");
//       return new Response("Invalid signature", {
//         status: 403
//       });
//     }
//     // console.log("--> HASIL: COCOK! Verifikasi Berhasil.");
//     // Jika verifikasi berhasil, lanjutkan logika update
//     const transactionStatus = notificationJson.transaction_status;
//     // ... (sisa logika update database tidak perlu diubah) ...
//     return new Response("OK", {
//       status: 200
//     });
//   } catch (error) {
//     // console.error("--- TERJADI ERROR DI BLOK CATCH ---");
//     // console.error("Pesan Error:", error.message);
//     return new Response(error.message, {
//       status: 400
//     });
//   }
// });
//
// // KODE FINAL - Menggabungkan verifikasi yang sudah berhasil dengan logika update database
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
// serve(async (req)=>{
//   try {
//     const notificationJson = await req.json();
//     const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
//     if (!serverKey) {
//       throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan.");
//     }
//     // 1. Verifikasi Signature Key (Sudah terbukti bekerja)
//     const signatureKey = notificationJson.signature_key;
//     const orderId = notificationJson.order_id;
//     const statusCode = notificationJson.status_code;
//     const grossAmount = notificationJson.gross_amount;
//     const stringToHash = orderId + statusCode + grossAmount + serverKey;
//     const encoder = new TextEncoder();
//     const data = encoder.encode(stringToHash);
//     const hashBuffer = await crypto.subtle.digest('SHA-512', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
//     if (signatureKey !== hash) {
//       return new Response("Invalid signature", {
//         status: 403
//       });
//     }
//     // ================== LOGIKA UPDATE DATABASE DIMASUKKAN DI SINI ==================
//     // Jika verifikasi berhasil, kita lanjutkan ke logika ini
//     console.log(`Verifikasi untuk order ${orderId} berhasil. Mengupdate status...`);
//     const transactionStatus = notificationJson.transaction_status;
//     const fraudStatus = notificationJson.fraud_status;
//     const paymentType = notificationJson.payment_type;
//     const midtransOrderId = notificationJson.transaction_id;
//     let newStatus;
//     if (transactionStatus == 'capture') {
//       if (fraudStatus == 'accept') {
//         newStatus = 'paid';
//       }
//     } else if (transactionStatus == 'settlement') {
//       newStatus = 'paid';
//     } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
//       newStatus = 'failed';
//     } else if (transactionStatus == 'pending') {
//       newStatus = 'pending';
//     }
//     // Hanya update database jika ada status baru yang valid
//     if (newStatus) {
//       const { error } = await supabaseAdmin.from('transaksi').update({
//         status_pembayaran: newStatus,
//         payment_type: paymentType,
//         midtrans_order_id: midtransOrderId
//       }).eq('id', orderId); // Mencari transaksi berdasarkan ID order kita
//       if (error) {
//         console.error(`Gagal update DB untuk order ${orderId}:`, error);
//         return new Response(`DB update failed: ${error.message}`, {
//           status: 500
//         });
//       }
//       console.log(`Order ${orderId} berhasil diupdate menjadi ${newStatus}.`);
//     }
//     // ================== AKHIR DARI LOGIKA UPDATE ==================
//     // Kirim response 200 OK ke Midtrans bahwa notifikasi sudah diproses
//     return new Response("OK", {
//       status: 200
//     });
//   } catch (error) {
//     console.error("Error memproses notifikasi:", error.message);
//     return new Response(error.message, {
//       status: 400
//     });
//   }
// });
// KODE FINAL - Menggabungkan verifikasi yang sudah berhasil dengan logika update database
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
// serve(async (req)=>{
//   try {
//     const notificationJson = await req.json();
//     const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
//     if (!serverKey) {
//       throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan.");
//     }
//     // 1. Verifikasi Signature Key (Sudah terbukti bekerja)
//     const signatureKey = notificationJson.signature_key;
//     const orderId = notificationJson.order_id;
//     const statusCode = notificationJson.status_code;
//     const grossAmount = notificationJson.gross_amount;
//     const stringToHash = orderId + statusCode + grossAmount + serverKey;
//     const encoder = new TextEncoder();
//     const data = encoder.encode(stringToHash);
//     const hashBuffer = await crypto.subtle.digest('SHA-512', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
//     if (signatureKey !== hash) {
//       return new Response("Invalid signature", {
//         status: 403
//       });
//     }
//     // ================== LOGIKA UPDATE DATABASE DIMASUKKAN DI SINI ==================
//     // Jika verifikasi berhasil, kita lanjutkan ke logika ini
//     console.log(`Verifikasi untuk order ${orderId} berhasil. Mengupdate status...`);
//     const transactionStatus = notificationJson.transaction_status;
//     const fraudStatus = notificationJson.fraud_status;
//     const paymentType = notificationJson.payment_type;
//     const midtransOrderId = notificationJson.transaction_id;
//     let newStatus;
//     if (transactionStatus == 'capture') {
//       if (fraudStatus == 'accept') {
//         newStatus = 'paid';
//       }
//     } else if (transactionStatus == 'settlement') {
//       newStatus = 'paid';
//     } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
//       newStatus = 'failed';
//     } else if (transactionStatus == 'pending') {
//       newStatus = 'pending';
//     }
//     // Hanya update database jika ada status baru yang valid
//     if (newStatus) {
//       const { error } = await supabaseAdmin.from('transaksi').update({
//         status_pembayaran: newStatus,
//         payment_type: paymentType,
//         midtrans_order_id: midtransOrderId
//       }).eq('id', orderId); // Mencari transaksi berdasarkan ID order kita
//       if (error) {
//         console.error(`Gagal update DB untuk order ${orderId}:`, error);
//         return new Response(`DB update failed: ${error.message}`, {
//           status: 500
//         });
//       }
//       console.log(`Order ${orderId} berhasil diupdate menjadi ${newStatus}.`);
//     }
//     // ================== AKHIR DARI LOGIKA UPDATE ==================
//     // Kirim response 200 OK ke Midtrans bahwa notifikasi sudah diproses
//     return new Response("OK", {
//       status: 200
//     });
//   } catch (error) {
//     console.error("Error memproses notifikasi:", error.message);
//     return new Response(error.message, {
//       status: 400
//     });
//   }
// });
// KODE FINAL - Dengan console.log untuk memantau proses update database
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
// serve(async (req)=>{
//   try {
//     const notificationJson = await req.json();
//     const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
//     if (!serverKey) {
//       throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan.");
//     }
//     // 1. Verifikasi Signature Key
//     const signatureKey = notificationJson.signature_key;
//     const orderId = notificationJson.order_id;
//     const statusCode = notificationJson.status_code;
//     const grossAmount = notificationJson.gross_amount;
//     const stringToHash = orderId + statusCode + grossAmount + serverKey;
//     const encoder = new TextEncoder();
//     const data = encoder.encode(stringToHash);
//     const hashBuffer = await crypto.subtle.digest('SHA-512', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     const hash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
//     if (signatureKey !== hash) {
//       return new Response("Invalid signature", {
//         status: 403
//       });
//     }
//     // ================== LOGIKA UPDATE DATABASE DENGAN LOG ==================
//     console.log(`[+] Verifikasi untuk order ${orderId} berhasil. Memulai proses update...`);
//     const transactionStatus = notificationJson.transaction_status;
//     const fraudStatus = notificationJson.fraud_status;
//     const paymentType = notificationJson.payment_type;
//     const midtransOrderId = notificationJson.transaction_id;
//     let newStatus;
//     if (transactionStatus == 'capture') {
//       if (fraudStatus == 'accept') {
//         newStatus = 'paid';
//       }
//     } else if (transactionStatus == 'settlement') {
//       newStatus = 'paid';
//     } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
//       newStatus = 'failed';
//     } else if (transactionStatus == 'pending') {
//       newStatus = 'pending';
//     }
//     console.log(`[|] Status transaksi dari Midtrans: '${transactionStatus}'. Status baru untuk DB: '${newStatus}'.`);
//     // Hanya update database jika ada status baru yang valid untuk diubah
//     if (newStatus && newStatus !== 'pending') {
//       console.log(`[*] Mencoba mengupdate tabel 'transaksi' untuk id: ${orderId}...`);
//       const { error } = await supabaseAdmin.from('transaksi').update({
//         status_pembayaran: newStatus,
//         payment_type: paymentType,
//         midtrans_order_id: midtransOrderId
//       }).eq('id', orderId);
//       if (error) {
//         console.error(`[!] GAGAL update DB untuk order ${orderId}:`, error);
//         return new Response(`DB update failed: ${error.message}`, {
//           status: 500
//         });
//       }
//       console.log(`[✓] SUKSES: Order ${orderId} berhasil diupdate menjadi ${newStatus}.`);
//     } else {
//       console.log(`[i] Tidak ada aksi update untuk status '${transactionStatus}'. Mengirim OK.`);
//     }
//     // ================== AKHIR DARI LOGIKA UPDATE ==================
//     // Kirim response 200 OK ke Midtrans
//     return new Response("OK", {
//       status: 200
//     });
//   } catch (error) {
//     console.error("[!] Error memproses notifikasi:", error.message);
//     return new Response(error.message, {
//       status: 400
//     });
//   }
// });
// KODE DEBUG - Untuk melacak alur update database
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
serve(async (req)=>{
  try {
    const notificationJson = await req.json();
    const serverKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!serverKey) {
      throw new Error("MIDTRANS_SERVER_KEY tidak ditemukan.");
    }
    // 1. Verifikasi Signature Key
    const signatureKey = notificationJson.signature_key;
    const orderId = notificationJson.order_id;
    const statusCode = notificationJson.status_code;
    const grossAmount = notificationJson.gross_amount;
    const stringToHash = orderId + statusCode + grossAmount + serverKey;
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToHash);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b)=>b.toString(16).padStart(2, '0')).join('');
    if (signatureKey !== hash) {
      console.error(`Verifikasi Gagal untuk order ${orderId}! Signature tidak cocok.`);
      return new Response("Invalid signature", {
        status: 403
      });
    }
    // ================== BAGIAN LOGIC DENGAN LOG DETAIL ==================
    console.log(`[OK] Signature untuk order ${orderId} cocok. Memulai proses update...`);
    const transactionStatus = notificationJson.transaction_status;
    const fraudStatus = notificationJson.fraud_status;
    const paymentType = notificationJson.payment_type;
    const midtransOrderId = notificationJson.transaction_id;
    let newStatus;
    console.log(`[INFO] Status dari Midtrans: transaction_status='${transactionStatus}', fraud_status='${fraudStatus}'.`);
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        newStatus = 'paid';
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = 'failed';
    } else if (transactionStatus == 'pending') {
      newStatus = 'pending';
    }
    console.log(`[INFO] Status baru yang akan diupdate ke DB: '${newStatus}'.`);
    // Hanya update database jika ada status baru yang relevan
    if (newStatus && newStatus !== 'pending') {
      console.log(`[*] Mencoba mengupdate tabel 'transaksi' WHERE order_id = ${orderId}...`);
      const { error } = await supabaseAdmin.from('transaksi').update({
        status_pembayaran: newStatus,
        payment_type: paymentType,
        midtrans_order_id: midtransOrderId
      }).eq('order_id', orderId);
      console.log('[DEBUG] Hasil dari Supabase update:', {
        error
      });
      if (error) {
        console.error(`[!] GAGAL update DB untuk order ${orderId}:`, error);
        return new Response(`DB update failed: ${error.message}`, {
          status: 500
        });
      }
      console.log(`[✓] SUKSES: Update DB untuk order ${orderId} berhasil.`);
    } else {
      console.log(`[i] Tidak ada aksi update untuk status '${transactionStatus}'. Proses selesai.`);
    }
    // ================== AKHIR DARI LOGIC DENGAN LOG ==================
    return new Response("OK", {
      status: 200
    });
  } catch (error) {
    console.error("[!] Error tidak terduga di blok catch utama:", error.message);
    return new Response(error.message, {
      status: 400
    });
  }
});
