<script lang="ts" setup>
definePageMeta({
  i18nTitle: 'quote.detail.title'
});

const route = useRoute();
const quoteId = computed(() => Number(route.params.id));
</script>

<template>
  <QuotesDetail :quote-id="quoteId" />
</template>
