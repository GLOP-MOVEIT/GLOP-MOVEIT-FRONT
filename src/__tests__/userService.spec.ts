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
        const credentials = {email: 'john@example.com', password: 'secret'}
        const responseData = {
            token: 'token-123',
            user: {id: 1, email: 'john@example.com', firstName: 'John', surname: 'Doe'},
        }

        mockedAxios.post.mockResolvedValueOnce({data: responseData})

        const result = await userService.login(credentials)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/login`,
            credentials,
            expect.objectContaining({
                headers: {'Content-Type': 'application/json'},
            }),
        )
        expect(result).toEqual(responseData)
        expect(localStorage.getItem('authToken')).toBe('token-123')
        expect(localStorage.getItem('user')).toBe(JSON.stringify(responseData.user))
    })

    it('registers a user with the expected payload', async () => {
        const userData = {
            email: 'jane@example.com',
            password: 'secret',
            firstName: 'Jane',
            surname: 'Doe',
            phoneNumber: '123456789',
            acceptsNotifications: true,
            acceptsLocation: false,
        }
        const responseUser = {id: 2, email: 'jane@example.com', firstName: 'Jane', surname: 'Doe'}

        mockedAxios.post.mockResolvedValueOnce({data: responseUser})

        const result = await userService.register(userData)

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/signup`,
            {
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                surname: userData.surname,
                phoneNumber: userData.phoneNumber,
                acceptsNotifications: userData.acceptsNotifications,
                acceptsLocation: userData.acceptsLocation,
            },
            expect.objectContaining({
                headers: {'Content-Type': 'application/json'},
            }),
        )
        expect(result).toEqual(responseUser)
    })

    it('logs out and clears local storage', () => {
        localStorage.setItem('authToken', 'token-123')
        localStorage.setItem('user', JSON.stringify({id: 1}))

        userService.logout()

        expect(localStorage.getItem('authToken')).toBeNull()
        expect(localStorage.getItem('user')).toBeNull()
    })

    it('returns the current user from local storage', () => {
        const user = {id: 1, email: 'john@example.com'}
        localStorage.setItem('user', JSON.stringify(user))

        expect(userService.getCurrentUser()).toEqual(user)
    })

    it('returns null when no current user exists', () => {
        expect(userService.getCurrentUser()).toBeNull()
    })

    it('fetches profile with auth token and stores it', async () => {
        localStorage.setItem('authToken', 'token-123')
        const profile = {id: 1, email: 'john@example.com'}
        mockedAxios.get.mockResolvedValueOnce({data: profile})

        const result = await userService.getProfile()

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/users/me`,
            expect.objectContaining({
                headers: {Authorization: 'Bearer token-123'},
            }),
        )
        expect(result).toEqual(profile)
        expect(localStorage.getItem('user')).toBe(JSON.stringify(profile))
    })

    it('fetches users with auth token', async () => {
        localStorage.setItem('authToken', 'token-123')
        const users = [{id: 1, email: 'john@example.com'}]
        mockedAxios.get.mockResolvedValueOnce({data: users})

        const result = await userService.getUsers()

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${apiBaseUrl}/auth/users`,
            expect.objectContaining({
                headers: {Authorization: 'Bearer token-123'},
            }),
        )
        expect(result).toEqual(users)
    })

    it('reports authentication state and token', () => {
        expect(userService.isAuthenticated()).toBe(false)
        expect(userService.getToken()).toBeNull()

        localStorage.setItem('authToken', 'token-123')

        expect(userService.isAuthenticated()).toBe(true)
        expect(userService.getToken()).toBe('token-123')
    })
})
