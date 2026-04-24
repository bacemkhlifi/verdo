<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        <!-- Contact -->
        <div class="text-center sm:text-left">
          <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider">
            {{ $t('footer.contact.title') }}
          </h3>

          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 justify-center sm:justify-start">
              <span>📧</span>
              <a :href="'mailto:' + $t('footer.contact.email')" class="hover:text-green-500">
                {{ $t('footer.contact.email') }}
              </a>
            </div>

            <div class="flex items-center gap-2 justify-center sm:justify-start">
              <span>📞</span>
              <a :href="'tel:' + $t('footer.contact.phone')" class="hover:text-green-500">
                {{ $t('footer.contact.phone') }}
              </a>
            </div>

            <div class="flex items-center gap-2 justify-center sm:justify-start">
              <span>📍</span>
              <span>{{ $t('footer.contact.address') }}</span>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div class="text-center sm:text-left">
          <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider">
            {{ $t('footer.quickLinks.title') }}
          </h3>

          <ul class="space-y-1 text-sm">
            <li><router-link to="/about" class="hover:text-green-500">About</router-link></li>
            <li><router-link to="/opportunities" class="hover:text-green-500">Opportunities</router-link></li>
            <li><router-link to="/how-it-works" class="hover:text-green-500">How it works</router-link></li>
            <li><router-link to="/impact" class="hover:text-green-500">Impact</router-link></li>
          </ul>
        </div>

        <!-- Social -->
        <div class="text-center sm:text-left" :class="{ 'text-right': currentLocale === 'ar' }">
          <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider">
            {{ $t('footer.social.title') }}
          </h3>

          <div class="flex space-x-4 justify-center sm:justify-start">
            <a href="https://www.facebook.com/share/1B5MmomTEY/" target="_blank" class="hover:text-green-500">
              Facebook
            </a>

            <a href="https://wa.me/21623965219" target="_blank" class="hover:text-green-500">
              WhatsApp
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="text-center sm:text-left">
          <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider">
            {{ $t('footer.newsletter.title') }}
          </h3>

          <form @submit.prevent="subscribeNewsletter" class="space-y-2 max-w-xs mx-auto sm:mx-0">
            <input
              type="email"
              v-model="email"
              :placeholder="$t('footer.newsletter.placeholder')"
              class="w-full px-3 py-1.5 rounded bg-gray-800 border border-gray-700 text-sm"
            />

            <button
              type="submit"
              class="w-full px-3 py-1.5 bg-green-600 rounded text-sm hover:bg-green-700"
            >
              {{ $t('footer.newsletter.button') }}
            </button>
          </form>
        </div>

      </div>

      <!-- Bottom -->
      <div class="mt-6 pt-4 border-t border-gray-800 text-center">
        <p class="text-gray-400 text-xs">
          © {{ currentYear }} IT Consulting. All rights reserved.
        </p>

        <p class="text-gray-500 text-xs mt-1">
          Built with ❤️ by IT Consulting
        </p>
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
    },
    currentLocale() {
      return this.$i18n?.locale || localStorage.getItem("language") || "en";
    }
  },

  methods: {
    subscribeNewsletter() {
      console.log("Newsletter:", this.email);
      this.email = "";
    }
  }
};
</script>

<style scoped>
.router-link-active {
  color: #10B981;
}
</style>