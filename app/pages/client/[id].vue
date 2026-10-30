<script lang="ts" setup>
definePageMeta({
  i18nTitle: 'client.detail.title'
});

const route = useRoute();
const clientId = computed(() => Number(route.params.id));
</script>

<template>
  <ClientsDetail :client-id="clientId" />
</template>
