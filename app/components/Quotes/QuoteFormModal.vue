<script setup lang="ts">
import { z } from 'zod';
import type { Paginated, Resource } from '~/components/Tables/Types/api.interface';
import { formatEuros, toEuros } from '~/components/Tables/utils/moneyUtils';
import { type QuoteClient, type QuoteDetail, quoteClientName } from '~/components/Quotes/Types/quote.interface';
import {
  QuoteStatusEnum,
  TvaRateEnum,
  TvaRateLabelMap,
  TvaRateMap,
  UnitEnum,
  UnitShortLabelMap
} from '~/components/Quotes/Types/quoteStatusEnum';

interface CategoryItem {
  key: string;
  type: 'category';
  name: string;
}

interface LineItem {
  key: string;
  type: 'line';
  description: string;
  quantity: number | undefined;
  unit: UnitEnum;
  unit_price_ht: number | undefined;
}

type Item = CategoryItem | LineItem;

const MIN_VALIDITY_MONTHS = 3;

const open = defineModel<boolean>('open', { default: false });

const props = defineProps<{
  /** null to create a quote */
  quoteId: number | null;
  /** Preselected client / worksite (from a worksite or client page) */
  clientId?: number | null;
  worksiteId?: number | null;
}>();

const emit = defineEmits<{
  saved: [quote: QuoteDetail, created: boolean];
}>();

const { t } = useI18n();
const dayjs = useDayjs();
const client = useSanctumClient();
const { handle } = useApiErrors();

const isEdit = computed(() => props.quoteId !== null);
const loading = ref(false);
const submitting = ref<QuoteStatusEnum | null>(null);
const clients = ref<QuoteClient[]>([]);
const worksites = ref<{ id: number; name_worksite: string }[]>([]);

const header = reactive({
  client_id: undefined as number | undefined,
  worksite_id: undefined as number | undefined,
  issue_date: '',
  validity_date: '',
  tva_rate: TvaRateEnum.Taux20,
  quote_status: QuoteStatusEnum.Draft
});
const items = ref<Item[]>([]);
const errors = ref<Record<string, string | undefined>>({});
const attempted = ref(false);

let counter = 0;
const uid = () => `item-${++counter}`;
const newLine = (): LineItem => ({ key: uid(), type: 'line', description: '', quantity: undefined, unit: UnitEnum.M2, unit_price_ht: undefined });
const newCategory = (name: string): CategoryItem => ({ key: uid(), type: 'category', name });

const minValidity = computed(() => header.issue_date
  ? dayjs(header.issue_date).add(MIN_VALIDITY_MONTHS, 'month').format('YYYY-MM-DD')
  : undefined);

const clientItems = computed(() => clients.value.map(item => ({ value: item.id, label: quoteClientName(item), description: item.email })));
const worksiteItems = computed(() => worksites.value.map(item => ({ value: item.id, label: item.name_worksite })));
const unitItems = Object.values(UnitEnum).map(value => ({ value, label: UnitShortLabelMap.get(value) ?? value }));
const tvaItems = Array.from(TvaRateLabelMap.entries()).map(([value, label]) => ({ value, label }));

const lineTotal = (item: Item) => item.type === 'line' ? (item.quantity ?? 0) * (item.unit_price_ht ?? 0) : 0;
const totalHt = computed(() => items.value.reduce((total, item) => total + lineTotal(item), 0));
const tvaPercent = computed(() => TvaRateMap[header.tva_rate] ?? 0);
const tvaAmount = computed(() => totalHt.value * tvaPercent.value / 100);
const totalTtc = computed(() => totalHt.value + tvaAmount.value);

async function loadWorksites(clientId: number | undefined): Promise<void> {
  worksites.value = [];

  if (!clientId) {
    return;
  }

  const response = await client<Paginated<{ id: number; name_worksite: string }>>('/api/v1/worksites', {
    query: { client_id: clientId, per_page: 100 }
  });
  worksites.value = response.data;
}

