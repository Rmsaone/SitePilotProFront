import type { Quote } from '~/components/Quotes/Types/quote.interface';
import { formatMoney } from '~/components/Tables/utils/moneyUtils';

/**
 * mailto: link to send a quote to its client (no e-mail backend yet).
 */
export function quoteMailto(quote: Quote): string {
  const subject = `Devis ${quote.quote_number}`;
  const body = [
    'Bonjour,',
    '',
    `Veuillez trouver ci-joint notre devis ${quote.quote_number} d'un montant de ${formatMoney(quote.total_ttc)} TTC.`,
    '',
    'Cordialement,'
  ].join('\n');

  return `mailto:${quote.client?.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
