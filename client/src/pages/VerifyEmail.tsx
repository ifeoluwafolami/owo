import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";

export default function VerifyEmail() {
    const [params] = useSearchParams();
    const token = params.get("token");
    const [message, setMessage] = useState(token ? "Verifying your email address…" : "This verification link is incomplete.");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) return;
        void api<{ message: string }>("/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ token }),
        }, false).then((result) => {
            setSuccess(true);
            setMessage(result.message);
        }).catch((error: Error) => setMessage(error.message));
    }, [token]);

    return <Layout><main className="grid min-h-screen place-items-center px-6 text-center">
        <div className="max-w-lg rounded-3xl bg-light-blue p-8 text-blue shadow-xl">
            <h1 className="text-2xl font-semibold">{success ? "Email verified" : "Email verification"}</h1>
            <p className="mt-3">{message}</p>
            <Link className="mt-6 inline-flex rounded-xl bg-blue px-6 py-3 font-semibold text-light-blue" to="/login">Continue to login</Link>
        </div>
    </main></Layout>;
}
