<script lang="ts" setup>
definePageMeta({
  i18nTitle: 'worksite.detail.title'
});

const route = useRoute();
const worksiteId = computed(() => Number(route.params.id));
</script>

<template>
  <WorksitesDetail :worksite-id="worksiteId" />
</template>
