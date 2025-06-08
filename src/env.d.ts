/// <reference types="vite/client" />

declare global {
  interface Window {
    $: any;
    jQuery: any;
    Swiper: any;
    initializeUserTemplate: () => void;
    initializeAdminTemplate: () => void;
    loadedAssets: {
      css: Set<string>;
      js: Set<string>;
    };
  }
}

export {}