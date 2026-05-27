import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
FiFileText,
FiHome,
FiShoppingCart,
FiPackage,
FiDollarSign,
FiMenu,
FiX,
} from "react-icons/fi";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const menu = [
        {
        name: "Dashboard",
        path: "/",
        icon: <FiHome />,
        },
        {
        name: "Kasir",
        path: "/kasir",
        icon: <FiShoppingCart />,
        },
        {
        name: "Produk",
        path: "/produk",
        icon: <FiPackage />,
        },
        {
        name: "Pengeluaran",
        path: "/pengeluaran",
        icon: <FiDollarSign />,
        },
        {
        name: "Laporan",
        path: "/laporan",
        icon: <FiFileText />,
        },
    ];

    return (
        <>
        {/* Tombol Hamburger - Hanya muncul di HP (< 1024px) */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#810b38] text-[#fdfbf7] rounded-xl shadow-[0_4px_12px_rgba(129,11,56,0.3)] transition-transform active:scale-95"
        >
            {isOpen ? <FiX size={16} /> : <FiMenu size={16} />}
        </button>

        {/* Komponen Utama Sidebar */}
        <aside
            className={`
            fixed lg:relative top-0 bottom-0 z-40
            w-64 min-h-screen p-5
            bg-[#fdfbf7] border-r border-[#dcc3aa]
            transition-all duration-300 ease-in-out
            ${
                isOpen
                ? "left-0 shadow-[0_0_30px_rgba(84,26,26,0.15)]"
                : "-left-full lg:left-0"
            }
            `}
        >
            {/* Judul Utama Cuanly */}
            <h1 className="text-2xl font-bold mb-10 text-[#810b38] font-serif italic tracking-tight pt-10 lg:pt-0">
            Cuanly
            </h1>

            <div className="space-y-2 text-left">
            {menu.map((item) => (
                <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)} // Otomatis menutup sidebar di HP setelah diklik
                className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${
                    isActive
                        ? "bg-[#810b38] text-[#fdfbf7] shadow-[0_4px_12px_rgba(129,11,56,0.3)] scale-[1.02]"
                        : "text-[#541a1a] hover:bg-[#f1e2d1] hover:translate-x-1"
                    }
                `}
                >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm tracking-wide">{item.name}</span>
                </NavLink>
            ))}
            </div>
        </aside>

        {/* Tirai Belakang (Overlay) - Menutup sidebar saat area luar diklik (Mobile saja) */}
        {isOpen && (
            <div
            className="fixed inset-0 bg-[#541a1a]/10 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
            />
        )}
        </>
    );
}
