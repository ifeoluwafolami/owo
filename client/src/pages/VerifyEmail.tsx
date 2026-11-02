import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api";
import Layout from "../components/Layout";
import { useToast } from "../components/Toast";

export default function VerifyEmail() {
    const toast = useToast();
    const [params] = useSearchParams();
    const token = params.get("token");
    const [message, setMessage] = useState(
        token ? "Verifying your email address…" : "This verification link is incomplete."
    );
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;

        void api<{ message: string }>("/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ token }),
        }, false).then((result) => {
            setSuccess(true);
            setMessage(result.message);
            toast.success(result.message);
        }).catch((error: Error) => {
            setMessage(error.message);
            toast.error(error.message);
        });
    }, [toast, token]);

    return <Layout><main className="grid min-h-screen place-items-center px-4 py-10 text-center sm:px-6">
        <div className="w-full max-w-lg rounded-2xl bg-light-blue p-5 text-blue shadow-xl sm:rounded-3xl sm:p-8">
            <h1 className="text-xl font-semibold sm:text-2xl">{success ? "Email verified" : "Email verification"}</h1>
            <p className="mt-3 break-words text-sm sm:text-base">{message}</p>
            <Link className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue px-5 py-3 font-semibold text-light-blue sm:w-auto sm:px-6" to="/login">
                Continue to login
            </Link>
        </div>
    </main></Layout>;
}