watch(() => header.client_id, async (clientId, previous) => {
  if (previous !== undefined && clientId !== previous) {
    header.worksite_id = undefined;
  }

  try {
    await loadWorksites(clientId);
  } catch (error) {
    handle(error);
  }
});

watch(() => header.issue_date, () => {
  if (header.validity_date && minValidity.value && header.validity_date < minValidity.value) {
    header.validity_date = '';
  }
});

function itemsFromQuote(quote: QuoteDetail): Item[] {
  const result: Item[] = [];
  let currentCategory: string | null = null;

  for (const line of quote.product_lines) {
    if (line.category && line.category !== currentCategory) {
      result.push(newCategory(line.category));
    }
    currentCategory = line.category;
    result.push({
      key: uid(),
      type: 'line',
      description: line.description,
      quantity: Number(line.quantity),
      unit: line.unit,
      unit_price_ht: toEuros(line.unit_price_ht)
    });
  }

  return result;
}

async function load(): Promise<void> {
  loading.value = true;
  errors.value = {};
  attempted.value = false;
  Object.assign(header, {
    client_id: props.clientId ?? undefined,
    worksite_id: props.worksiteId ?? undefined,
    issue_date: dayjs().format('YYYY-MM-DD'),
    validity_date: '',
    tva_rate: TvaRateEnum.Taux20,
    quote_status: QuoteStatusEnum.Draft
  });
  items.value = [newCategory(t('quote.form.defaultCategory')), newLine()];

  try {
    const [clientResponse, quoteResponse] = await Promise.all([
      client<Paginated<QuoteClient>>('/api/v1/clients', { query: { per_page: 100 } }),
      props.quoteId !== null
        ? client<Resource<QuoteDetail>>(`/api/v1/quotes/${props.quoteId}`)
        : Promise.resolve(null)
    ]);

    clients.value = clientResponse.data;

    if (quoteResponse) {
      const quote = quoteResponse.data;
      Object.assign(header, {
        client_id: quote.client?.id,
        worksite_id: quote.worksites?.[0]?.id,
        issue_date: quote.issue_date,
        validity_date: quote.validity_date,
        tva_rate: quote.tva_rate,
        quote_status: quote.quote_status
      });
      items.value = itemsFromQuote(quote);
    }
  } catch (error) {
    handle(error);
  } finally {
    loading.value = false;
  }
}

watch(open, (value) => {
  if (value) {
    load();
  }
});

function addCategory(): void {
  items.value.push(newCategory(t('quote.form.newCategory')), newLine());
}

/** Adds a line at the end of the given category block (or at the end of the quote). */
function addLine(categoryKey?: string): void {
  if (!categoryKey) {
    items.value.push(newLine());

    return;
  }

  const start = items.value.findIndex(item => item.key === categoryKey);
  const nextCategory = items.value.findIndex((item, index) => index > start && item.type === 'category');
  items.value.splice(nextCategory === -1 ? items.value.length : nextCategory, 0, newLine());
}

function remove(key: string): void {
  items.value = items.value.filter(item => item.key !== key);
}

/** Flattens categories into the `category` field expected by the API. */
function apiLines(): { key: string; category: string | null; description: string; quantity: number | undefined; unit: UnitEnum; unit_price_ht: number | undefined }[] {
  let category: string | null = null;

  return items.value.flatMap((item) => {
    if (item.type === 'category') {
      category = item.name.trim() || null;

      return [];
    }

    return [{ key: item.key, category, description: item.description, quantity: item.quantity, unit: item.unit, unit_price_ht: item.unit_price_ht }];
  });
}

const lineSchema = z.object({
  description: z.string().trim().min(1, t('auth.validation.required')).max(255),
  quantity: z.number({ required_error: t('auth.validation.required'), invalid_type_error: t('auth.validation.required') }).gt(0, t('quote.form.quantityPositive')),
  unit_price_ht: z.number({ required_error: t('auth.validation.required'), invalid_type_error: t('auth.validation.required') }).min(0)
});

