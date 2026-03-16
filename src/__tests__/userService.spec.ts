import {beforeEach, describe, expect, it, vi} from 'vitest'
import axios from 'axios'
import userService from '@/services/userService'

vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
    },
}))

const mockedAxios = axios as unknown as {
    post: ReturnType<typeof vi.fn>
    get: ReturnType<typeof vi.fn>
}

const apiBaseUrl = 'http://localhost:8080'

describe('userService', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    it('logs in and stores token and user when token is provided', async () => {
        const credentials = {nickname: 'john', password: 'secret'}
        const loginResponseData = {
            token: 'token-123',
            expiresIn: 3600,
            user: {userId: 1, nickname: 'john'},
        }
        const userProfileData = {
            userId: 1,
            email: 'john@example.com',
            firstName: 'John',
            surname: 'Doe',
            phoneNumber: '123456789',
            language: 'en',
            role: { name: 'SPECTATOR' },
            acceptsNotifications: true,
            acceptsLocationSharing: false,
        }

        mockedAxios.post.mockResolvedValueOnce({data: loginResponseData})
        mockedAxios.get.mockResolvedValueOnce({data: userProfileData})

        const result = await userService.login(credentials)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/login`,
            credentials,
            expect.objectContaining({
                headers: {'Content-Type': 'application/json'},
            }),
        )
        expect(result.token).toBe('token-123')
        expect(result.user.userId).toBe(1)
        expect(localStorage.getItem('authToken')).toBe('token-123')
    })

    it('registers a user with the expected payload', async () => {
        const userData = {
            nickname: 'jane-doe',
            language: 'fr',
            email: 'jane@example.com',
            password: 'secret',
            firstName: 'Jane',
            surname: 'Doe',
            phoneNumber: '123456789',
            acceptsNotifications: true,
            acceptsLocationSharing: false,
        }
        const responseUser = {userId: 2, email: 'jane@example.com', firstName: 'Jane', surname: 'Doe'}

        mockedAxios.post.mockResolvedValueOnce({data: responseUser})

        const result = await userService.register(userData)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/signup`,
            {
                nickname: userData.nickname,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                surname: userData.surname,
                phoneNumber: userData.phoneNumber,
                language: userData.language,
                acceptsNotifications: userData.acceptsNotifications,
                acceptsLocationSharing: userData.acceptsLocationSharing,
            },
            {
                headers: {'Content-Type': 'application/json'},
            },
        )
        expect(result).toEqual(responseUser)
    })

    it('logs out and clears local storage', () => {
        localStorage.setItem('authToken', 'token-123')
        localStorage.setItem('user', JSON.stringify({userId: 1}))

        userService.logout()

        expect(localStorage.getItem('authToken')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })

    it('returns the current user from local storage', () => {
        const user = {userId: 1, email: 'john@example.com'}
        localStorage.setItem('user', JSON.stringify(user))

        expect(userService.getCurrentUser()).toEqual(user)
    })

    it('returns null when no current user exists', () => {
        expect(userService.getCurrentUser()).toBeNull()
    })

    it('fetches users with auth token', async () => {
        localStorage.setItem('authToken', 'token-123')
        const pagedResponse = {
            content: [
                {
                    userId: 1,
                    firstName: 'John',
                    surname: 'Doe',
                    email: 'john@example.com',
                    phoneNumber: '0102030405',
                    language: 'fr',
                    role: { name: 'ADMIN' },
                    acceptsNotifications: true,
                    acceptsLocationSharing: false,
                },
            ],
        }
        mockedAxios.get.mockResolvedValueOnce({data: pagedResponse})

        const result = await userService.getUsers()

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${apiBaseUrl}/users`,
            expect.objectContaining({
                headers: {Authorization: 'Bearer token-123'},
            }),
        )
        expect(result).toEqual([
            expect.objectContaining({
                userId: 1,
                email: 'john@example.com',
                role: { name: 'ADMIN' },
            }),
        ])
    })

    it('reports authentication state and token', () => {
        expect(userService.isAuthenticated()).toBe(false)
        expect(userService.getToken()).toBeNull()

        localStorage.setItem('authToken', 'token-123')

        expect(userService.isAuthenticated()).toBe(true)
        expect(userService.getToken()).toBe('token-123')
    })
})
