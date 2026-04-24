<template>
  <router-view />
</template>

<script>
import i18n from "./i18n";

export default {
  name: "App",
  created() {
    const currentLocale = localStorage.getItem("language");
    if (currentLocale) {
      i18n.locale = currentLocale;
    }
  },
};
</script>