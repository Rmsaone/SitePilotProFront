/**
 * Downloads a protected file (the API needs the bearer token, so a plain link is not enough).
 */
export const useAttachmentDownload = () => {
  const client = useSanctumClient();
  const { handle } = useApiErrors();

  async function download(url: string, filename: string): Promise<void> {
    try {
      const blob = await client<Blob, 'blob'>(url, { responseType: 'blob' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(href);
    } catch (error) {
      handle(error);
    }
  }

  return { download };
};
