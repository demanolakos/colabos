
export enum Role {
  PHOTOGRAPHER = 'Photographer',
  MODEL = 'Model',
  MUA = 'Makeup Artist',
}

export interface Member {
  name: string;
  instagram: string;
  role: Role;
}

export interface PhotoSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  photographer: Member;
  model: Member;
  mua: Member;
  description: string;
  createdAt: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}
