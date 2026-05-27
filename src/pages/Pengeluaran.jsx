import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FiPlusCircle, FiDollarSign, FiCalendar, FiTag, FiFileText } from "react-icons/fi";

export default function Pengeluaran() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        kategori: "",
        nominal: "",
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
    });

    useEffect(() => {
        getPengeluaran();
    }, []);

    async function getPengeluaran() {
        const { data, error } = await supabase
            .from("pengeluaran")
            .select("*")
            .order("tanggal", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }
        setData(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase
                .from("pengeluaran")
                .insert([
                    {
                        kategori: form.kategori,
                        nominal: Number(form.nominal),
                        tanggal: form.tanggal,
                        keterangan: form.keterangan,
                    },
                ]);

            if (error) throw error;

            setForm({
                kategori: "",
                nominal: "",
                tanggal: new Date().toISOString().split("T")[0],
                keterangan: "",
            });

            getPengeluaran();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data pengeluaran ✿");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 text-left selection:bg-[#810b38]/10 animate-fadeIn">
            
            {/* HEADER */}
            <div className="mb-6">
                <h1 className="text-2xl font-serif font-bold text-[#541a1a]">
                    Pengeluaran Operasional
                </h1>
                <p className="text-xs text-gray-400">
                    Catat semua log pengeluaran taktis dan operasional toko atau cafe di sini
                </p>
            </div>

            {/* FORM INPUT EXPENSE */}
            <div className="bg-white border border-[#dcc3aa] rounded-2xl p-5 md:p-6 shadow-xs mb-8">
                <h2 className="text-sm font-serif font-bold text-[#541a1a] uppercase tracking-wide mb-4 flex items-center gap-2">
                    <FiPlusCircle className="text-[#810b38]" /> Tambah Log Pengeluaran Baru
                </h2>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kategori */}
                    <div className="relative flex items-center">
                        <FiTag className="absolute left-4 text-[#810b38] opacity-60" size={16} />
                        <input
                            type="text"
                            required
                            placeholder="Kategori (Misal: Bahan Baku, Listrik)"
                            className="w-full bg-white border border-[#dcc3aa] focus:border-[#810b38] outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-[#541a1a] placeholder:italic transition-colors"
                            value={form.kategori}
                            onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                        />
                    </div>

                    {/* Nominal */}
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-xs font-bold text-[#810b38] opacity-60">Rp</span>
                        <input
                            type="number"
                            required
                            placeholder="Nominal Pengeluaran"
                            className="w-full bg-white border border-[#dcc3aa] focus:border-[#810b38] outline-none rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-[#541a1a] transition-colors"
                            value={form.nominal}
                            onChange={(e) => setForm({ ...form, nominal: e.target.value })}
                        />
                    </div>

                    {/* Tanggal */}
                    <div className="relative flex items-center">
                        <FiCalendar className="absolute left-4 text-[#810b38] opacity-60" size={16} />
                        <input
                            type="date"
                            required
                            className="w-full bg-white border border-[#dcc3aa] focus:border-[#810b38] outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-[#541a1a] transition-colors"
                            value={form.tanggal}
                            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="relative flex items-center">
                        <FiFileText className="absolute left-4 text-[#810b38] opacity-60" size={16} />
                        <input
                            type="text"
                            placeholder="Keterangan tambahan (opsional)..."
                            className="w-full bg-white border border-[#dcc3aa] focus:border-[#810b38] outline-none rounded-xl pl-11 pr-4 py-3 text-sm text-[#541a1a] placeholder:italic transition-colors"
                            value={form.keterangan}
                            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                        />
                    </div>

                    {/* Tombol Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#810b38] text-white py-3 rounded-xl font-semibold transition-all hover:bg-[#541a1a] shadow-md disabled:opacity-40 disabled:cursor-not-allowed md:col-span-2 text-sm active:scale-99 mt-2"
                    >
                        {loading ? "Menyimpan ke Database..." : "Simpan Pengeluaran ✿"}
                    </button>
                </form>
            </div>

            {/* RIWAYAT PENGELUARAN (RESPONSIVE VIEW) */}
            <div className="bg-white border border-[#dcc3aa] rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#fdfbf7] bg-[#fdfbf7]/50">
                    <h2 className="text-sm font-serif font-bold text-[#541a1a] uppercase tracking-wide">
                        Riwayat Log Pengeluaran
                    </h2>
                </div>

                {/* 1. Tampilan Khusus Mobile / HP (Grid Cards) */}
                <div className="block md:hidden divide-y divide-gray-100">
                    {data.length === 0 ? (
                        <p className="p-6 text-center text-xs italic text-gray-400">Belum ada riwayat pengeluaran ✿</p>
                    ) : (
                        data.map((item) => (
                            <div key={item.id} className="p-4 space-y-2 hover:bg-[#fdfbf7]/30 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="inline-block bg-[#810b38]/10 text-[#810b38] font-semibold text-[10px] px-2 py-0.5 rounded-md mb-1">
                                            {item.kategori}
                                        </span>
                                        <h4 className="font-serif font-bold text-[#541a1a] text-sm">
                                            Rp {Number(item.nominal).toLocaleString()}
                                        </h4>
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-medium">
                                        {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                    </span>
                                </div>
                                {item.keterangan && (
                                    <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        {item.keterangan}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* 2. Tampilan Khusus Desktop / Tablet (Tabel) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#fdfbf7] border-b border-[#dcc3aa] text-xs font-bold text-[#541a1a] uppercase tracking-wider">
                                <th className="p-4 text-left font-serif">Tanggal</th>
                                <th className="p-4 text-left font-serif">Kategori</th>
                                <th className="p-4 text-left font-serif">Nominal</th>
                                <th className="p-4 text-left font-serif">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-[#541a1a]">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center italic text-gray-400">
                                        Belum ada riwayat pengeluaran ✿
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-[#fdfbf7]/30 transition-colors">
                                        <td className="p-4 font-medium text-gray-400 text-xs">
                                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-[#810b38]/5 text-[#810b38] border border-[#810b38]/10 font-semibold text-xs px-2.5 py-1 rounded-md">
                                                {item.kategori}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-[#810b38]">
                                            Rp {Number(item.nominal).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-gray-500 max-w-xs truncate italic">
                                            {item.keterangan || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}