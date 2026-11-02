import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <Layout>
            <div className="flex min-h-screen flex-col items-center justify-between px-4 py-8 text-center sm:py-12">
                <Link
                    to="/"
                    className="flex w-full shrink-0 items-center justify-center font-ferrite text-3xl font-medium tracking-widest transition-all duration-300 sm:text-4xl"
                >
                    OWO
                </Link>
                <div className="flex w-full flex-col items-center gap-6 sm:gap-8">
                    <h1 className="font-ferrite text-3xl leading-tight sm:text-5xl lg:text-6xl">Nothing to see here!</h1>

                    <Button label="Go Back" className="w-full max-w-md" onClick={() => navigate("/overview")} />
                </div>

                <div></div>

            </div>
        </Layout>
    )
}
