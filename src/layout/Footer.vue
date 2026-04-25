<template>
  <footer class="bg-gray-900 text-white p-6 text-center">
    <p>© {{ currentYear }} IT Consulting. All rights reserved.</p>

    <div class="mt-3 space-x-4">
      <router-link to="/about">About</router-link>
      <router-link to="/opportunities">Opportunities</router-link>
      <router-link to="/how-it-works">How it works</router-link>
      <router-link to="/impact">Impact</router-link>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
  computed: {
    currentYear() {
      return new Date().getFullYear();
    },
  },
};
</script>