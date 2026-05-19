import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { UsersSortField } from './users-sort-field';

export type UsersQueryInput = PaginationAndSorting<UsersSortField> &
  Partial<{
    searchLoginTerm: string;
    searchEmailTerm: string;
  }>;
