import { Link } from "react-router-dom";
import ResetPasswordImage from "../assets/reset-password.jpg";
import Layout from "../components/Layout";

export default function ResetPassword() {
    return <Layout><div className="flex min-h-screen">
        <div className="hidden flex-1 bg-cover bg-center lg:block" style={{ backgroundImage: `url(${ResetPasswordImage})` }} aria-hidden="true" />
        <main className="grid flex-1 place-items-center px-4 py-10 text-center sm:px-8">
            <div className="max-w-lg text-blue">
                <Link to="/" className="font-ferrite text-3xl tracking-widest sm:text-4xl">OWO</Link>
                <h1 className="mt-8 text-2xl font-semibold sm:mt-10 sm:text-3xl">Password recovery is coming shortly</h1>
                <p className="mt-3 text-sm text-blue/65 sm:text-base">This v1 server does not yet accept password-reset tokens. No password has been changed. Contact support if you are locked out.</p>
                <Link to="/login" className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-blue px-5 py-3 text-center font-ferrite uppercase text-light-blue sm:px-8">Return to login</Link>
            </div>
        </main>
    </div></Layout>;
}
