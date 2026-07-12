import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  fetchAutoLockSettings,
  updateAutoLockSettings,
} from '@/services/settingsApi';

export function useAutoLockSettings(enabled: boolean) {
  return useQuery({
    queryKey: ['settings', 'auto-lock'],
    queryFn: fetchAutoLockSettings,
    enabled,
  });
}

export function useUpdateAutoLockSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (minutes: number) => updateAutoLockSettings(minutes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings', 'auto-lock'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
      confirmNewPassword,
    }: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => changePassword(currentPassword, newPassword, confirmNewPassword),
  });
}
