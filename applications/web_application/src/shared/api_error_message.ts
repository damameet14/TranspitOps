import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!axios.isAxiosError(error)) return fallbackMessage;
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (typeof detail?.detail === 'string') return detail.detail;
  if (!error.response) return 'The service is unavailable. Check that the Docker services are running.';
  return fallbackMessage;
}
