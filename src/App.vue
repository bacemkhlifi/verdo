<template>
  <router-view />
</template>

<script>
import i18n from './i18n';

export default {
  created() {
    const currentLocale = localStorage.getItem('language');
    if (currentLocale) {
      i18n.locale = currentLocale;
    }
  }
}
</script>
