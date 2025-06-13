// // KODE FINAL - Siap Digunakan
// import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
// };
// serve(async (req)=>{
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', {
//       headers: corsHeaders
//     });
//   }
//   try {
//     const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
//       global: {
//         headers: {
//           Authorization: req.headers.get('Authorization')
//         }
//       }
//     });
//     const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY');
//     if (!midtransServerKey) {
//       throw new Error('MIDTRANS_SERVER_KEY tidak ditemukan di secrets.');
//     }
//     const { cart_items, address_id } = await req.json();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       throw new Error("Pengguna tidak ditemukan. Mohon login kembali.");
//     }
//     const productIds = cart_items.map((item)=>item.produk_id);
//     const { data: products, error: productError } = await supabase.from('produk').select('id, nama_produk, harga, stok').in('id', productIds);
//     if (productError) throw productError;
//     let totalHarga = 0;
//     const itemDetailsForMidtrans = cart_items.map((item)=>{
//       const product = products.find((p)=>p.id === item.produk_id);
//       if (!product || product.stok < item.jumlah) {
//         throw new Error(`Stok untuk produk ${product?.nama_produk || 'N/A'} tidak mencukupi`);
//       }
//       totalHarga += product.harga * item.jumlah;
//       return {
//         id: product.id.toString(),
//         price: product.harga,
//         quantity: item.jumlah,
//         name: product.nama_produk
//       };
//     });
//     const { data: shippingAddress, error: addressError } = await supabase.from('alamat_pengguna').select('*').eq('id', address_id).single();
//     if (addressError) throw addressError;
//     // Validasi untuk memastikan alamat ditemukan
//     if (!shippingAddress) {
//       throw new Error(`Alamat dengan ID ${address_id} tidak ditemukan.`);
//     }
//     const biayaPengiriman = 15000;
//     // Menambahkan biaya pengiriman sebagai item terpisah
//     itemDetailsForMidtrans.push({
//       id: 'SHIPPING_COST',
//       price: biayaPengiriman,
//       quantity: 1,
//       name: 'Biaya Pengiriman'
//     });
//     const totalFinal = totalHarga + biayaPengiriman;
//     // Membuat entri di tabel 'transaksi'
//     const { data: transaction, error: trxError } = await supabase.from('transaksi').insert({
//       id_kustomer: user.id,
//       total_harga: totalHarga,
//       biaya_pengiriman: biayaPengiriman,
//       pengiriman_nama_penerima: shippingAddress.nama_penerima,
//       pengiriman_no_telp: shippingAddress.no_telp_penerima,
//       pengiriman_alamat_lengkap: shippingAddress.alamat_lengkap,
//       pengiriman_kota: shippingAddress.kota,
//       pengiriman_provinsi: shippingAddress.provinsi,
//       pengiriman_kode_pos: shippingAddress.kode_pos
//     }).select().single();
//     if (trxError) throw trxError;
//     // Membuat entri di tabel 'detail_transaksi'
//     const detailToInsert = cart_items.map((item)=>{
//       const product = products.find((p)=>p.id === item.produk_id);
//       return {
//         id_transaksi: transaction.id,
//         id_produk: item.produk_id,
//         jumlah: item.jumlah,
//         harga_satuan: product.harga,
//         nama_produk: product.nama_produk
//       };
//     });
//     await supabase.from('detail_transaksi').insert(detailToInsert);
//     // Menyiapkan parameter untuk Midtrans
//     const parameter = {
//       transaction_details: {
//         order_id: transaction.id.toString(),
//         gross_amount: totalFinal
//       },
//       item_details: itemDetailsForMidtrans,
//       customer_details: {
//         first_name: shippingAddress.nama_penerima,
//         email: user.email,
//         phone: shippingAddress.no_telp_penerima
//       }
//     };
//     // Memanggil API Midtrans menggunakan fetch
//     const midtransApiUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions';
//     const encodedServerKey = btoa(midtransServerKey + ':');
//     const response = await fetch(midtransApiUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Basic ${encodedServerKey}`
//       },
//       body: JSON.stringify(parameter)
//     });
//     const midtransResponse = await response.json();
//     if (!response.ok) {
//       throw new Error(`Gagal membuat transaksi Midtrans: ${JSON.stringify(midtransResponse)}`);
//     }
//     // Mengirim response sukses ke Vue
//     return new Response(JSON.stringify(midtransResponse), {
//       headers: {
//         ...corsHeaders,
//         'Content-Type': 'application/json'
//       },
//       status: 200
//     });
//   } catch (error) {
//     // Mengirim response error yang jelas
//     return new Response(JSON.stringify({
//       error: error.message
//     }), {
//       headers: {
//         ...corsHeaders,
//         'Content-Type': 'application/json'
//       },
//       status: 400
//     });
//   }
// });
// KODE FINAL - create-transaction
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
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
    const midtransServerKey = Deno.env.get('MIDTRANS_SERVER_KEY');
    if (!midtransServerKey) {
      throw new Error('MIDTRANS_SERVER_KEY tidak ditemukan di secrets.');
    }
    const { cart_items, address_id } = await req.json();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Pengguna tidak ditemukan. Mohon login kembali.");
    }
    const productIds = cart_items.map((item)=>item.produk_id);
    const { data: products, error: productError } = await supabase.from('produk').select('id, nama_produk, harga, stok').in('id', productIds);
    if (productError) throw productError;
    let totalHarga = 0;
    const itemDetailsForMidtrans = cart_items.map((item)=>{
      const product = products.find((p)=>p.id === item.produk_id);
      if (!product || product.stok < item.jumlah) {
        throw new Error(`Stok untuk produk ${product?.nama_produk || 'N/A'} tidak mencukupi`);
      }
      totalHarga += product.harga * item.jumlah;
      return {
        id: product.id.toString(),
        price: product.harga,
        quantity: item.jumlah,
        name: product.nama_produk
      };
    });
    const { data: shippingAddress, error: addressError } = await supabase.from('alamat_pengguna').select('*').eq('id', address_id).single();
    if (addressError || !shippingAddress) {
      throw new Error(`Alamat dengan ID ${address_id} tidak ditemukan.`);
    }
    const biayaPengiriman = 15000;
    itemDetailsForMidtrans.push({
      id: 'SHIPPING_COST',
      price: biayaPengiriman,
      quantity: 1,
      name: 'Biaya Pengiriman'
    });
    const totalFinal = totalHarga + biayaPengiriman;
    // Membuat Order ID unik, contoh: 'FYRO-1749757642000'
    const newOrderId = `FYROO-${Date.now()}`;
    const { data: transaction, error: trxError } = await supabase.from('transaksi').insert({
      order_id: newOrderId,
      id_kustomer: user.id,
      total_harga: totalHarga,
      biaya_pengiriman: biayaPengiriman,
      pengiriman_nama_penerima: shippingAddress.nama_penerima,
      pengiriman_no_telp: shippingAddress.no_telp_penerima,
      pengiriman_alamat_lengkap: shippingAddress.alamat_lengkap,
      pengiriman_kota: shippingAddress.kota,
      pengiriman_provinsi: shippingAddress.provinsi,
      pengiriman_kode_pos: shippingAddress.kode_pos
    }).select('id').single();
    if (trxError) throw trxError;
    const detailToInsert = cart_items.map((item)=>{
      const product = products.find((p)=>p.id === item.produk_id);
      return {
        id_transaksi: transaction.id,
        id_produk: item.produk_id,
        jumlah: item.jumlah,
        harga_satuan: product.harga,
        nama_produk: product.nama_produk
      };
    });
    await supabase.from('detail_transaksi').insert(detailToInsert);
    const parameter = {
      transaction_details: {
        order_id: newOrderId,
        gross_amount: totalFinal
      },
      item_details: itemDetailsForMidtrans,
      customer_details: {
        first_name: shippingAddress.nama_penerima,
        email: user.email,
        phone: shippingAddress.no_telp_penerima
      }
    };
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
      throw new Error(`Gagal membuat transaksi Midtrans: ${JSON.stringify(midtransResponse)}`);
    }
    return new Response(JSON.stringify(midtransResponse), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
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
