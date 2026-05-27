import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Kasir from "./pages/Kasir";
import Produk from "./pages/Produk";
import Pengeluaran from "./pages/Pengeluaran";
import Laporan from "./pages/Laporan";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/kasir" element={<Kasir />} />

          <Route path="/produk" element={<Produk />} />

          <Route path="/pengeluaran" element={<Pengeluaran />} />
          <Route path="/laporan" element={<Laporan />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
