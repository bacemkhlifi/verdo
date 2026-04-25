<template>
  <div class="theme-shell min-h-screen flex flex-col">
    <Header />

    <main class="flex-1 pt-24 md:pt-28">
      <router-view />
    </main>
    <div style="background:red;color:white;padding:20px;text-align:center">
  DEPLOY TEST FOOTER AREA
</div>

    <Footer />
  </div>
</template>

<script>
import Header from "./Header.vue";
import Footer from './Footer.vue';

export default {
  name: "DefaultLayout",
  components: {
    Header,
    Footer
  },
};
</script>