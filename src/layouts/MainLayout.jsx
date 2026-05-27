import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
return (
<div className="flex">
    <Sidebar />

    <main
    className="
        flex-1
        bg-[#fdfbf7]
        min-h-screen
    "
    >
    {children}
    </main>
</div>
);
}
