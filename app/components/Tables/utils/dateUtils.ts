export function formatDate(
  date: Date | string | undefined
): string {
  if (!date) {
    return '-';
  }
  // Si date est une string, la convertir en Date
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
