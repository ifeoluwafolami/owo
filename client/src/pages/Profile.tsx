import { User } from "lucide-react";
import Layout from "../components/Layout";

export default function Profile() {
    return (
        <Layout showHeader={true}>
            <div className="min-h-screen flex flex-col justify-center items-center">
                <User className="size-30 border-8 border" />
            </div>
        </Layout>
    )
}