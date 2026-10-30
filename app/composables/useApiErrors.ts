interface ValidationErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

interface ApiError {
  statusCode?: number;
  data?: ValidationErrorBody;
}

// The sanctum client ships its own ofetch instance, so `instanceof FetchError` is unreliable here.
function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'statusCode' in error;
}

/**
 * Maps a Laravel 422 response to vee-validate field errors and
 * shows a toast for any other failure.
 */
export const useApiErrors = () => {
  const toast = useToast();
  const { t } = useI18n();

  function handle(
    error: unknown,
    setErrors?: (errors: Record<string, string | undefined>) => void
  ): void {
    const body = isApiError(error) ? error.data : undefined;

    if (isApiError(error) && error.statusCode === 422 && body?.errors && setErrors) {
      setErrors(Object.fromEntries(
        Object.entries(body.errors).map(([field, messages]) => [field, messages[0]])
      ));

      return;
    }

    toast.add({
      title: t('base.toast.errorTitle'),
      description: body?.message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    });
  }

  return { handle };
};
