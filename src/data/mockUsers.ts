import type { AthleteCandidate, User } from '@/types/user'
import { UserRole } from '@/types/user'

export const mockCommissionerUser: User = {
  userId: -100,
  firstName: 'Camille',
  surname: 'Commissaire',
  email: 'commissioner.mock@moveit.local',
  phoneNumber: '0600000000',
  language: 'fr',
  role: {
    name: UserRole.COMMISSIONER,
  },
  acceptsNotifications: true,
  acceptsLocationSharing: false,
}

export const mockAthletes: AthleteCandidate[] = [
  {
    userId: -1,
    firstName: 'Léa',
    surname: 'Martin',
    email: 'lea.martin@moveit.local',
    phoneNumber: '0611111111',
    language: 'fr',
    role: { name: UserRole.ATHLETE },
    acceptsNotifications: true,
    acceptsLocationSharing: true,
    isMock: true,
  },
  {
    userId: -2,
    firstName: 'Noah',
    surname: 'Bernard',
    email: 'noah.bernard@moveit.local',
    phoneNumber: '0622222222',
    language: 'fr',
    role: { name: UserRole.ATHLETE },
    acceptsNotifications: true,
    acceptsLocationSharing: true,
    isMock: true,
  },
  {
    userId: -3,
    firstName: 'Inès',
    surname: 'Petit',
    email: 'ines.petit@moveit.local',
    phoneNumber: '0633333333',
    language: 'fr',
    role: { name: UserRole.ATHLETE },
    acceptsNotifications: false,
    acceptsLocationSharing: true,
    isMock: true,
  },
  {
    userId: -4,
    firstName: 'Lucas',
    surname: 'Morel',
    email: 'lucas.morel@moveit.local',
    phoneNumber: '0644444444',
    language: 'fr',
    role: { name: UserRole.ATHLETE },
    acceptsNotifications: true,
    acceptsLocationSharing: false,
    isMock: true,
  },
  {
    userId: -5,
    firstName: 'Sarah',
    surname: 'Roux',
    email: 'sarah.roux@moveit.local',
    phoneNumber: '0655555555',
    language: 'fr',
    role: { name: UserRole.ATHLETE },
    acceptsNotifications: true,
    acceptsLocationSharing: true,
    isMock: true,
  },
]

export const findMockUserById = (userId: number): AthleteCandidate | User | undefined => {
  if (mockCommissionerUser.userId === userId) {
    return mockCommissionerUser
  }

  return mockAthletes.find((athlete) => athlete.userId === userId)
}

