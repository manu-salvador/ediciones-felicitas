export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  editorial: string;
  year: number | null;
  description: string | null;
  language: string;
  isbn: string | null;
  coverImage: string | null;
  hasPhysical: boolean;
  hasDigital: boolean;
  physicalPrice: number | null;
  digitalPrice: number | null;
  physicalStock: number;
  isActive: boolean;
  categories?: Category[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
