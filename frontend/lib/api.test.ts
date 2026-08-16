jest.mock("axios", () => {
    const mockApiInstance = Object.assign(jest.fn(), {
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    });
    return {
        __esModule: true,
        default: {
            create: jest.fn(() => mockApiInstance),
            post: jest.fn(),
        },
    };
});

type MockAxiosConfig = {
    url?: string;
    headers: Record<string, string>;
    _retry?: boolean;
};

describe("api client", () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("attaches the Authorization header when a token exists", async () => {
        localStorage.setItem("token", "abc123");
        const api = (await import("./api")).default;

        const requestInterceptor = (api.interceptors.request.use as jest.Mock).mock.calls[0][0];
        const config: MockAxiosConfig = requestInterceptor({ headers: {} });

        expect(config.headers.Authorization).toBe("Bearer abc123");
    });

    it("does not attach an Authorization header when no token exists", async () => {
        const api = (await import("./api")).default;

        const requestInterceptor = (api.interceptors.request.use as jest.Mock).mock.calls[0][0];
        const config: MockAxiosConfig = requestInterceptor({ headers: {} });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it("logs the user out when a 401 arrives with no refresh token available", async () => {
        localStorage.setItem("token", "stale-token");
        const api = (await import("./api")).default;
        const responseErrorHandler = (api.interceptors.response.use as jest.Mock).mock.calls[0][1];

        const error = {
            response: { status: 401 },
            config: { url: "/appointments", headers: {}, _retry: false } as MockAxiosConfig,
        };

        await expect(responseErrorHandler(error)).rejects.toEqual(error);
        expect(localStorage.getItem("token")).toBeNull();
    });

    it("refreshes the token and retries the original request on a 401", async () => {
        localStorage.setItem("refreshToken", "refresh-abc");

        const axios = (await import("axios")).default;
        (axios.post as jest.Mock).mockResolvedValueOnce({ data: { token: "new-token" } });

        const api = (await import("./api")).default;
        (api as unknown as jest.Mock).mockResolvedValue({ data: "ok" });

        const responseErrorHandler = (api.interceptors.response.use as jest.Mock).mock.calls[0][1];
        const originalRequest: MockAxiosConfig = { url: "/appointments", headers: {}, _retry: false };
        const error = { response: { status: 401 }, config: originalRequest };

        await responseErrorHandler(error);

        expect(axios.post).toHaveBeenCalledWith(
            "http://localhost:8080/api/auth/refresh",
            { refreshToken: "refresh-abc" }
        );
        expect(localStorage.getItem("token")).toBe("new-token");
        expect(originalRequest.headers.Authorization).toBe("Bearer new-token");
        expect(api).toHaveBeenCalledWith(originalRequest);
    });
});