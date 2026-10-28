<script lang="ts" setup>
definePageMeta({
  i18nTitle: 'invoice.detail.title'
});

const route = useRoute();
const invoiceId = computed(() => Number(route.params.id));
</script>

<template>
  <InvoicesDetail :invoice-id="invoiceId" />
</template>
