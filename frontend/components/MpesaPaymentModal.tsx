"use client";

import { useState } from "react";
import { usePayment } from "@/lib/usePayment";

type Step = "phone" | "waiting" | "success" | "error";

const PHONE_REGEX = /^(?:\+?254|0)[17]\d{8}$/;

interface MpesaPaymentModalProps {
    appointmentId: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    amount: number;
    initialPhone?: string;
    onClose: () => void;
    onPaid: () => void;
}

export default function MpesaPaymentModal({
    appointmentId,
    patientId,
    patientName,
    doctorId,
    doctorName,
    amount,
    initialPhone = "",
    onClose,
    onPaid,
}: MpesaPaymentModalProps) {
    const { initiateStkPush, confirmPayment } = usePayment();

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState(initialPhone);
    const [phoneError, setPhoneError] = useState("");
    const [receipt, setReceipt] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = phone.trim();
        if (!PHONE_REGEX.test(trimmed)) {
            setPhoneError("Enter a valid Safaricom number, e.g. 0712345678");
            return;
        }
        setPhoneError("");
        setStep("waiting");

        try {
            const payment = await initiateStkPush({
                appointmentId,
                patientId,
                patientName,
                doctorId,
                doctorName,
                amount,
                phoneNumber: trimmed,
            });

            await new Promise((resolve) => setTimeout(resolve, 2600));

            const confirmed = await confirmPayment(payment.id);
            setReceipt(confirmed.mpesaReceiptNumber || "");
            setStep("success");
        } catch {
            setErrorMessage("Something went wrong processing that payment. Please try again.");
            setStep("error");
        }
    }

    function handleDone() {
        onPaid();
        onClose();
    }

    return (
        <div
            className="fixed inset-0 z-70 flex items-center justify-center bg-gray-900/50 p-4"
            onClick={step === "waiting" ? undefined : onClose}
        >
            <style>{`
                @keyframes drawCheck {
                    from { stroke-dashoffset: 48; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes circleIn {
                    from { transform: scale(0.7); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .draw-check {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: drawCheck 0.5s ease-out 0.3s forwards;
                }
                .circle-in {
                    animation: circleIn 0.35s ease-out both;
                }
                @keyframes pulseRing {
                    0% { transform: scale(1); opacity: 0.5; }
                    100% { transform: scale(1.6); opacity: 0; }
                }
                .pulse-ring {
                    animation: pulseRing 1.6s ease-out infinite;
                }

                @keyframes printFeed {
                    from { max-height: 0; opacity: 0; transform: translateY(-6px); }
                    60% { opacity: 1; }
                    to { max-height: 220px; opacity: 1; transform: translateY(0); }
                }
                .receipt-print {
                    overflow: hidden;
                    max-height: 0;
                    animation: printFeed 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;
                }
                @keyframes tornEdgeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .torn-edge {
                    opacity: 0;
                    animation: tornEdgeIn 0.2s ease-out 1.3s forwards;
                }

                @media (prefers-reduced-motion: reduce) {
                    .draw-check, .circle-in, .pulse-ring { animation: none; }
                    .receipt-print { animation: none; max-height: none; opacity: 1; }
                    .torn-edge { animation: none; opacity: 1; }
                }
            `}</style>

            <div
                className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {step === "phone" && (
                    <>
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4CAF50]/10 text-[#4CAF50]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                                    <rect x="5" y="2" width="14" height="20" rx="2" />
                                    <path d="M12 18h.01" />
                                </svg>
                            </span>
                            <h2 className="text-lg font-semibold text-gray-900">Pay with M-Pesa</h2>
                        </div>

                        <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
                            <p className="text-xs text-gray-500">Amount to pay</p>
                            <p className="text-2xl font-semibold text-gray-900">KSh {amount.toLocaleString()}</p>
                            <p className="mt-0.5 text-xs text-gray-500">to HealthLink Kenya</p>
                        </div>

                        <form onSubmit={handleSend} className="mt-4 space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">M-Pesa Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="0712345678"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}

                            <button
                                type="submit"
                                className="mt-3 w-full rounded-lg bg-[#4CAF50] py-2.5 text-sm font-semibold text-white transition hover:bg-[#43A047]"
                            >
                                Send STK Push
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full rounded-lg py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </form>
                    </>
                )}

                {step === "waiting" && (
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                            <span className="pulse-ring absolute h-16 w-16 rounded-full bg-[#4CAF50]/40" />
                            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#4CAF50]/10 text-[#4CAF50]">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                                    <rect x="5" y="2" width="14" height="20" rx="2" />
                                    <path d="M12 18h.01" />
                                </svg>
                            </span>
                        </div>
                        <p className="mt-5 text-sm font-semibold text-gray-900">Check your phone</p>
                        <p className="mt-1 max-w-240px text-sm text-gray-500">
                            Enter your M-Pesa PIN on {phone} to complete the payment of KSh{" "}
                            {amount.toLocaleString()}.
                        </p>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center py-4 text-center">
                        <div className="circle-in flex h-16 w-16 items-center justify-center rounded-full bg-[#4CAF50]">
                            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
                                <path
                                    d="M5 13l4 4L19 7"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="draw-check"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-base font-semibold text-gray-900">Payment Successful</p>

                        <div className="receipt-print relative mt-4 w-full">
                            <div className="w-full space-y-2 rounded-t-lg bg-gray-50 px-4 py-3 text-left text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="font-medium text-gray-900">KSh {amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Paid to</span>
                                    <span className="font-medium text-gray-900">HealthLink</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Receipt No.</span>
                                    <span className="font-mono font-medium text-gray-900">{receipt}</span>
                                </div>
                            </div>
                            <div
                                className="torn-edge h-3 w-full bg-gray-50"
                                style={{
                                    maskImage:
                                        "radial-gradient(circle at 6px 0, transparent 6px, black 6.5px)",
                                    maskSize: "12px 12px",
                                    maskRepeat: "repeat-x",
                                    WebkitMaskImage:
                                        "radial-gradient(circle at 6px 0, transparent 6px, black 6.5px)",
                                    WebkitMaskSize: "12px 12px",
                                    WebkitMaskRepeat: "repeat-x",
                                }}
                            />
                        </div>

                        <button
                            onClick={handleDone}
                            className="mt-5 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Done
                        </button>
                    </div>
                )}

                {step === "error" && (
                    <div className="flex flex-col items-center py-4 text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 8v4M12 16h.01" />
                            </svg>
                        </span>
                        <p className="mt-4 text-sm font-medium text-gray-900">{errorMessage}</p>
                        <div className="mt-5 flex w-full gap-2">
                            <button
                                onClick={() => setStep("phone")}
                                className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}