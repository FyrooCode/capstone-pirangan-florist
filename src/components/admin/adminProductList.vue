<template>

    <div class="main-content">
        <!-- main-content-wrap -->
        <div class="main-content-inner">
            <!-- main-content-wrap -->
            <div class="main-content-wrap">
                <div class="flex items-center flex-wrap justify-between gap20 mb-30">
                    <h3>All Products</h3>
                    <ul class="breadcrumbs flex items-center flex-wrap justify-start gap10">
                        <li>
                            <a href="index.html">
                                <div class="text-tiny">Dashboard</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <a href="product-list.html#">
                                <div class="text-tiny">Product</div>
                            </a>
                        </li>
                        <li>
                            <i class="icon-chevron-right"></i>
                        </li>
                        <li>
                            <div class="text-tiny">All Products</div>
                        </li>
                    </ul>
                </div>
                <!-- product-list -->
                <div class="wg-box">
                    <div class="title-box">
                        <i class="icon-coffee"></i>
                        <div class="body-text">Tip search by Product ID: Each product is provided with a unique ID,
                            which you can rely on to find the exact product you need.</div>
                    </div>
                    <div class="flex items-center justify-between gap10 flex-wrap">
                        <div class="wg-filter flex-grow">
                            <div class="show">
                                <div class="text-tiny">Showing</div>
                                <div class="select">
                                    <select class="">
                                        <option>10</option>
                                        <option>20</option>
                                        <option>30</option>
                                    </select>
                                </div>
                                <div class="text-tiny">entries</div>
                            </div>
                            <form class="form-search" @submit.prevent="handleSearch">
                                <fieldset class="name">
                                    <input v-model="searchQuery" type="text" placeholder="Search here..." class=""
                                        name="name" tabindex="2" aria-required="true">
                                </fieldset>
                                <div class="button-submit">
                                    <button class="" type="submit"><i class="icon-search"></i></button>
                                </div>
                            </form>
                        </div>
                        <a class="tf-button style-1 w208" href="add-product.html"><i class="icon-plus"></i>Add new</a>
                    </div>
                    <div class="wg-table table-product-list">
                        <ul class="table-title flex gap20 mb-14">
                            <li>
                                <div class="body-title">Product</div>
                            </li>
                            <li>
                                <div class="body-title">Product ID</div>
                            </li>
                            <li>
                                <div class="body-title">Price</div>
                            </li>
                            <li>
                                <div class="body-title">Quantity</div>
                            </li>
                            <li>
                                <div class="body-title">Sale</div>
                            </li>
                            <li>
                                <div class="body-title">Stock</div>
                            </li>
                            <li>
                                <div class="body-title">Start date</div>
                            </li>
                            <li>
                                <div class="body-title">Action</div>
                            </li>
                        </ul>
                        <ul class="flex flex-column">
                            <li v-if="isLoading" class="wg-product item-row gap20">
                                <div class="body-text">Loading products...</div>
                            </li>
                            <li v-else-if="products.length === 0" class="wg-product item-row gap20">
                                <div class="body-text">No products found.</div>
                            </li>
                            <li v-else v-for="product in filteredProducts" :key="product.id"
                                class="wg-product item-row gap20">
                                <div class="name">
                                    <div class="image">
                                        <img v-if="product.image_urls && product.image_urls.length > 0"
                                            :src="product.image_urls[0]" :alt="product.nama_produk"
                                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                        <div v-else
                                            style="width: 50px; height: 50px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999;">
                                            No Image
                                        </div>
                                    </div>
                                    <div class="title line-clamp-2 mb-0">
                                        <span class="body-text">{{ product.nama_produk }}</span>
                                    </div>
                                </div>
                                <div class="body-text text-main-dark mt-4">#{{ product.id }}</div>
                                <div class="body-text text-main-dark mt-4">${{ formatPrice(product.harga) }}</div>
                                <div class="body-text text-main-dark mt-4">{{ product.stok }}</div>
                                <div class="body-text text-main-dark mt-4">0</div> <!-- Sales data placeholder -->
                                <div>
                                    <div v-if="product.stok > 0" class="block-available bg-1 fw-7">In Stock</div>
                                    <div v-else class="block-stock bg-1 fw-7">Out of stock</div>
                                </div>
                                <div class="body-text text-main-dark mt-4">{{ formatDate(product.created_at) }}</div>
                                <div class="list-icon-function">
                                    <div class="item eye" @click="viewProduct(product)" title="View">
                                        <i class="icon-eye"></i>
                                    </div>
                                    <div class="item edit" @click="editProduct(product)" title="Edit">
                                        <i class="icon-edit-3"></i>
                                    </div>
                                    <div class="item trash" @click="deleteProduct(product)" title="Delete">
                                        <i class="icon-trash-2"></i>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="divider"></div>
                    <div class="flex items-center justify-between flex-wrap gap10">
                        <div class="text-tiny">Showing {{ filteredProducts.length }} of {{ products.length }} entries
                        </div>
                        <div v-if="errorMessage" class="text-tiny" style="color: red;">{{ errorMessage }}</div>
                        <!-- Pagination can be implemented later for large datasets -->
                    </div>
                </div>
                <!-- /product-list -->
            </div>
            <!-- /main-content-wrap -->
        </div>
        <!-- /main-content-wrap -->
        <!-- bottom-page -->
        <div class="bottom-page">
            <div class="body-text">Copyright © 2024 <a href="https://themesflat.co/html/ecomus/index.html">Ecomus</a>.
                Design by Themesflat All rights reserved</div>
        </div>
        <!-- /bottom-page -->
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../../utils/supabase';

