export type ChildListItemDto = {
  id: string;
  name: string;
  guardianName: string;
  guardianPhone: string;
  clubId: string | null;
  isActive: boolean;
};

export type ChildResponseDto = {
  id: string;
  name: string;
  gender: "M" | "F";
  guardianName: string;
  guardianPhone: string;
  birthDate: string;
  joinedAt: string | null;
  isActive: boolean;
  club: { id: string; number: number; weekday?: string } | null;
  address: {
    id: string;
    street: string;
    number?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AcceptedChristShortDto = {
  id: string;
  decision: "ACCEPTED" | "RECONCILED" | null;
  createdAt: string;
  updatedAt: string;
  notes?: string | null;
};

export type ChildSimpleResponseDto = {
  id: string;
  name: string;
  guardianName: string;
  guardianPhone: string;
  gender: string;
  clubId: string;
  isActive: boolean;
  acceptedChrists: AcceptedChristShortDto[];
};

export type Paginated<T> = {
  data: T[];
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    orderBy: string;
    order: 'ASC' | 'DESC';
  };
  total?: number;
  page?: number;
  limit?: number;
  pageCount?: number;
};

export type ChildFilters = {
  searchString?: string;
  clubNumber?: number;
  birthDateFrom?: string;
  birthDateTo?: string;
  joinedFrom?: string;
  joinedTo?: string;
  isActive?: boolean;
};

export type ChildSort =
  | { id: 'name' | 'birthDate' | 'joinedAt' | 'createdAt' | 'updatedAt'; desc: boolean }
  | null;

export type CreateChildForm = {
  name: string;
  gender: "M" | "F";
  guardianName: string;
  guardianPhone: string;
  birthDate: string;
  joinedAt?: string | null;
  isActive?: boolean;
  clubId?: string | null;
  address?: {
    street: string;
    number?: string;
    district: string;
    city: string;
    state: string;
    postalCode: string;
    complement?: string;
  } | null;
};

export type EditChildForm = Partial<CreateChildForm> & { id: string };
