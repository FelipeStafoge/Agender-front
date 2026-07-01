export interface Participant {
  userId: string
  name: string
  role: 'Owner' | 'Member'
  createdAt: string
}

export interface Event {
  id: string
  name: string
  date: string
  color: string
  calendarId: string | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  participants: Participant[]
}

export interface Calendar {
  id: string
  name: string
  date: string[]
  color: string
  DefaultColor?: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
  participants: Participant[]
}

export interface UserInfo {
  name: string
  email: string
  id: string
  userCode: string
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
