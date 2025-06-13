<template>
  <div class="section-menu-left">
    <div class="box-logo">
      <a href="index.html" id="site-logo-inner">
        <img class="" id="logo_header" alt="Priangan Florist Logo" src="/user/images/logo/priangan-florist.png"
          data-light="/user/images/logo/priangan-florist.png" data-dark="/user/images/logo/logo-white.svg" />
      </a>
      <div class="button-show-hide">
        <i class="icon-chevron-left"></i>
      </div>
    </div>
    <div class="section-menu-left-wrap">
      <div class="center">
        <div class="center-item">
          <ul>
            <li v-for="(item, index) in computedMenuItems" :key="index" class="menu-item"
              :class="{ 'has-children': item.children, active: item.active }">
              <a :href="item.link" :class="{ 'menu-item-button': item.children }"
                @click.prevent="handleLinkClick(item)">
                <div class="icon" v-html="item.icon"></div>
                <div class="text">{{ item.title }}</div>
              </a>
              <ul v-if="item.children && item.open" class="sub-menu" :style="{ display: 'block' }">
                <li v-for="(child, childIndex) in item.children" :key="childIndex" class="sub-menu-item"
                  :class="{ active: child.active }">
                  <router-link v-if="child.route" :to="{ name: child.route }" :class="{ active: child.active }">
                    <div class="text">{{ child.title }}</div>
                  </router-link>
                  <a v-else :href="child.link" :class="{ active: child.active }">
                    <div class="text">{{ child.title }}</div>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideMenu',
  data() {
    return {
      menuItems: [
        {
          title: 'Ecommerce',
          link: 'index.html',
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2652 3.57566C12.1187 3.42921 11.8813 3.42921 11.7348 3.57566L5.25 10.0605V19.8748C5.25 20.0819 5.41789 20.2498 5.625 20.2498H9V16.1248C9 15.0893 9.83947 14.2498 10.875 14.2498H13.125C14.1605 14.2498 15 15.0893 15 16.1248V20.2498H18.375C18.5821 20.2498 18.75 20.0819 18.75 19.8748V10.0605L12.2652 3.57566ZM20.25 11.5605L21.2197 12.5302C21.5126 12.8231 21.9874 12.8231 22.2803 12.5302C22.5732 12.2373 22.5732 11.7624 22.2803 11.4695L13.3258 2.51499C12.5936 1.78276 11.4064 1.78276 10.6742 2.515L1.71967 11.4695C1.42678 11.7624 1.42678 12.2373 1.71967 12.5302C2.01256 12.8231 2.48744 12.8231 2.78033 12.5302L3.75 11.5605V19.8748C3.75 20.9104 4.58947 21.7498 5.625 21.7498H18.375C19.4105 21.7498 20.25 20.9104 20.25 19.8748V11.5605ZM13.5 20.2498H10.5V16.1248C10.5 15.9177 10.6679 15.7498 10.875 15.7498H13.125C13.3321 15.7498 13.5 15.9177 13.5 16.1248V20.2498Z" fill="currentColor" /></svg>',
          routeName: 'admin',
        },
        {
          title: 'Product',
          link: 'javascript:void(0);',
          icon: '<i class="icon-file-plus"></i>',
          open: undefined, // Initialize as undefined to allow auto-open behavior initially
          children: [
            { title: 'Semua Produk', route: 'list produk' },
            { title: 'Tambah Produk', route: 'tambah produk' },
          ],
        },
        {
          title: 'Kategori',
          link: 'javascript:void(0);',
          icon: '<i class="icon-layers"></i>',
          open: undefined, // Initialize as undefined to allow auto-open behavior initially
          children: [
            { title: 'Semua Kategori', route: 'list kategori' },
            { title: 'Tambah Kategori', route: 'tambah kategori' },
          ],
        },
        {
          title: 'Order',
          link: 'javascript:void(0);',
          icon: '<i class="icon-layers"></i>',
          open: undefined, // Initialize as undefined to allow auto-open behavior initially
          children: [
            { title: 'Order List', route: 'order list' },
            // { title: 'Tambah Kategori', route: 'tambah kategori' },
          ],
        },
      ],
    };
  },
  computed: {
    computedMenuItems() {
      return this.menuItems.map(item => {
        const isParentActive = this.isMenuItemActive(item);
        const hasActiveChild = item.children && item.children.some(child => this.isChildItemActive(child));

        return {
          ...item,
          active: isParentActive || hasActiveChild,
          open: item.open !== undefined ? item.open : hasActiveChild, // Use manual state if set, otherwise auto-open if child is active
          children: item.children ? item.children.map(child => ({
            ...child,
            active: this.isChildItemActive(child)
          })) : undefined
        };
      });
    }
  },
  methods: {
    isMenuItemActive(item) {
      if (item.routeName) {
        return this.$route.name === item.routeName;
      }
      // Also check if current path matches
      if (item.link && item.link !== 'javascript:void(0);') {
        return this.$route.path.includes(item.link.replace('.html', ''));
      }
      return false;
    },
    isChildItemActive(child) {
      // console.log('Checking child:', child.title, 'Route name:', child.route, 'Current route:', this.$route.name);
      if (child.route) {
        return this.$route.name === child.route;
      }
      // Also check path for non-route links
      if (child.link) {
        const linkPath = child.link.replace('.html', '');
        return this.$route.path.includes(linkPath);
      }
      return false;
    },
    handleParentClick(clickedItem) {
      // Find the original item to update its open state
      const originalItem = this.menuItems.find(item => item.title === clickedItem.title);
      if (originalItem && originalItem.children) {
        originalItem.open = !originalItem.open;
      }
    },
    handleLinkClick(clickedItem) {
      // If it has children, toggle the submenu
      if (clickedItem.children) {
        const originalItem = this.menuItems.find(item => item.title === clickedItem.title);
        if (originalItem) {
          originalItem.open = !originalItem.open;
        }
      } else if (clickedItem.routeName) {
        // If it has a route name, use Vue Router
        this.$router.push({ name: clickedItem.routeName });
      } else if (clickedItem.link && clickedItem.link !== 'javascript:void(0);') {
        // If it's a direct link, navigate
        window.location.href = clickedItem.link;
      }
    }
  },
  mounted() {
    // console.log('Current route:', this.$route);
    // console.log('Menu items:', this.computedMenuItems);
  }
};
</script>

<style scoped></style>