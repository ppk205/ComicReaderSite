export interface Manga {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres: Genre[];
  coverImage?: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isPublished: boolean;
  viewCount: number;
  rating: number;
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: number;
  title: string;
  pages: Page[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Page {
  id: string;
  chapterId: string;
  pageNumber: number;
  imageUrl: string;
  altText?: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
}

export interface CreateMangaRequest {
  title: string;
  description: string;
  author: string;
  artist: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genreIds: string[];
  coverImage?: File;
  isPublished: boolean;
}

export interface UpdateMangaRequest {
  id: string;
  title?: string;
  description?: string;
  author?: string;
  artist?: string;
  status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genreIds?: string[];
  coverImage?: File;
  isPublished?: boolean;
}

export interface MangaFilter {
  search?: string;
  status?: string;
  genre?: string;
  author?: string;
  isPublished?: boolean;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'viewCount' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface MangaStats {
  totalManga: number;
  publishedManga: number;
  unpublishedManga: number;
  totalChapters: number;
  totalViews: number;
  averageRating: number;
}