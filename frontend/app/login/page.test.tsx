import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./page";
import api from "@/lib/api";

jest.mock("@/lib/api");
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("renders the email and password fields", () => {
        render(<LoginPage />);
        expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    });

    it("shows an error message when login fails", async () => {
        mockedApi.post.mockRejectedValueOnce(new Error("Invalid credentials"));
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByLabelText(/^email$/i), "nixon@example.com");
        await user.type(screen.getByLabelText(/^password$/i), "wrongpass");
        await user.click(screen.getByRole("button", { name: /log in/i }));

        expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    });

    it("stores tokens in localStorage on successful login", async () => {
        mockedApi.post.mockResolvedValueOnce({
            data: {
                token: "access-token",
                refreshToken: "refresh-token",
                role: "PATIENT",
            },
        });
        const user = userEvent.setup();

        render(<LoginPage />);
        await user.type(screen.getByLabelText(/^email$/i), "nixon@example.com");
        await user.type(screen.getByLabelText(/^password$/i), "correctpass");
        await user.click(screen.getByRole("button", { name: /log in/i }));

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("access-token");
            expect(localStorage.getItem("refreshToken")).toBe("refresh-token");
            expect(localStorage.getItem("role")).toBe("PATIENT");
        });
    });
});