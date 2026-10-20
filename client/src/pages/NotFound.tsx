import Layout from "../components/Layout";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function NotFound() {
    const navigate = useNavigate();
    return (
        <Layout>
            <div className="h-screen flex flex-col justify-between items-center py-12">
                <Link
                    to="/"
                    className="flex w-full shrink-0 items-center justify-center font-ferrite font-medium tracking-widest transition-all duration-300 group-hover/sidebar:justify-start group-hover/sidebar:px-6 group-focus-within/sidebar:justify-start group-focus-within/sidebar:px-6 group-data-[profile-open=true]/sidebar:justify-start group-data-[profile-open=true]/sidebar:px-6 text-4xl"
                >
                    OWO
                </Link>
                <div className="flex flex-col gap-8 items-center">
                    <h1 className="text-ferrite text-6xl">Nothing to see here!</h1>

                    <Button label="Go Back" className="max-w-md" onClick={() => navigate("/overview")} />
                </div>

                <div></div>
                
            </div>
        </Layout>
    )
}