// Reactive data
const products = ref([]);
const searchQuery = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

// Computed property for filtered products
const filteredProducts = computed(() => {
    if (!searchQuery.value.trim()) {
        return products.value;
    }
    const query = searchQuery.value.toLowerCase();
    return products.value.filter(product =>
        product.nama_produk.toLowerCase().includes(query) ||
        product.id.toString().includes(query) ||
        (product.deskripsi && product.deskripsi.toLowerCase().includes(query)) ||
        (product.kategori && product.kategori.nama_kategori.toLowerCase().includes(query))
    );
});

// Fetch products from Supabase
const fetchProducts = async () => {
    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { data, error } = await supabase
            .from('produk')
            .select(`
                id,
                nama_produk,
                deskripsi,
                harga,
                stok,
                image_urls,
                created_at,
                kategori:kategori_id (
                    id,
                    nama_kategori
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        products.value = data || [];
    } catch (error) {
        errorMessage.value = `Error fetching products: ${error.message}`;
        console.error('Error:', error);
    } finally {
        isLoading.value = false;
    }
};

// Search handler
const handleSearch = () => {
    // The filtering is handled by the computed property
    // This function can be used for additional search logic if needed
};

// Utility functions
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });
};

// Product actions
const viewProduct = (product) => {
    console.log('View product:', product);
    // TODO: Implement view functionality
    alert(`Viewing product: ${product.nama_produk}`);
};

const editProduct = (product) => {
    console.log('Edit product:', product);
    // TODO: Implement edit functionality
    alert(`Edit product: ${product.nama_produk}`);
};

const deleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.nama_produk}"?`)) {
        return;
    }

    try {
        // Delete associated images from storage first
        if (product.image_urls && product.image_urls.length > 0) {
            // Extract file paths from URLs for deletion
            const filePaths = product.image_urls.map(url => {
                // Extract the path from the URL
                const urlParts = url.split('/');
                const pathIndex = urlParts.findIndex(part => part === 'gambar-produk');
                if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
                    return urlParts.slice(pathIndex + 1).join('/');
                }
                return null;
            }).filter(path => path !== null);

            // Delete files from storage
            if (filePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('gambar-produk')
                    .remove(filePaths);

                if (storageError) {
                    console.error('Error deleting images:', storageError);
                    // Continue with product deletion even if image deletion fails
                }
            }
        }

        // Delete the product from database
        const { error } = await supabase
            .from('produk')
            .delete()
            .eq('id', product.id);

        if (error) throw error;

        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list
    } catch (error) {
        alert(`Error deleting product: ${error.message}`);
        console.error('Error:', error);
    }
};

// Load products when component mounts
onMounted(() => {
    fetchProducts();
});
</script>