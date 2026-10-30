<script setup lang="ts">
export interface PostCreationAction {
  icon: string;
  label: string;
  description: string;
  color: 'success' | 'info' | 'secondary';
  to?: string;
  href?: string;
  onSelect?: () => void;
}

const open = defineModel<boolean>('open', { default: false });

defineProps<{
  title: string;
  subtitle: string;
  actions: PostCreationAction[];
  dismissLabel: string;
}>();

const iconClasses = {
  success: 'bg-success',
  info: 'bg-info',
  secondary: 'bg-secondary'
};

const cardClasses = {
  success: 'border-success bg-success/5 hover:bg-success/10',
  info: 'border-info bg-info/5 hover:bg-info/10',
  secondary: 'border-secondary bg-secondary/5 hover:bg-secondary/10'
};
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'max-w-100 rounded-[20px]',
      header: 'bg-linear-to-br from-success to-green-600',
      close: 'text-white hover:bg-white/20'
    }"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <span class="size-9 bg-white/20 rounded-full flex items-center justify-center">
          <UIcon
            name="i-lucide-circle-check"
            class="size-4.5 text-white"
          />
        </span>
        <div>
          <p class="text-sm font-extrabold text-white">
            {{ title }}
          </p>
          <p class="text-[11px] text-white/80 mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="flex flex-col gap-3">
        <ULink
          v-for="action in actions"
          :key="action.label"
          :to="action.to ?? action.href"
          :external="Boolean(action.href)"
          class="group w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 text-left transition-colors"
          :class="cardClasses[action.color]"
          @click="action.onSelect?.(); open = false"
        >
          <span
            class="size-10 rounded-[10px] flex items-center justify-center shrink-0 shadow-sm"
            :class="iconClasses[action.color]"
          >
            <UIcon
              :name="action.icon"
              class="size-4.5 text-white"
            />
          </span>
          <span>
            <span class="block text-[13px] font-bold text-highlighted">{{ action.label }}</span>
            <span class="block text-[11px] text-muted mt-0.5">{{ action.description }}</span>
          </span>
          <UIcon
            name="i-lucide-arrow-right"
            class="ml-auto size-4 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </ULink>
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          class="self-center text-dimmed"
          :label="dismissLabel"
          @click="open = false"
        />
      </div>
    </template>
  </UModal>
</template>
