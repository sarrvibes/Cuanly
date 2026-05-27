import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Dashboard() {
const [grossIncome, setGrossIncome] = useState(0);
const [expenseTotal, setExpenseTotal] = useState(0);
const [netProfit, setNetProfit] = useState(0);
const [loading, setLoading] = useState(true);

useEffect(() => {
    loadDashboard();
}, []);

async function loadDashboard() {
        try {
        // PENJUALAN
        const { data: sales } = await supabase
            .from("penjualan")
            .select("total_bayar");

        const totalSales =
            sales?.reduce((sum, item) => sum + Number(item.total_bayar), 0) || 0;

        // PENGELUARAN
        const { data: expenses } = await supabase
            .from("pengeluaran")
            .select("nominal");

        const totalExpense =
            expenses?.reduce((sum, item) => sum + Number(item.nominal), 0) || 0;

        // HPP
        const { data: details } = await supabase
            .from("detail_penjualan")
            .select("keuntungan");

        const totalProfit =
            details?.reduce((sum, item) => sum + Number(item.keuntungan), 0) || 0;

        // Sesuai dengan logika kode lama kamu (Catatan: pastikan totalHpp terdefinisi di scope/file kamu jika dibutuhkan)
        const finalExpense =
            totalExpense + (typeof totalHpp !== "undefined" ? totalHpp : 0);
        const profit = totalSales - finalExpense;

        setGrossIncome(totalSales);
        setExpenseTotal(finalExpense);
        setNetProfit(profit);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    }

    if (loading) {
        return (
        <div className="p-8 font-serif italic text-[#810b38]">
            Loading data cantikmu... ✿
        </div>
        );
    }

    return (
        // Mengubah bg-slate-100 menjadi transparan agar background index.css menyatu sempurna
        <div className="p-6 bg-transparent min-h-screen w-full text-left">
        <h1 className="text-3xl font-bold mb-8 text-[#810b38] font-serif tracking-tight">
            Dashboard Cuanly{" "}
            <span className="text-sm font-normal normal-case italic opacity-70 block lg:inline lg:ml-2">
            Ringkasan toko hari ini ✿
            </span>
        </h1>

        {/* Grid responsif: 1 kolom di HP, 3 kolom di PC */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PENGHASILAN */}
            <div className="bg-white border border-[#dcc3aa] rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,195,170,0.5)] hover:-translate-y-1">
            <p className="text-[#541a1a] opacity-60 font-semibold text-sm tracking-wide">
                Penghasilan Kotor
            </p>
            <h2 className="text-3xl font-bold mt-2 text-[#541a1a] font-serif">
                <span className="text-sm font-normal italic mr-1">Rp</span>
                {grossIncome.toLocaleString()}
            </h2>
            </div>

            {/* PENGELUARAN */}
            <div className="bg-white border border-[#dcc3aa] rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(129,11,56,0.15)] hover:-translate-y-1">
            <p className="text-[#810b38] opacity-70 font-semibold text-sm tracking-wide">
                Total Pengeluaran
            </p>
            <h2 className="text-3xl font-bold mt-2 text-[#810b38] font-serif">
                <span className="text-sm font-normal italic mr-1">Rp</span>
                {expenseTotal.toLocaleString()}
            </h2>
            </div>

            {/* PROFIT */}
            <div
            className={`
            rounded-2xl p-6 text-[#fdfbf7] transition-all duration-300 hover:scale-[1.02]
            ${
                netProfit >= 0
                ? "bg-[#810b38] shadow-[0_8px_20px_rgba(129,11,56,0.35)]"
                : "bg-[#541a1a] shadow-[0_8px_20px_rgba(84,26,26,0.35)]"
            }
            `}
            >
            <p className="font-semibold text-sm tracking-wide opacity-90">
                Keuntungan Bersih
            </p>
            <h2 className="text-3xl font-bold mt-2 font-serif text-white drop-shadow-sm">
                <span className="text-sm font-normal italic mr-1">Rp</span>
                {netProfit.toLocaleString()}
            </h2>
            </div>
        </div>
        </div>
    );
}
