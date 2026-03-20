import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import locationService from '@/services/locationService'

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
}

const apiBaseUrl = 'http://localhost:8080'
const authToken = 'token-loc'
const authHeader = { Authorization: `Bearer ${authToken}` }
const jsonHeader = { 'Content-Type': 'application/json' }

const sampleLocation = {
    locationId: 1,
    name: 'Stade Municipal',
    latitude: 48.8566,
    longitude: 2.3522,
    mainEntrance: 'Entrée principale',
    refereeEntrance: 'Entrée arbitres',
    athleteEntrance: 'Entrée athlètes',
    description: 'Grand stade municipal',
}

const samplePayload = {
    name: 'Stade Municipal',
    latitude: 48.8566,
    longitude: 2.3522,
    mainEntrance: 'Entrée principale',
    refereeEntrance: 'Entrée arbitres',
    athleteEntrance: 'Entrée athlètes',
    description: 'Grand stade municipal',
}

describe('locationService', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    describe('getAllLocations', () => {
        it('fetches all locations with auth header', async () => {
            localStorage.setItem('authToken', authToken)
            const locations = [sampleLocation]
            mockedAxios.get.mockResolvedValueOnce({ data: locations })

            const result = await locationService.getAllLocations()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/locations`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(locations)
        })

        it('returns empty array when no locations exist', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.get.mockResolvedValueOnce({ data: [] })

            const result = await locationService.getAllLocations()

            expect(result).toEqual([])
        })

        it('throws on network failure', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('network error'))
            await expect(locationService.getAllLocations()).rejects.toThrow('network error')
        })
    })

    describe('getLocationById', () => {
        it('fetches a single location by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.get.mockResolvedValueOnce({ data: sampleLocation })

            const result = await locationService.getLocationById(1)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/locations/1`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(sampleLocation)
        })

        it('throws when location is not found', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Not found'))
            await expect(locationService.getLocationById(999)).rejects.toThrow('Not found')
        })
    })

    describe('createLocation', () => {
        it('posts location payload and returns created location', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.post.mockResolvedValueOnce({ data: sampleLocation })

            const result = await locationService.createLocation(samplePayload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/locations`,
                samplePayload,
                expect.objectContaining({
                    headers: expect.objectContaining({ ...authHeader, ...jsonHeader }),
                }),
            )
            expect(result).toEqual(sampleLocation)
        })

        it('throws on creation failure', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('Failed'))
            await expect(locationService.createLocation(samplePayload)).rejects.toThrow('Failed')
        })
    })

    describe('updateLocation', () => {
        it('puts updated location and returns it', async () => {
            localStorage.setItem('authToken', authToken)
            const updatedPayload = { ...samplePayload, name: 'Nouveau Stade' }
            const updatedLocation = { ...sampleLocation, name: 'Nouveau Stade' }
            mockedAxios.put.mockResolvedValueOnce({ data: updatedLocation })

            const result = await locationService.updateLocation(1, updatedPayload)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/locations/1`,
                updatedPayload,
                expect.objectContaining({
                    headers: expect.objectContaining({ ...authHeader, ...jsonHeader }),
                }),
            )
            expect(result).toEqual(updatedLocation)
        })

        it('throws on update failure', async () => {
            mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'))
            await expect(locationService.updateLocation(1, samplePayload)).rejects.toThrow('Update failed')
        })
    })

    describe('deleteLocation', () => {
        it('deletes location by id and sends auth header', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await locationService.deleteLocation(1)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/locations/1`,
                expect.objectContaining({ headers: authHeader }),
            )
        })

        it('throws on deletion failure', async () => {
            mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'))
            await expect(locationService.deleteLocation(1)).rejects.toThrow('Delete failed')
        })
    })

    describe('getAuthHeaders without token', () => {
        it('returns empty object when no token is stored', () => {
            const headers = locationService.getAuthHeaders()
            expect(headers).toEqual({})
        })

        it('returns auth header when token is stored', () => {
            localStorage.setItem('authToken', authToken)
            const headers = locationService.getAuthHeaders()
            expect(headers).toEqual(authHeader)
        })
    })
})