function validate(lines: ReturnType<typeof apiLines>): boolean {
  const result: Record<string, string | undefined> = {};

  if (!header.client_id) {
    result.client_id = t('quote.form.clientRequired');
  }
  if (!header.issue_date) {
    result.issue_date = t('auth.validation.required');
  }
  if (header.validity_date && minValidity.value && header.validity_date < minValidity.value) {
    result.validity_date = t('quote.form.validityMin', { months: MIN_VALIDITY_MONTHS });
  }
  if (!lines.length) {
    result.lines = t('quote.form.linesRequired');
  }

  for (const line of lines) {
    const parsed = lineSchema.safeParse(line);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        result[`${line.key}.${issue.path[0]}`] = issue.message;
      }
    }
  }

  errors.value = result;

  return Object.keys(result).length === 0;
}

// Once the user tried to submit, errors follow the input live.
watch([items, header], () => {
  if (attempted.value) {
    validate(apiLines());
  }
}, { deep: true });

const hasLineErrors = computed(() => Object.keys(errors.value).some(key => key.startsWith('item-') && errors.value[key]));

async function submit(status: QuoteStatusEnum): Promise<void> {
  attempted.value = true;
  const lines = apiLines();

  if (!validate(lines)) {
    return;
  }

  submitting.value = status;

  try {
    const response = await client<Resource<QuoteDetail>>(isEdit.value ? `/api/v1/quotes/${props.quoteId}` : '/api/v1/quotes', {
      method: isEdit.value ? 'put' : 'post',
      body: {
        client_id: header.client_id,
        worksite_id: header.worksite_id ?? null,
        issue_date: header.issue_date,
        validity_date: header.validity_date || null,
        tva_rate: header.tva_rate,
        quote_status: status,
        lines: lines.map(({ key: _key, ...line }) => line)
      }
    });

    emit('saved', response.data, !isEdit.value);
  } catch (error) {
    handle(error, (serverErrors) => {
      // lines.N.field → item key, so the message lands under the right input.
      errors.value = Object.fromEntries(Object.entries(serverErrors).map(([field, message]) => {
        const match = field.match(/^lines\.(\d+)\.(\w+)$/);

        return match ? [`${lines[Number(match[1])]?.key}.${match[2]}`, message] : [field, message];
      }));
    });
  } finally {
    submitting.value = null;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="isEdit ? t('quote.form.editTitle') : t('quote.form.createTitle')"
    :description="t('quote.form.subtitle')"
    :ui="{
      content: 'max-w-215',
      header: 'bg-linear-to-br from-success to-green-600',
      title: 'text-xl font-extrabold text-white',
      description: 'text-green-100',
      close: 'text-white hover:bg-white/20',
      body: 'p-0 sm:p-0',
      footer: 'justify-end'
    }"
  >
    <template #body>
      <div
        v-if="loading"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-muted"
        />
      </div>

      <form
        v-else
        id="quote-form"
        novalidate
        class="flex flex-col"
        @submit.prevent="submit(isEdit ? header.quote_status : QuoteStatusEnum.Send)"
      >
        <div class="px-4 sm:px-7 py-5 border-b border-default bg-elevated/40 flex flex-col gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('quote.form.client')"
              name="client_id"
              required
              :error="errors.client_id"
            >
              <USelectMenu
                v-model="header.client_id"
                :items="clientItems"
                value-key="value"
                :placeholder="t('quote.form.clientPlaceholder')"
                :search-input="{ placeholder: t('worksite.form.search') }"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('quote.form.worksite')"
              name="worksite_id"
              :error="errors.worksite_id"
            >
              <USelectMenu
                v-model="header.worksite_id"
                :items="worksiteItems"
                value-key="value"
                :disabled="!header.client_id"
                :placeholder="t('quote.form.worksitePlaceholder')"
                class="w-full"
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('quote.form.issueDate')"
              name="issue_date"
              required
              :error="errors.issue_date"
            >
              <UInput
                v-model="header.issue_date"
                type="date"
                class="w-full"
              />
            </UFormField>
            <UFormField
              :label="t('quote.form.validityDate', { months: MIN_VALIDITY_MONTHS })"
              name="validity_date"
              :hint="t('quote.form.validityHint')"
              :error="errors.validity_date"
            >
              <UInput
                v-model="header.validity_date"
                type="date"
                :min="minValidity"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="px-4 sm:px-7 py-5 flex flex-col gap-3 overflow-x-auto">
          <div class="min-w-170 flex flex-col gap-1.5">
            <div class="grid grid-cols-[1fr_80px_100px_110px_100px_32px] gap-2 px-2 text-[11px] font-bold text-muted uppercase tracking-[0.07em]">
              <span>{{ t('quote.lines.description') }}</span>
              <span class="text-center">{{ t('quote.lines.quantity') }}</span>
              <span>{{ t('quote.lines.unit') }}</span>
              <span class="text-right">{{ t('quote.lines.unitPrice') }}</span>
              <span class="text-right">{{ t('quote.lines.total') }}</span>
              <span />
            </div>

            <template
              v-for="item in items"
              :key="item.key"
            >
              <div
                v-if="item.type === 'category'"
                class="flex items-center gap-2 mt-2"
              >
                <div class="flex-1 flex items-center gap-2 bg-primary-700 rounded-lg px-3 py-1.5">
                  <input
                    v-model="item.name"
                    type="text"
                    class="flex-1 bg-transparent text-xs font-bold text-white placeholder:text-white/50 focus:outline-none uppercase tracking-[0.06em]"
                    :placeholder="t('quote.form.categoryPlaceholder')"
                    :aria-label="t('quote.form.categoryPlaceholder')"
                  >
                  <UButton
                    variant="link"
                    size="xs"
                    icon="i-lucide-plus"
                    class="text-white/70 hover:text-white"
                    :label="t('quote.form.addLine')"
                    @click="addLine(item.key)"
                  />
                </div>
                <UButton
                  icon="i-lucide-x"
                  size="xs"
                  square
                  class="bg-primary-700 text-white/70 hover:text-white hover:bg-primary-800"
                  :aria-label="t('quote.form.removeCategory')"
                  @click="remove(item.key)"
                />
              </div>

              <div
                v-else
                class="group grid grid-cols-[1fr_80px_100px_110px_100px_32px] gap-2 items-start px-2 py-1 rounded-lg hover:bg-elevated/50"
              >
                <UFormField
                  :error="errors[`${item.key}.description`]"
                  :ui="{ error: 'sr-only' }"
                >
                  <UInput
                    v-model="item.description"
                    size="sm"
                    class="w-full"
                    :placeholder="t('quote.form.linePlaceholder')"
                    :aria-label="t('quote.lines.description')"
                  />
                </UFormField>
                <UFormField
                  :error="errors[`${item.key}.quantity`]"
                  :ui="{ error: 'sr-only' }"
                >
                  <UInputNumber
                    v-model="item.quantity"
                    size="sm"
                    :min="0"
                    :step="0.01"
                    :increment="false"
                    :decrement="false"
                    class="w-full"
                    :ui="{ base: 'text-center px-2' }"
                    :aria-label="t('quote.lines.quantity')"
                  />
                </UFormField>
                <USelect
                  v-model="item.unit"
                  :items="unitItems"
                  size="sm"
                  class="w-full"
                  :aria-label="t('quote.lines.unit')"
                />
                <UFormField
                  :error="errors[`${item.key}.unit_price_ht`]"
                  :ui="{ error: 'sr-only' }"
                >
                  <UInputNumber
                    v-model="item.unit_price_ht"
                    size="sm"
                    :min="0"
                    :step="0.01"
                    :increment="false"
                    :decrement="false"
                    :format-options="{ style: 'currency', currency: 'EUR' }"
                    class="w-full"
                    :ui="{ base: 'text-right px-2' }"
                    :aria-label="t('quote.lines.unitPrice')"
                  />
                </UFormField>
                <span class="h-8 flex items-center justify-end pr-1 text-xs font-semibold text-highlighted">
                  {{ lineTotal(item) > 0 ? formatEuros(lineTotal(item)) : '—' }}
                </span>
                <UButton
                  icon="i-lucide-x"
                  color="error"
                  variant="ghost"
                  size="xs"
                  square
                  class="opacity-60 group-hover:opacity-100"
                  :aria-label="t('quote.form.removeLine')"
                  @click="remove(item.key)"
                />
              </div>
            </template>
          </div>

          <p
            v-if="errors.lines || hasLineErrors"
            class="flex items-center gap-1.5 text-xs text-error"
          >
            <UIcon
              name="i-lucide-circle-alert"
              class="size-3.5"
            />
            {{ errors.lines ?? t('quote.form.linesInvalid') }}
          </p>

          <div class="flex flex-wrap items-center gap-3 mt-1">
            <UButton
              color="success"
              variant="outline"
              size="sm"
              icon="i-lucide-plus"
              class="border-dashed ring-0 border border-success"
              :label="t('quote.form.addLine')"
              @click="addLine()"
            />
            <UButton
              color="primary"
              variant="outline"
              size="sm"
              icon="i-lucide-plus"
              class="border-dashed ring-0 border border-primary-700 text-primary-700 dark:text-primary-300"
              :label="t('quote.form.addCategory')"
              @click="addCategory"
            />
          </div>
        </div>

        <div class="border-t-2 border-default px-4 sm:px-7 py-5 bg-elevated/40 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <UFormField
            :label="t('quote.form.tvaRate')"
            name="tva_rate"
            :error="errors.tva_rate"
          >
            <USelect
              v-model="header.tva_rate"
              :items="tvaItems"
              class="w-72"
            />
          </UFormField>

          <div class="flex items-stretch rounded-xl overflow-hidden border border-default shadow-xs">
            <div class="flex flex-col items-center justify-center px-5 py-3 min-w-30 bg-default">
              <span class="text-[10px] font-bold uppercase tracking-[0.09em] mb-1 text-dimmed">{{ t('quote.totals.ht') }}</span>
              <span class="text-[15px] font-extrabold whitespace-nowrap text-highlighted">{{ formatEuros(totalHt) }}</span>
            </div>
            <div class="flex flex-col items-center justify-center px-5 py-3 min-w-30 bg-default border-l border-default">
              <span class="text-[10px] font-bold uppercase tracking-[0.09em] mb-1 text-dimmed">{{ t('quote.totals.tva', { rate: tvaPercent.toLocaleString('fr-FR') }) }}</span>
              <span class="text-[15px] font-extrabold whitespace-nowrap text-highlighted">{{ formatEuros(tvaAmount) }}</span>
            </div>
            <div class="flex flex-col items-center justify-center px-5 py-3 min-w-30 bg-primary-700">
              <span class="text-[10px] font-bold uppercase tracking-[0.09em] mb-1 text-primary-200">{{ t('quote.totals.ttc') }}</span>
              <span class="text-[15px] font-extrabold whitespace-nowrap text-white">{{ formatEuros(totalTtc) }}</span>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('base.btn.cancel')"
        @click="open = false"
      />
      <template v-if="!isEdit">
        <UButton
          color="neutral"
          variant="outline"
          :loading="submitting === QuoteStatusEnum.Draft"
          :disabled="loading || submitting !== null"
          :label="t('quote.form.saveDraft')"
          @click="submit(QuoteStatusEnum.Draft)"
        />
        <UButton
          type="submit"
          form="quote-form"
          color="success"
          :loading="submitting === QuoteStatusEnum.Send"
          :disabled="loading || submitting !== null"
          :label="t('quote.form.submit')"
        />
      </template>
      <UButton
        v-else
        type="submit"
        form="quote-form"
        color="success"
        :loading="submitting !== null"
        :disabled="loading"
        :label="t('base.btn.save')"
      />
    </template>
  </UModal>
</template>
