<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 py-8">

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">

        <!-- Contact -->
        <div>
          <h3 class="font-semibold mb-3 uppercase">
            {{ safeT('footer.contact.title', 'Contact') }}
          </h3>

          <div class="space-y-2">
            <div>📧 {{ safeT('footer.contact.email', 'contact@verdolive.tn') }}</div>
            <div>📞 {{ safeT('footer.contact.phone', '+216 ...') }}</div>
            <div>📍 {{ safeT('footer.contact.address', 'Tunisia') }}</div>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h3 class="font-semibold mb-3 uppercase">
            {{ safeT('footer.quickLinks.title', 'Quick Links') }}
          </h3>

          <ul class="space-y-1">
            <li><router-link to="/about">About</router-link></li>
            <li><router-link to="/opportunities">Opportunities</router-link></li>
            <li><router-link to="/how-it-works">How it works</router-link></li>
            <li><router-link to="/impact">Impact</router-link></li>
          </ul>
        </div>

        <!-- Social -->
        <div>
          <h3 class="font-semibold mb-3 uppercase">
            {{ safeT('footer.social.title', 'Social') }}
          </h3>

          <div class="space-x-4">
            <a href="https://www.facebook.com" target="_blank">Facebook</a>
            <a href="https://wa.me/21623965219" target="_blank">WhatsApp</a>
          </div>
        </div>

        <!-- Newsletter -->
        <div>
          <h3 class="font-semibold mb-3 uppercase">
            {{ safeT('footer.newsletter.title', 'Newsletter') }}
          </h3>

          <form @submit.prevent="subscribeNewsletter" class="space-y-2">
            <input
              type="email"
              v-model="email"
              placeholder="Enter email"
              class="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700"
            />

            <button class="w-full bg-green-600 py-2 rounded hover:bg-green-700">
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <!-- Bottom -->
      <div class="mt-6 pt-4 border-t border-gray-700 text-center text-xs">
        <p>© {{ currentYear }} IT Consulting. All rights reserved.</p>
        <p class="mt-1 text-gray-400">Built with ❤️ by IT Consulting</p>
      </div>

    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",

  data() {
    return {
      email: ""
    };
  },

  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  },

  methods: {
    subscribeNewsletter() {
      console.log("Newsletter:", this.email);
      this.email = "";
    },

    // SAFE translation fallback (important for production)
    safeT(key, fallback) {
      try {
        return this.$t ? this.$t(key) : fallback;
      } catch {
        return fallback;
      }
    }
  }
};
</script>

<style scoped>
.router-link-active {
  color: #10B981;
}
</style>