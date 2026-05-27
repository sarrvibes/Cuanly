import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FiChevronDown, FiPrinter } from "react-icons/fi";

export default function Laporan() {
    const [filter, setFilter] = useState("bulan");
    const [penjualan, setPenjualan] = useState([]);
    const [pengeluaran, setPengeluaran] = useState([]);
    const [summary, setSummary] = useState({
        penjualan: 0,
        pengeluaran: 0,
        laba: 0,
    });

    useEffect(() => {
        loadData();
    }, [filter]);

    function getDateRange() {
        const today = new Date();
        let startDate;

        if (filter === "hari") {
            startDate = new Date();
            startDate.setHours(0,0,0,0);
        } else if (filter === "7hari") {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
            startDate.setHours(0,0,0,0);
        } else {
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        }

        return {
            start: startDate.toISOString(),
            end: today.toISOString(),
        };
    }

    async function loadData() {
        const range = getDateRange();

        const { data: sales } = await supabase
            .from("penjualan")
            .select("*")
            .gte("tanggal", range.start)
            .lte("tanggal", range.end)
            .order("tanggal", { ascending: false });

        const { data: expenses } = await supabase
            .from("pengeluaran")
            .select("*")
            .gte("tanggal", range.start)
            .lte("tanggal", range.end)
            .order("tanggal", { ascending: false });

        const totalSales = sales?.reduce((sum, item) => sum + Number(item.total_bayar), 0) || 0;
        const totalExpense = expenses?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0;

        setSummary({
            penjualan: totalSales,
            pengeluaran: totalExpense,
            laba: totalSales - totalExpense,
        });

        setPenjualan(sales || []);
        setPengeluaran(expenses || []);
    }

    function handlePrint() {
        window.print();
    }

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen text-left text-[#541a1a] selection:bg-[#810b38]/10 animate-fadeIn dashboard-print">
            
            {/* CSS Print Rules Terintegrasi & Perbaikan Border Konflik */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; color: #000 !important; padding: 0 !important; }
                    
                    /* Solusi Konflik Border Menimpa & Potong Sudut */
                    .table-wrapper { 
                        overflow: visible !important; 
                        border: 1px solid #dcc3aa !important;
                        border-radius: 12px !important;
                    }
                    table { 
                        border-collapse: separate !important; 
                        border-spacing: 0 !important;
                        width: 100% !important; 
                    }
                    th {
                        border-bottom: 1px solid #dcc3aa !important;
                    }
                    tr:not(:last-child) td {
                        border-bottom: 1px solid #f3f4f6 !important;
                    }
                    
                    /* Otomatis Sembunyikan Header & Footer Default Browser */
                    @page { 
                        size: auto;   
                        margin: 15mm;  
                    }
                }
            `}} />

            {/* JUDUL */}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#541a1a] mb-6">
                Laporan Keuangan
            </h1>

            {/* ACTION BAR: FILTER & PRINT */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
                <div className="relative inline-block w-40">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-white border border-[#dcc3aa] text-sm text-[#541a1a] rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer appearance-none transition-all focus:border-[#810b38] font-medium"
                    >
                        <option value="hari">Hari Ini</option>
                        <option value="7hari">7 Hari Terakhir</option>
                        <option value="bulan">Bulan Ini</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[#810b38]">
                        <FiChevronDown size={16} />
                    </div>
                </div>

                <button
                    onClick={handlePrint}
                    className="bg-white hover:bg-[#fdfbf7] text-[#810b38] border border-[#dcc3aa] px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-semibold shadow-xs"
                >
                    <FiPrinter size={14} /> Cetak / Save PDF ✿
                </button>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="border border-[#dcc3aa] bg-[#fdfbf7]/20 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total Penjualan</p>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#541a1a]">
                        Rp {summary.penjualan.toLocaleString("id-ID")}
                    </h2>
                </div>

                <div className="border border-[#dcc3aa] bg-[#fdfbf7]/20 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#541a1a]">
                        Rp {summary.pengeluaran.toLocaleString("id-ID")}
                    </h2>
                </div>

                <div className="border border-[#810b38]/30 bg-gradient-to-b from-white to-[#fdfbf7]/30 rounded-2xl p-5 shadow-xs">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Laba Bersih</p>
                    <h2 className={`text-xl md:text-2xl font-serif font-bold ${summary.laba >= 0 ? "text-[#810b38]" : "text-rose-700"}`}>
                        Rp {summary.laba.toLocaleString("id-ID")}
                    </h2>
                </div>
            </div>

            {/* RINGKASAN PENJUALAN */}
            <h2 className="text-base md:text-lg font-serif font-bold text-[#541a1a] mb-3">
                Ringkasan Penjualan
            </h2>
            
            <div className="table-wrapper w-full overflow-x-auto border border-[#dcc3aa] rounded-2xl mb-10 shadow-xs">
                <table className="w-full border-collapse text-left text-xs md:text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#fdfbf7] border-b border-[#dcc3aa] font-bold text-[#541a1a]">
                            <th className="p-3.5 pl-5 font-serif">Tanggal</th>
                            <th className="p-3.5 font-serif text-center">Metode Pembayaran</th>
                            <th className="p-3.5 pr-5 text-right font-serif">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[#541a1a]/90">
                        {penjualan.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-6 text-center italic text-gray-400">
                                    Belum tersedia riwayat transaksi penjualan ✿
                                </td>
                            </tr>
                        ) : (
                            penjualan.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fdfbf7]/20 transition-colors">
                                    <td className="p-3.5 pl-5 font-medium text-gray-400">
                                        {new Date(item.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-3.5 text-center">
                                        <span className="bg-[#810b38] border border-[#810b38]-200/60 text-[#f1e2d1] font-medium uppercase px-2 py-0.5 rounded text-[12px] tracking-wide inline-block">
                                            {item.metode_pembayaran}
                                        </span>
                                    </td>
                                    <td className="p-3.5 pr-5 text-right font-bold text-[#810b38]">
                                        Rp {Number(item.total_bayar).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* RINGKASAN PENGELUARAN */}
            <h2 className="text-base md:text-lg font-serif font-bold text-[#541a1a] mb-3">
                Ringkasan Pengeluaran
            </h2>

            <div className="table-wrapper w-full overflow-x-auto border border-[#dcc3aa] rounded-2xl shadow-xs">
                <table className="w-full border-collapse text-left text-xs md:text-sm whitespace-nowrap">
                    <thead>
                        <tr className="bg-[#fdfbf7] border-b border-[#dcc3aa] font-bold text-[#541a1a]">
                            <th className="p-3.5 pl-5 font-serif">Tanggal</th>
                            <th className="p-3.5 font-serif text-center">Kategori</th>
                            <th className="p-3.5 pr-5 text-right font-serif">Nominal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-[#541a1a]/90">
                        {pengeluaran.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-6 text-center italic text-gray-400">
                                    Belum tersedia riwayat data pengeluaran ✿
                                </td>
                            </tr>
                        ) : (
                            pengeluaran.map((item) => (
                                <tr key={item.id} className="hover:bg-[#fdfbf7]/20 transition-colors">
                                    <td className="p-3.5 pl-5 font-medium text-gray-400">
                                        {new Date(item.tanggal).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-3.5 text-center">
                                        <span className="bg-rose-50 border border-rose-200 text-rose-700 font-medium uppercase px-2 py-0.5 rounded text-[12px] tracking-wide inline-block">
                                            {item.kategori}
                                        </span>
                                    </td>
                                    <td className="p-3.5 pr-5 text-right font-bold text-rose-700">
                                        Rp {Number(item.nominal).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}