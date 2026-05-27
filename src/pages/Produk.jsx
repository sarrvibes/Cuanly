import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { FiPlus, FiSearch, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function Produk() {
    const [produk, setProduk] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [selectedKategori, setSelectedKategori] = useState("Semua"); 

    const [form, setForm] = useState({
        nama_produk: "",
        harga_modal: "",
        harga_jual: "",
        stok: "",
        kategori: "", 
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchProduk();
    }, []);

    async function fetchProduk() {
        const { data, error } = await supabase
            .from("produk")
            .select("*")
            .order("id", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }
        setProduk(data);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const produkData = {
            nama_produk: form.nama_produk,
            kategori: form.kategori.trim() || "Lainnya",
            harga_modal: Number(form.harga_modal),
            harga_jual: Number(form.harga_jual),
            // Jika form.stok kosong, set nilainya jadi null di database
            stok: form.stok === "" || form.stok === null ? null : Number(form.stok),
        };

        if (editId) {
            const { error } = await supabase
                .from("produk")
                .update(produkData)
                .eq("id", editId);

            if (error) {
                console.error(error);
                return;
            }
        } else {
            const { error } = await supabase
                .from("produk")
                .insert([produkData]);
                
            if (error) {
                console.error(error);
                return;
            }
        }
        resetForm();
        setIsModalOpen(false); 
        fetchProduk();
    }

    function resetForm() {
        setEditId(null);
        setForm({
            nama_produk: "",
            harga_modal: "",
            harga_jual: "",
            stok: "",
            kategori: "",
        });
    }

    function handleEdit(item) {
        setEditId(item.id);
        setForm({
            nama_produk: item.nama_produk,
            harga_modal: item.harga_modal ?? "",
            harga_jual: item.harga_jual ?? "",
            stok: item.stok ?? "", // Jika null di database, jadikan string kosong di form
            kategori: item.kategori || "",
        });
        setIsModalOpen(true); 
    }

    async function handleDelete(id) {
        const confirmDelete = window.confirm("Hapus produk ini dari katalog? ✿");
        if (!confirmDelete) return;
        const { error } = await supabase.from("produk").delete().eq("id", id);
        if (error) {
            console.error(error);
            return;
        }
        fetchProduk();
    }

    const daftarKategori = ["Semua", ...new Set(produk.map((item) => item.kategori || "Lainnya"))];

    const filteredProduk = produk.filter((item) => {
        const matchesKategori = selectedKategori === "Semua" || (item.kategori || "Lainnya") === selectedKategori;
        const matchesSearch = item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesKategori && matchesSearch;
    });

    return (
        <div className="p-4 md:p-6 bg-transparent min-h-screen w-full max-w-full overflow-x-hidden">
            {/* HEADER UTAMA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pt-12 lg:pt-0">
                <h1 className="text-2xl md:text-3xl font-bold text-[#810b38] font-serif tracking-tight text-left">
                    Manajemen Produk{" "}
                    <span className="text-xs md:text-sm font-normal italic opacity-60 block md:inline">
                        Atur stok barang jualanmu ✿
                    </span>
                </h1>

                <button
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#810b38] text-white font-bold rounded-xl px-5 py-3 transition-all hover:bg-[#541a1a] shadow-md active:scale-95 text-sm self-start sm:self-auto w-full sm:w-auto"
                >
                    <FiPlus size={18} /> Tambah Produk Baru
                </button>
            </div>

            {/* BAR PENCARIAN */}
            <div className="bg-white border border-[#dcc3aa] rounded-2xl p-4 mb-6 shadow-xs flex items-center gap-3">
                <FiSearch className="text-[#810b38] opacity-60 shrink-0" size={20} />
                <input
                    type="text"
                    placeholder="Cari nama produk di sini..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent outline-none text-sm md:text-base text-[#541a1a] placeholder:italic placeholder:text-gray-400"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="text-gray-400 hover:text-[#810b38]"
                    >
                        <FiX size={18} />
                    </button>
                )}
            </div>

            {/* BUTTON GROUP FILTER KATEGORI */}
            <div className="flex overflow-x-auto pt-3 pb-3 px-1 -mt-3 mb-4 scrollbar-none justify-start items-center gap-2 w-full">
                {daftarKategori.map((kat) => (
                    <button
                        key={kat}
                        onClick={() => setSelectedKategori(kat)}
                        className={`px-4 py-2 rounded-xl text-m font-semibold transition-all duration-300 border whitespace-nowrap will-change-transform ${
                            selectedKategori === kat
                                ? "bg-[#810b38] text-white border-[#810b38] shadow-md -translate-y-0.5"
                                : "bg-white text-[#541a1a] border-[#dcc3aa] hover:bg-[#fdfbf7] hover:-translate-y-0.5 hover:shadow-sm"
                        }`}
                    >
                        {kat}
                    </button>
                ))}
            </div>

            {/* VIEW DATA */}
            <div className="w-full">
                {filteredProduk.length === 0 ? (
                    <div className="bg-white border border-[#dcc3aa] rounded-2xl p-8 text-center text-gray-400 font-medium italic">
                        Produk tidak ditemukan atau katalog masih kosong ✿
                    </div>
                ) : (
                    <>
                        {/* 1. Tampilan KARTU untuk layar HP */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredProduk.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-[#dcc3aa] rounded-2xl p-4 shadow-xs text-left relative transition-all active:scale-[0.99]"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-[#810b38] uppercase tracking-wider bg-[#810b38]/5 px-2 py-0.5 rounded-md mb-1 inline-block">
                                                {item.kategori || "Lainnya"}
                                            </span>
                                            <h3 className="font-serif font-bold text-lg text-[#541a1a] break-words">
                                                {item.nama_produk}
                                            </h3>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 ${
                                                item.stok === null || item.stok === undefined
                                                    ? "bg-gray-100 text-gray-500"
                                                    : item.stok <= 5
                                                    ? "bg-red-100 text-red-600"
                                                    : "bg-green-100 text-green-600"
                                            }`}
                                        >
                                            {item.stok === null || item.stok === undefined ? "Tanpa Stok" : `Stok: ${item.stok} pcs`}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f1e2d1] text-xs mb-4">
                                        <div>
                                            <p className="text-gray-400 font-medium">Harga Modal</p>
                                            <p className="text-gray-600 font-semibold">
                                                Rp {Number(item.harga_modal).toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[#810b38] font-medium">Harga Jual</p>
                                            <p className="text-[#810b38] font-bold">
                                                Rp {Number(item.harga_jual).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-[#dcc3aa] text-[#541a1a] py-2.5 rounded-xl text-xs font-semibold hover:bg-[#c9ad94]"
                                        >
                                            <FiEdit2 size={12} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-[#f1e2d1] text-[#810b38] py-2.5 rounded-xl text-xs font-semibold hover:bg-[#e7d1b8]"
                                        >
                                            <FiTrash2 size={12} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. Tampilan TABEL Tradisional untuk PC/Tablet */}
                        <div className="hidden md:block bg-white border border-[#dcc3aa] rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#fdfbf7] border-b border-[#dcc3aa]">
                                    <tr>
                                        <th className="p-4 font-serif text-[#810b38]">Nama Produk</th>
                                        <th className="p-4 font-serif text-[#810b38]">Kategori</th>
                                        <th className="p-4 font-serif text-[#810b38]">Harga Modal</th>
                                        <th className="p-4 font-serif text-[#810b38]">Harga Jual</th>
                                        <th className="p-4 font-serif text-[#810b38]">Stok</th>
                                        <th className="p-4 font-serif text-[#810b38] text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f1e2d1]">
                                    {filteredProduk.map((item) => (
                                        <tr key={item.id} className="hover:bg-[#fdfbf7] transition-colors">
                                            <td className="p-4 font-medium text-[#541a1a]">
                                                {item.nama_produk}
                                            </td>
                                            <td className="p-4 text-xs font-semibold text-[#810b38]/80 uppercase tracking-wide">
                                                {item.kategori || "Lainnya"}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                Rp {Number(item.harga_modal).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-[#810b38] font-semibold">
                                                Rp {Number(item.harga_jual).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                                        item.stok === null || item.stok === undefined
                                                            ? "bg-gray-100 text-gray-500"
                                                            : item.stok <= 5
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-green-100 text-green-600"
                                                    }`}
                                                >
                                                    {item.stok === null || item.stok === undefined ? "-" : `${item.stok} pcs`}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="bg-[#dcc3aa] text-[#541a1a] px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-[#c9ad94] transition-all"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-[#f1e2d1] text-[#810b38] px-4 py-1.5 rounded-xl text-sm font-semibold hover:bg-[#e7d1b8] transition-all"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </>
                )}
            </div>

            {/* OVERLAY MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
                    <div
                        className="absolute inset-0"
                        onClick={() => {
                            setIsModalOpen(false);
                            resetForm();
                        }}
                    />

                    <div className="bg-white border border-[#dcc3aa] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 text-left">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-serif font-bold text-[#810b38]">
                                {editId ? "Update Data Produk ✿" : "Tambah Produk Baru ✿"}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#810b38]"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[#541a1a] opacity-70 mb-1">
                                    Nama Barang/Menu
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Nasi Goreng"
                                    className="w-full border border-[#dcc3aa] rounded-xl p-3 focus:ring-2 focus:ring-[#810b38] outline-none transition-all placeholder:italic text-sm"
                                    value={form.nama_produk}
                                    required
                                    onChange={(e) =>
                                        setForm({ ...form, nama_produk: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[#541a1a] opacity-70 mb-1">
                                    Kategori
                                </label>
                                <input
                                    type="text"
                                    placeholder="Contoh: Makanan, Adds-on, Minuman"
                                    className="w-full border border-[#dcc3aa] rounded-xl p-3 focus:ring-2 focus:ring-[#810b38] outline-none transition-all placeholder:italic text-sm"
                                    value={form.kategori}
                                    required
                                    onChange={(e) =>
                                        setForm({ ...form, kategori: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-[#541a1a] opacity-70 mb-1">
                                        Harga Modal
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Rp"
                                        className="w-full border border-[#dcc3aa] rounded-xl p-3 focus:ring-2 focus:ring-[#810b38] outline-none transition-all text-sm"
                                        value={form.harga_modal}
                                        required
                                        onChange={(e) =>
                                            setForm({ ...form, harga_modal: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-[#541a1a] opacity-70 mb-1">
                                        Harga Jual
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Rp"
                                        className="w-full border border-[#dcc3aa] rounded-xl p-3 focus:ring-2 focus:ring-[#810b38] outline-none transition-all text-sm"
                                        value={form.harga_jual}
                                        required
                                        onChange={(e) =>
                                            setForm({ ...form, harga_jual: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-semibold text-[#541a1a] opacity-70">
                                        Stok Awal
                                    </label>
                                    <span className="text-[10px] text-gray-400 italic">Kosongkan jika menu/opsional</span>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Pcs (opsional)"
                                    className="w-full border border-[#dcc3aa] rounded-xl p-3 focus:ring-2 focus:ring-[#810b38] outline-none transition-all text-sm"
                                    value={form.stok}
                                    // Atribut required telah dihapus agar field bersifat opsional
                                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        resetForm();
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-500 font-semibold rounded-xl p-3 hover:bg-gray-200 transition-all text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-[#810b38] text-white font-semibold rounded-xl p-3 transition-all hover:bg-[#541a1a] shadow-md text-sm"
                                >
                                    Simpan Perubahan ✿
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}