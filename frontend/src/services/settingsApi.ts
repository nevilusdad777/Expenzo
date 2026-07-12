import { apiClient } from './apiClient';

export async function fetchAutoLockSettings() {
  const res = await apiClient.get<{ data: { autoLockMinutes: number } }>(
    '/api/auth/settings/auto-lock'
  );
  return res.data.data;
}

export async function updateAutoLockSettings(autoLockMinutes: number) {
  const res = await apiClient.patch<{ data: { autoLockMinutes: number } }>(
    '/api/auth/settings/auto-lock',
    { autoLockMinutes }
  );
  return res.data.data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string
) {
  await apiClient.post('/api/auth/change-password', {
    currentPassword,
    newPassword,
    confirmNewPassword,
  });
}
