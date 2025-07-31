export type Pagela = {
  id: string;
  childId: string;
  teacherProfileId: string | null;
  referenceDate: string;
  year: number;
  week: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PageDto<T> = { items: T[]; total: number; page: number; limit: number };


export type CreatePagelaPayload = {
  childId: string;
  teacherProfileId?: string | null;
  referenceDate: string;
  week: number;
  year?: number;
  present: boolean;
  didMeditation: boolean;
  recitedVerse: boolean;
  notes?: string | null;
};

export type UpdatePagelaPayload = Partial<Omit<CreatePagelaPayload, "childId">> & {
  teacherProfileId?: string | null;
};
