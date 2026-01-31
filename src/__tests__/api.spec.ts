import {beforeEach, describe, expect, it, vi} from 'vitest'

type RequestHandler = (config: { headers?: Record<string, string> }) => unknown
type ResponseErrorHandler = (error: { response?: { status?: number } }) => Promise<never>

let requestHandler: RequestHandler | undefined
let responseErrorHandler: ResponseErrorHandler | undefined

const createMock = vi.fn(() => ({
    interceptors: {
        request: {
            use: vi.fn((onFulfilled) => {
                requestHandler = onFulfilled
            }),
        },
        response: {
            use: vi.fn((_onFulfilled, onRejected) => {
                responseErrorHandler = onRejected
            }),
        },
    },
}))

vi.mock('axios', () => ({
    default: {
        create: createMock,
    },
}))

describe('api client', () => {
    beforeEach(async () => {
        localStorage.clear()
        createMock.mockClear()
        requestHandler = undefined
        responseErrorHandler = undefined

    await import('@/services/api.ts')
    })

    it('creates the axios client with expected defaults', () => {
        expect(createMock).toHaveBeenCalledWith({
            baseURL: 'http://localhost:8080',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    })

    it('does not add Authorization header when no auth token exists', () => {
        const config = {headers: {} as Record<string, string>}

        requestHandler?.(config)

        expect(config.headers.Authorization).toBeUndefined()
    })
})
