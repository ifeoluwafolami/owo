import { Link } from "react-router-dom";
import ResetPasswordImage from "../assets/reset-password.jpg";
import Layout from "../components/Layout";

export default function ResetPassword() {
    return <Layout><div className="flex min-h-screen">
        <div className="hidden flex-1 bg-cover bg-center lg:block" style={{ backgroundImage: `url(${ResetPasswordImage})` }} aria-hidden="true" />
        <main className="grid flex-1 place-items-center px-6 text-center">
            <div className="max-w-lg text-blue">
                <Link to="/" className="font-ferrite text-4xl tracking-widest">OWO</Link>
                <h1 className="mt-10 text-3xl font-semibold">Password recovery is coming shortly</h1>
                <p className="mt-3 text-blue/65">This v1 server does not yet accept password-reset tokens. No password has been changed. Contact support if you are locked out.</p>
                <Link to="/login" className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue px-8 font-ferrite uppercase text-light-blue">Return to login</Link>
            </div>
        </main>
    </div></Layout>;
}
