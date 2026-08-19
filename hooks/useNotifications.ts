import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, AppNotification } from '@/lib/api';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await getNotifications(1, 50); // Get latest 50
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    // Refetch often since notifications are dynamic
    refetchInterval: 30000, 
  });

  const unreadCountQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await getUnreadCount();
      if (!res.success) throw new Error((res as any).error);
      return res.count;
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await markNotificationRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  return {
    notifications: data || [],
    unreadCount: unreadCountQuery.data || 0,
    isLoading,
    isError,
    refetch,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
