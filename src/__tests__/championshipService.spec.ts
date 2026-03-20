import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'
import championshipService from '@/services/championshipService'
import { Status, ParticipantType } from '@/types/competition'

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}))

// formatDateForBackend simply passes through ISO strings; mock it as identity
vi.mock('@/utils/date', () => ({
    formatDateForBackend: (d: string) => d,
}))

const mockedAxios = axios as unknown as {
    get: ReturnType<typeof vi.fn>
    post: ReturnType<typeof vi.fn>
    put: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
}

const apiBaseUrl = 'http://localhost:8080'
const authToken = 'token-xyz'
const authHeader = { Authorization: `Bearer ${authToken}` }
const jsonHeader = { 'Content-Type': 'application/json' }

describe('championshipService', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.clearAllMocks()
    })

    // ─── Championships ─────────────────────────────────────────────────────────

    describe('getAllChampionships', () => {
        it('fetches all championships with auth header', async () => {
            localStorage.setItem('authToken', authToken)
            const championships = [{ id: 1, name: 'Championnat A', startDate: '2026-01-01', endDate: '2026-12-31' }]
            mockedAxios.get.mockResolvedValueOnce({ data: championships })

            const result = await championshipService.getAllChampionships()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(championships)
        })

        it('throws on failure', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('network'))
            await expect(championshipService.getAllChampionships()).rejects.toThrow('network')
        })
    })

    describe('getChampionshipById', () => {
        it('fetches a single championship by id', async () => {
            localStorage.setItem('authToken', authToken)
            const championship = { id: 2, name: 'Championnat B', startDate: '2026-03-01', endDate: '2026-09-30' }
            mockedAxios.get.mockResolvedValueOnce({ data: championship })

            const result = await championshipService.getChampionshipById(2)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/2`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(championship)
        })
    })

    describe('createChampionship', () => {
        it('posts championship and returns created one', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { name: 'Nouveau', startDate: '2026-04-01', endDate: '2026-11-01', status: 'UPCOMING' }
            const created = { id: 3, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await championshipService.createChampionship(payload as never)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships`,
                expect.objectContaining({ name: 'Nouveau' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('updateChampionship', () => {
        it('puts updated championship and returns it', async () => {
            localStorage.setItem('authToken', authToken)
            const patch = { name: 'Renommé', startDate: '2026-05-01', endDate: '2026-10-01' }
            const updated = { id: 1, ...patch }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await championshipService.updateChampionship(1, patch)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/1`,
                expect.objectContaining({ name: 'Renommé' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('deleteChampionship', () => {
        it('deletes championship by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await championshipService.deleteChampionship(1)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/1`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    // ─── Competitions ──────────────────────────────────────────────────────────

    describe('getAllCompetitions', () => {
        it('fetches all competitions', async () => {
            localStorage.setItem('authToken', authToken)
            const competitions = [{ competitionId: 1, competitionName: 'Course A' }]
            mockedAxios.get.mockResolvedValueOnce({ data: competitions })

            const result = await championshipService.getAllCompetitions()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(competitions)
        })
    })

    describe('getCompetitionById', () => {
        it('fetches a single competition by id', async () => {
            localStorage.setItem('authToken', authToken)
            const competition = { competitionId: 5, competitionName: 'Sprint' }
            mockedAxios.get.mockResolvedValueOnce({ data: competition })

            const result = await championshipService.getCompetitionById(5)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions/5`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(competition)
        })
    })

    describe('createCompetition', () => {
        it('posts competition payload and returns created one', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = {
                competitionName: 'Nouvelle Compétition',
                competitionSport: 'Athletics',
                competitionDescription: 'Desc',
                competitionStartDate: '2026-06-01',
                competitionEndDate: '2026-06-02',
                competitionStatus: Status.PLANNED,
                competitionType: 'INDIVIDUAL',
                participantType: ParticipantType.INDIVIDUAL,
                maxPerHeat: 8,
                nbManches: 3,
            }
            const created = { competitionId: 10, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await championshipService.createCompetition(payload)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions`,
                expect.objectContaining({ competitionName: 'Nouvelle Compétition' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('updateCompetition', () => {
        it('puts updated competition and returns it', async () => {
            localStorage.setItem('authToken', authToken)
            const patch = { competitionName: 'Modifiée', competitionStartDate: '2026-07-01', competitionEndDate: '2026-07-02' }
            const updated = { competitionId: 5, ...patch }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await championshipService.updateCompetition(5, patch)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions/5`,
                expect.objectContaining({ competitionName: 'Modifiée' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('deleteCompetition', () => {
        it('deletes competition by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await championshipService.deleteCompetition(5)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions/5`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    describe('generateCompetitionTree', () => {
        it('posts participant ids and returns tree result', async () => {
            localStorage.setItem('authToken', authToken)
            const participantIds = [1, 2, 3]
            const treeResult = { rounds: [] }
            mockedAxios.post.mockResolvedValueOnce({ data: treeResult })

            const result = await championshipService.generateCompetitionTree(5, participantIds)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/championships/competitions/5/generate-tree`,
                participantIds,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(treeResult)
        })
    })

    // ─── Trials ────────────────────────────────────────────────────────────────

    describe('getTrialById', () => {
        it('fetches a trial by id', async () => {
            localStorage.setItem('authToken', authToken)
            const trial = { trialId: 12, trialName: 'Demi-finale', competitionId: 5 }
            mockedAxios.get.mockResolvedValueOnce({ data: trial })

            const result = await championshipService.getTrialById(12)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/trials/12`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(trial)
        })
    })

    describe('getTrialsByCompetition', () => {
        it('returns array when backend sends array', async () => {
            localStorage.setItem('authToken', authToken)
            const trials = [
                { trialId: 10, trialName: 'Quart A', competitionId: 5 },
                { trialId: 11, trialName: 'Quart B', competitionId: 5 },
            ]
            mockedAxios.get.mockResolvedValueOnce({ data: trials })

            const result = await championshipService.getTrialsByCompetition(5)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/trials/competition/5`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(trials)
        })

        it('wraps single trial in array when backend sends object', async () => {
            localStorage.setItem('authToken', authToken)
            const trial = { trialId: 10, trialName: 'Quart A', competitionId: 5 }
            mockedAxios.get.mockResolvedValueOnce({ data: trial })

            const result = await championshipService.getTrialsByCompetition(5)

            expect(result).toEqual([trial])
        })
    })

    describe('updateTrial', () => {
        it('puts trial update and returns updated trial', async () => {
            localStorage.setItem('authToken', authToken)
            const patch = { trialName: 'Finale' }
            const updated = { trialId: 12, trialName: 'Finale', competitionId: 5 }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await championshipService.updateTrial(12, patch)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/trials/12`,
                patch,
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('getTrialsByAthlete', () => {
        it('fetches trials for a given athlete', async () => {
            localStorage.setItem('authToken', authToken)
            const trials = [{ trialId: 10, trialName: 'Quart A', competitionId: 5 }]
            mockedAxios.get.mockResolvedValueOnce({ data: trials })

            const result = await championshipService.getTrialsByAthlete(99)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/trials/athlete/99`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(trials)
        })
    })

    // ─── Events ────────────────────────────────────────────────────────────────

    describe('getEventsByCompetition', () => {
        it('fetches events for a competition', async () => {
            localStorage.setItem('authToken', authToken)
            const events = [{ id: 1, name: 'Podium', startDate: '2026-06-01', endDate: '2026-06-01' }]
            mockedAxios.get.mockResolvedValueOnce({ data: events })

            const result = await championshipService.getEventsByCompetition(5)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/competitions/5/events`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(events)
        })
    })

    describe('getEventById', () => {
        it('fetches a single event by id', async () => {
            localStorage.setItem('authToken', authToken)
            const event = { id: 1, name: 'Podium' }
            mockedAxios.get.mockResolvedValueOnce({ data: event })

            const result = await championshipService.getEventById(1)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                `${apiBaseUrl}/events/1`,
                expect.objectContaining({ headers: authHeader }),
            )
            expect(result).toEqual(event)
        })
    })

    describe('createEvent', () => {
        it('posts event payload and returns created event', async () => {
            localStorage.setItem('authToken', authToken)
            const payload = { name: 'Cérémonie', startDate: '2026-06-02', endDate: '2026-06-02' }
            const created = { id: 4, ...payload }
            mockedAxios.post.mockResolvedValueOnce({ data: created })

            const result = await championshipService.createEvent(payload as never)

            expect(mockedAxios.post).toHaveBeenCalledWith(
                `${apiBaseUrl}/events`,
                expect.objectContaining({ name: 'Cérémonie' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(created)
        })
    })

    describe('updateEvent', () => {
        it('puts event update and returns updated event', async () => {
            localStorage.setItem('authToken', authToken)
            const patch = { name: 'Cérémonie modifiée', startDate: '2026-06-03', endDate: '2026-06-03' }
            const updated = { id: 4, ...patch }
            mockedAxios.put.mockResolvedValueOnce({ data: updated })

            const result = await championshipService.updateEvent(4, patch)

            expect(mockedAxios.put).toHaveBeenCalledWith(
                `${apiBaseUrl}/events/4`,
                expect.objectContaining({ name: 'Cérémonie modifiée' }),
                expect.objectContaining({ headers: expect.objectContaining({ ...authHeader, ...jsonHeader }) }),
            )
            expect(result).toEqual(updated)
        })
    })

    describe('deleteEvent', () => {
        it('deletes event by id', async () => {
            localStorage.setItem('authToken', authToken)
            mockedAxios.delete.mockResolvedValueOnce({})

            await championshipService.deleteEvent(4)

            expect(mockedAxios.delete).toHaveBeenCalledWith(
                `${apiBaseUrl}/events/4`,
                expect.objectContaining({ headers: authHeader }),
            )
        })
    })

    // ─── No auth token ─────────────────────────────────────────────────────────

    describe('getAuthHeaders without token', () => {
        it('returns empty object when no token stored', () => {
            const headers = championshipService.getAuthHeaders()
            expect(headers).toEqual({})
        })
    })
})
