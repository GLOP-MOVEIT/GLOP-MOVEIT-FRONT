import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import volunteerService from '@/services/volunteerService'

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}))

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    patch: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
}

const apiBaseUrl = 'http://localhost:8080'
const authToken = 'token-abc'
const authHeader = { Authorization: `Bearer ${authToken}` }
const jsonHeader = { 'Content-Type': 'application/json' }

describe('volunteerService', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    // ─── Task Types ────────────────────────────────────────────────────────────

    describe('getTaskTypes', () => {
        it('fetches task types with auth header', async () => {
            localStorage.setItem('authToken', authToken)
            const taskTypes = [{ id: 1, name: 'Timer', description: 'Timing tasks' }]
            mockedAxios.get.mockResolvedValueOnce({ data: taskTypes })

            const result = await volunteerService.getTaskTypes()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/task-types`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(taskTypes)
        })

        it('throws when request fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('network error'))
            await expect(volunteerService.getTaskTypes()).rejects.toThrow('network error')
        })
    })

    describe('createTaskType', () => {
        it('posts task type payload and returns created type', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { name: 'Judge', description: 'Judging tasks' }
            const created = { id: 2, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await volunteerService.createTaskType(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/task-types`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('updateTaskType', () => {
        it('puts updated task type and returns it', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { name: 'Updated', description: 'Updated desc' }
            const updated = { id: 1, ...payload }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await volunteerService.updateTaskType(1, payload)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/task-types/1`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('deleteTaskType', () => {
        it('deletes task type by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await volunteerService.deleteTaskType(3)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/task-types/3`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    // ─── Volunteer Preferences ─────────────────────────────────────────────────

    describe('createPreference', () => {
        it('posts preference payload and returns created preference', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { userId: 10, taskTypeId: 2 }
            const created = { id: 5, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await volunteerService.createPreference(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/preferences`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('getUserPreferences', () => {
        it('fetches preferences for a user', async () => {
            localStorage.setItem('authToken', authToken)
            const prefs = [{ id: 1, userId: 10, taskTypeId: 2 }]
            mockedAxios.get.mockResolvedValueOnce({ data: prefs })

            const result = await volunteerService.getUserPreferences(10)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/preferences/user/10`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(prefs)
        })
    })

    describe('deletePreference', () => {
        it('deletes preference by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await volunteerService.deletePreference(5)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/preferences/5`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    // ─── Volunteer Tasks ───────────────────────────────────────────────────────

    describe('getAllTasks', () => {
        it('fetches all tasks with auth header', async () => {
            localStorage.setItem('authToken', authToken)
            const tasks = [
                {
                    id: 1,
                    targetType: 'TRIAL',
                    targetId: 42,
                    title: 'Accueil',
                    description: 'Accueil athlètes',
                    taskTypeId: 1,
                    startDate: '2026-06-01T08:00',
                    endDate: '2026-06-01T12:00',
                    maxVolunteers: 5,
                    locationId: null,
                },
            ]
            mockedAxios.get.mockResolvedValueOnce({ data: tasks })

            const result = await volunteerService.getAllTasks()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/tasks`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(tasks)
        })
    })

    describe('createTask', () => {
        it('posts task payload and returns created task', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = {
                targetType: 'TRIAL' as const,
                targetId: 42,
                title: 'Chronométrage',
                description: 'Gérer les temps',
                taskTypeId: 1,
                startDate: '2026-06-01T08:00',
                endDate: '2026-06-01T18:00',
                maxVolunteers: 3,
                locationId: null,
            }
            const created = { id: 7, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await volunteerService.createTask(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/tasks`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('updateTask', () => {
        it('puts updated task and returns it', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = {
                targetType: 'TRIAL' as const,
                targetId: 42,
                title: 'Updated',
                description: 'Updated desc',
                taskTypeId: 1,
                startDate: '2026-06-01T09:00',
                endDate: '2026-06-01T17:00',
                maxVolunteers: 4,
                locationId: null,
            }
            const updated = { id: 7, ...payload }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await volunteerService.updateTask(7, payload)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/tasks/7`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('deleteTask', () => {
        it('deletes task by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await volunteerService.deleteTask(7)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/tasks/7`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    describe('getTasksByTarget', () => {
        it('fetches tasks filtered by target type and id', async () => {
            localStorage.setItem('authToken', authToken)
            const tasks = [{ id: 1, targetType: 'TRIAL', targetId: 10 }]
            mockedAxios.get.mockResolvedValueOnce({ data: tasks })

            const result = await volunteerService.getTasksByTarget('TRIAL', 10)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/tasks/target/TRIAL/10`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(tasks)
        })
    })

    // ─── Volunteer Assignments ─────────────────────────────────────────────────

    describe('createAssignment', () => {
        it('posts assignment payload and returns created assignment', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { volunteerId: 5, taskId: 3 }
            const created = { id: 11, ...payload, status: 'PENDING' }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await volunteerService.createAssignment(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('getAssignmentsByTask', () => {
        it('fetches assignments for a given task', async () => {
            localStorage.setItem('authToken', authToken)
            const assignments = [{ id: 1, volunteerId: 5, taskId: 3, status: 'PENDING' }]
            mockedAxios.get.mockResolvedValueOnce({ data: assignments })

            const result = await volunteerService.getAssignmentsByTask(3)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/task/3`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(assignments)
        })
    })

    describe('getAssignmentsByVolunteer', () => {
        it('fetches assignments for a given volunteer', async () => {
            localStorage.setItem('authToken', authToken)
            const assignments = [{ id: 1, volunteerId: 5, taskId: 3, status: 'ACCEPTED' }]
            mockedAxios.get.mockResolvedValueOnce({ data: assignments })

            const result = await volunteerService.getAssignmentsByVolunteer(5)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/volunteer/5`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(assignments)
        })
    })

    describe('getAssignmentsByStatus', () => {
        it('fetches assignments filtered by status', async () => {
            localStorage.setItem('authToken', authToken)
            const assignments = [{ id: 2, volunteerId: 6, taskId: 4, status: 'ACCEPTED' }]
            mockedAxios.get.mockResolvedValueOnce({ data: assignments })

            const result = await volunteerService.getAssignmentsByStatus('ACCEPTED')

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/status/ACCEPTED`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(assignments)
        })
    })

    describe('deleteAssignment', () => {
        it('deletes assignment by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await volunteerService.deleteAssignment(11)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/11`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    describe('respondToAssignment', () => {
        it('patches assignment with volunteer response', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { volunteerId: 5, status: 'ACCEPTED' as const }
            const updated = { id: 11, volunteerId: 5, taskId: 3, status: 'ACCEPTED' }
            mockedAxios.patch.mockResolvedValueOnce({ data: updated })

            const result = await volunteerService.respondToAssignment(11, payload)

            expect(mockedAxios.patch).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/11/volunteer-response`,
                payload,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('getAvailableVolunteersWithPreference', () => {
        it('posts volunteer ids and returns availability with preferences', async () => {
            localStorage.setItem('authToken', authToken)
            const volunteerIds = [1, 2, 3]
            const response = [
                { volunteerId: 1, hasPreference: true },
                { volunteerId: 3, hasPreference: false },
            ]
            mockedAxios.post.mockResolvedValueOnce({ data: response })

            const result = await volunteerService.getAvailableVolunteersWithPreference(7, volunteerIds)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/volunteer/assignments/task/7/available-volunteers-with-preference`,
                { volunteerIds },
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(response)
        })
    })

    // ─── No auth token ─────────────────────────────────────────────────────────

    describe('getAuthHeaders without token', () => {
        it('returns empty headers when no auth token in storage', () => {
            const headers = volunteerService.getAuthHeaders()
            expect(headers).toEqual({})
        })
    })
})
