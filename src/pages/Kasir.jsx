import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
    FiSearch,
    FiShoppingCart,
    FiX,
    FiPlus,
    FiMinus,
    FiCheckCircle,
} from "react-icons/fi";

export default function Kasir() {
    const [produk, setProduk] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    // State untuk Fitur Bayar (Popup & Kembalian)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uangDiterima, setUangDiterima] = useState("");
    const [transaksiSukses, setTransaksiSukses] = useState(false);

    useEffect(() => {
        fetchProduk();
    }, []);

    async function fetchProduk() {
        const { data, error } = await supabase
        .from("produk")
        .select("*")
        .order("nama_produk");

        if (error) {
        console.error(error);
        return;
        }
        setProduk(data);
    }

    function tambahKeranjang(item) {
        if (item.stok <= 0) {
        alert("Stok produk ini sudah habis! ✿");
        return;
        }

        setCart((prev) => {
        const existing = prev.find((p) => p.id === item.id);
        if (existing) {
            if (existing.qty >= item.stok) {
            alert(`Stok tidak mencukupi. Maksimal pembelian ${item.stok} pcs ✿`);
            return prev;
            }
            return prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + 1 } : p
            );
        }
        return [...prev, { ...item, qty: 1 }];
        });
    }

    function tambahQty(id, maksimalStok) {
        setCart((prev) =>
        prev.map((item) => {
            if (item.id === id) {
            if (item.qty >= maksimalStok) {
                alert(
                `Stok tidak mencukupi. Maksimal pembelian ${maksimalStok} pcs ✿`
                );
                return item;
            }
            return { ...item, qty: item.qty + 1 };
            }
            return item;
        })
        );
    }

    function kurangQty(id) {
        setCart((prev) =>
        prev
            .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
            .filter((item) => item.qty > 0)
        );
    }

    const filteredProduk = useMemo(() => {
        return produk.filter((item) =>
        item.nama_produk.toLowerCase().includes(search.toLowerCase())
        );
    }, [produk, search]);

    const totalBayar = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.harga_jual * item.qty, 0);
    }, [cart]);

    // Perhitungan Kembalian Real-time
    const kembalian = useMemo(() => {
        const uang = parseFloat(uangDiterima) || 0;
        return uang - totalBayar;
    }, [uangDiterima, totalBayar]);

    // Menangani pemicu awal klik tombol "Proses Bayar"
    function handleBukaModalBayar() {
        if (cart.length === 0) {
        alert("Keranjang belanja masih kosong ✿");
        return;
        }
        setUangDiterima("");
        setTransaksiSukses(false);
        setIsModalOpen(true);
    }

    // Fungsi Final Simpan Transaksi ke Supabase (Tanpa Cetak Struk)
    async function eksekusiPembayaran(e) {
        e.preventDefault();
        if (kembalian < 0) {
        alert("Uang yang dibayarkan masih kurang! ✿");
        return;
        }

        try {
        setLoading(true);

        // 1. INSERT PENJUALAN
        const { data: penjualan, error: errorPenjualan } = await supabase
            .from("penjualan")
            .insert({
            total_bayar: totalBayar,
            metode_pembayaran: "Tunai",
            })
            .select()
            .single();

        if (errorPenjualan) throw errorPenjualan;

        // 2. INSERT DETAIL PENJUALAN
        const detailItems = cart.map((item) => ({
            penjualan_id: penjualan.id,
            produk_id: item.id,
            jumlah: item.qty,
            harga_satuan: item.harga_jual,
            harga_beli_satuan: item.harga_beli,
            keuntungan: (item.harga_jual - item.harga_beli) * item.qty,
        }));

        const { error: detailError } = await supabase
            .from("detail_penjualan")
            .insert(detailItems);

        if (detailError) throw detailError;

        // 3. UPDATE STOK DB
        for (const item of cart) {
            const stokBaru = item.stok - item.qty;
            const { error } = await supabase
            .from("produk")
            .update({ stok: stokBaru })
            .eq("id", item.id);

            if (error) throw error;
        }

        setTransaksiSukses(true);
        setCart([]);
        fetchProduk();
        } catch (error) {
        console.error(error);
        alert("Gagal menyimpan transaksi");
        } finally {
        setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-6 pb-32 text-left relative selection:bg-[#810b38]/10">
        {/* HEADER DAN PENCARIAN */}
        <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl mb-8 font-serif font-bold text-[#541a1a]">
                Menu Kasir
            </h1>
            <p className="text-xs text-gray-400">
                Pilih produk untuk memulai transaksi penjualan harian
            </p>
            </div>

            {/* BAR PENCARIAN */}
            <div className="bg-white border border-[#dcc3aa] px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-3 w-full sm:max-w-md">
            <FiSearch className="text-[#810b38] opacity-60 shrink-0" size={18} />
            <input
                type="text"
                placeholder="Cari nama produk di sini..."
                className="w-full bg-transparent outline-none text-sm text-[#541a1a] placeholder:italic"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
                <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-[#810b38]"
                >
                <FiX size={16} />
                </button>
            )}
            </div>
        </div>

        {/* KATALOG PRODUK RESPONSIVE (Bentuk Card Cantik) */}
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProduk.map((item) => {
            const adaDiCart = cart.find((p) => p.id === item.id);
            const sisaStokTersedia = item.stok - (adaDiCart ? adaDiCart.qty : 0);

            return (
                <div
                key={item.id}
                onClick={() => sisaStokTersedia > 0 && tambahKeranjang(item)}
                className={`bg-white border border-[#dcc3aa] rounded-2xl p-4 flex flex-col justify-between h-44 shadow-xs transition-all relative select-none
                    ${
                    sisaStokTersedia <= 0
                        ? "opacity-40 bg-gray-50 cursor-not-allowed"
                        : "hover:shadow-md cursor-pointer hover:border-[#810b38] active:scale-98"
                    }`}
                >
                {/* Info Atas Card */}
                <div>
                    <h3 className="font-serif font-bold text-sm md:text-base text-[#541a1a] line-clamp-2 leading-tight mb-1">
                    {item.nama_produk}
                    </h3>
                    <p className="text-[#810b38] font-bold text-xs md:text-sm">
                    Rp {item.harga_jual.toLocaleString()}
                    </p>
                </div>

                {/* Status Bawah Card */}
                <div className="pt-2 border-t border-[#fdfbf7] flex items-center justify-between mt-auto">
                    <span
                    className={`text-[10px] md:text-xs font-semibold ${
                        item.stok <= 3 ? "text-red-500 font-bold" : "text-gray-400"
                    }`}
                    >
                    {sisaStokTersedia <= 0
                        ? "Habis"
                        : `Stok: ${sisaStokTersedia}`}
                    </span>

                    {/* Kuantitas Terpilih di Keranjang */}
                    {adaDiCart && (
                    <span className="bg-[#810b38] text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-scaleUp">
                        {adaDiCart.qty} dipilih
                    </span>
                    )}
                </div>
                </div>
            );
            })}
        </div>

        {/* DOCK BAR TRANSKASI KASIR (Selalu Menetap di Bagian Bawah Layar) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#dcc3aa] shadow-[0_-8px_24px_rgba(0,0,0,0.05)] z-40 p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Sisi Kiri: List Ringkasan Item di Keranjang */}
            <div className="flex items-center gap-3 overflow-x-auto py-1 max-w-full md:max-w-[60%] scrollbar-none">
                <div className="flex items-center gap-1.5 bg-[#fdfbf7] border border-[#dcc3aa] px-3 py-2 rounded-xl shrink-0">
                <FiShoppingCart className="text-[#810b38]" size={16} />
                <span className="text-xs font-bold text-[#541a1a]">
                    {cart.length} Jenis
                </span>
                </div>

                {cart.length === 0 ? (
                <p className="text-xs italic text-gray-400 pl-2">
                    Belum ada item ditambahkan ✿
                </p>
                ) : (
                cart.map((item) => (
                    <div
                    key={item.id}
                    className="flex items-center gap-2 bg-white border border-[#f1e2d1] px-2.5 py-1.5 rounded-xl shrink-0 text-xs shadow-2xs"
                    >
                    <span className="font-medium text-[#541a1a] max-w-[100px] truncate">
                        {item.nama_produk}
                    </span>
                    <div className="flex items-center gap-1 bg-[#fdfbf7] rounded-md border border-[#e2d5c5] ml-1">
                        <button
                        onClick={() => kurangQty(item.id)}
                        className="px-1.5 py-0.5 text-[#810b38] font-bold hover:bg-red-50 rounded-l-md"
                        >
                        -
                        </button>
                        <span className="font-bold text-[#541a1a] px-0.5">
                        {item.qty}
                        </span>
                        <button
                        onClick={() => tambahQty(item.id, item.stok)}
                        className="px-1.5 py-0.5 text-[#810b38] font-bold hover:bg-green-50 rounded-r-md"
                        >
                        +
                        </button>
                    </div>
                    </div>
                ))
                )}
            </div>

            {/* Sisi Kanan: Total Harga & Tombol Bayar */}
            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 shrink-0">
                <div className="text-left md:text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Total Tagihan
                </p>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#810b38]">
                    Rp {totalBayar.toLocaleString()}
                </h2>
                </div>

                <button
                onClick={handleBukaModalBayar}
                disabled={cart.length === 0}
                className="bg-[#810b38] text-white px-8 py-3 rounded-xl font-semibold transition-all hover:bg-[#541a1a] shadow-md disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 text-sm md:text-base"
                >
                Proses Bayar ✿
                </button>
            </div>
            </div>
        </div>

        {/* POPUP / MODAL KALKULATOR KEMBALIAN */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Tirai Gelap */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                onClick={() => !loading && setIsModalOpen(false)}
            />

            {/* Kotak Card Popup */}
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-[#dcc3aa] transform transition-all duration-300 scale-100">
                {/* Keadaan 1: Formulir Penghitung Uang */}
                {!transaksiSukses ? (
                <form onSubmit={eksekusiPembayaran}>
                    <div className="flex justify-between items-center pb-3 border-b border-[#f1e2d1] mb-5">
                    <h3 className="font-serif font-bold text-lg text-[#541a1a]">
                        Konfirmasi Pembayaran
                    </h3>
                    <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <FiX size={20} />
                    </button>
                    </div>

                    {/* Info Nominal Tagihan */}
                    <div className="bg-[#fdfbf7] border border-[#dcc3aa] p-4 rounded-xl text-center mb-5">
                    <p className="text-xs text-gray-400 mb-1">
                        JUMLAH TRANSAKSI YANG HARUS DIBAYAR
                    </p>
                    <p className="text-3xl font-serif font-black text-[#810b38]">
                        Rp {totalBayar.toLocaleString()}
                    </p>
                    </div>

                    {/* Input Nominal Pembayaran Cash */}
                    <div className="mb-5">
                    <label className="block text-xs font-bold text-[#541a1a] uppercase tracking-wide mb-2">
                        Uang yang Diterima dari Customer
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-4 text-sm font-bold text-gray-400">
                        Rp
                        </span>
                        <input
                        type="number"
                        required
                        placeholder="Masukkan jumlah uang cash..."
                        className="w-full bg-white border-2 border-[#dcc3aa] focus:border-[#810b38] outline-none rounded-xl pl-11 pr-4 py-3 text-lg font-bold text-[#541a1a]"
                        value={uangDiterima}
                        onChange={(e) => setUangDiterima(e.target.value)}
                        autoFocus
                        />
                    </div>
                    </div>

                    {/* Box Live Nilai Kembalian */}
                    <div className="mb-6 p-3 rounded-xl border border-dashed border-[#dcc3aa] flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                        Uang Kembalian:
                    </span>
                    <span
                        className={`text-lg font-bold ${
                        kembalian < 0 ? "text-red-500" : "text-emerald-600"
                        }`}
                    >
                        {kembalian < 0
                        ? "Uang Kurang"
                        : `Rp ${kembalian.toLocaleString()}`}
                    </span>
                    </div>

                    {/* Tombol Simpan Transaksi */}
                    <button
                    type="submit"
                    disabled={loading || kembalian < 0}
                    className="w-full bg-[#810b38] text-white py-3.5 rounded-xl font-bold transition-colors hover:bg-[#541a1a] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                    {loading
                        ? "Menyimpan ke Database..."
                        : "Selesaikan Transaksi ✿"}
                    </button>
                </form>
                ) : (
                /* Keadaan 2: Tampilan Sukses Pembayaran */
                <div className="text-center py-6 animate-scaleUp">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <FiCheckCircle size={36} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-[#541a1a] mb-1">
                    Transaksi Berhasil!
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">
                    Stok database otomatis diperbarui
                    </p>

                    <div className="bg-[#fdfbf7] p-3 rounded-xl border border-[#dcc3aa] text-left text-xs text-gray-600 space-y-1.5 mb-6">
                    <div className="flex justify-between">
                        <span>Total Belanja:</span>
                        <span className="font-bold">
                        Rp {totalBayar.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Uang Diterima:</span>
                        <span>
                        Rp {(parseFloat(uangDiterima) || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-emerald-600">
                        <span>Kembalian:</span>
                        <span>Rp {kembalian.toLocaleString()}</span>
                    </div>
                    </div>

                    <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-[#541a1a] text-white py-3 rounded-xl font-medium hover:bg-[#810b38]"
                    >
                    Selesai & Buka Menu Baru
                    </button>
                </div>
                )}
            </div>
            </div>
        )}
        </div>
    );
}
