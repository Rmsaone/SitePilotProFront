<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui';

interface BillingRow {
  period: string;
  amount: string;
  status: string;
}

// No subscription API yet: the plan, usage and billing history are static, as in the mockup.
const { t } = useI18n();

const usage = computed(() => [
  { label: t('account.subscription.activeWorksites'), used: '8', max: t('account.subscription.unlimited'), percent: null },
  { label: t('account.subscription.users'), used: '3', max: '10', percent: 30 },
  { label: t('account.subscription.storage'), used: '2,3 Go', max: '10 Go', percent: 23 }
]);

const billingHistory = computed<BillingRow[]>(() => ['Juin 2026', 'Mai 2026', 'Avril 2026', 'Mars 2026'].map(period => ({
  period,
  amount: '89,00 €',
  status: t('account.subscription.paid')
})));

const columns = computed<TableColumn<BillingRow>[]>(() => [
  { accessorKey: 'period', header: t('account.subscription.period') },
  { accessorKey: 'amount', header: t('account.subscription.amount'), meta: { class: { td: 'font-semibold text-highlighted' } } },
  { accessorKey: 'status', header: t('account.subscription.status') },
  { id: 'invoice', header: t('account.subscription.invoice') }
]);
</script>

<template>
  <div class="flex flex-col gap-5">
    <AccountCard
      :title="t('account.subscription.currentPlan')"
      icon="i-lucide-credit-card"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="size-14 rounded-xl bg-primary-700 flex items-center justify-center shadow-[0_4px_12px_rgba(30,58,95,0.3)]">
            <UIcon
              name="i-lucide-trending-up"
              class="size-5.5 text-secondary"
            />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <p class="text-[17px] font-extrabold text-highlighted">
                {{ t('account.subscription.planName') }}
              </p>
              <UBadge
                color="success"
                variant="subtle"
                size="sm"
                class="rounded-full uppercase font-bold"
                :label="t('account.subscription.active')"
              />
            </div>
            <p class="text-[13px] text-muted mt-0.5">
              {{ t('account.subscription.planFeatures') }}
            </p>
            <p class="text-xs text-dimmed mt-1">
              {{ t('account.subscription.renewal') }}
              <strong class="text-toned">{{ t('account.subscription.renewalDate') }}</strong>
            </p>
          </div>
        </div>
        <div class="sm:text-right">
          <p class="text-[26px] font-extrabold text-highlighted">
            {{ t('account.subscription.price') }}
            <span class="text-sm text-muted font-normal">{{ t('account.subscription.perMonth') }}</span>
          </p>
          <p class="text-[11px] text-dimmed">
            {{ t('account.subscription.billingInfo') }}
          </p>
        </div>
      </div>
    </AccountCard>

    <AccountCard
      :title="t('account.subscription.usage')"
      icon="i-lucide-trending-up"
    >
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          v-for="item in usage"
          :key="item.label"
          class="flex flex-col gap-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-toned">{{ item.label }}</span>
            <span class="text-[11px] text-dimmed">{{ item.used }} / {{ item.max }}</span>
          </div>
          <UProgress
            v-if="item.percent !== null"
            :model-value="item.percent"
            color="secondary"
            size="xs"
          />
        </div>
      </div>
    </AccountCard>

    <AccountCard
      :title="t('account.subscription.billingHistory')"
      icon="i-lucide-receipt"
    >
      <template #actions>
        <UButton
          variant="link"
          color="secondary"
          size="xs"
          :label="t('account.subscription.downloadAll')"
        />
      </template>

      <UTable
        :data="billingHistory"
        :columns="columns"
        class="-mx-6 -my-5"
        :ui="{ th: 'text-[11px] uppercase tracking-[0.05em] text-muted px-6', td: 'text-[13px] px-6' }"
      >
        <template #status-cell="{ row }">
          <UBadge
            color="success"
            variant="subtle"
            :label="row.original.status"
          />
        </template>
        <template #invoice-cell>
          <UButton
            variant="ghost"
            color="neutral"
            size="xs"
            icon="i-lucide-file-text"
            label="PDF"
          />
        </template>
      </UTable>
    </AccountCard>
  </div>
</template>
