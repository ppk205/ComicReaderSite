export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalManga: number;
  publishedManga: number;
  totalChapters: number;
  totalViews: number;
  newUsersThisMonth: number;
  newMangaThisMonth: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  userId?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface UserGrowthData {
  month: string;
  newUsers: number;
  totalUsers: number;
}

export interface MangaViewsData {
  date: string;
  views: number;
  uniqueViews: number;
}