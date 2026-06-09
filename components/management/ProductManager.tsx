"use client";

import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import ProductModal from "./ProductModal";
import type { Stall, Product, ProductFormData, ModalMode, ProductCategory } from "../types";
import { PRODUCT_CATEGORY_META, STALL_TYPE_META } from "../constants";
import { formatNumber, getUniqueId } from "../utils";

interface ProductManagerProps {
  products: Product[];
  stalls:   Stall[];
  onAdd:      (product: Product)    => void;
  onUpdate:   (product: Product)    => void;
  onDelete:   (productId: string)   => void;
  onToggleAvailable: (productId: string) => void;
}

export default function ProductManager({
  products, stalls, onAdd, onUpdate, onDelete, onToggleAvailable,
}: ProductManagerProps) {
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filterStall, setFilterStall]   = useState("ALL");
  const [filterCat, setFilterCat]       = useState<ProductCategory | "ALL">("ALL");

  const openCreate = () => { setModalMode("create"); setEditTarget(null); setModalOpen(true); };
  const openEdit   = (p: Product) => { setModalMode("edit"); setEditTarget(p); setModalOpen(true); };

  const handleSave = (data: ProductFormData) => {
    const stallName = stalls.find((s) => s.id === data.stallId)?.name ?? "";
    if (modalMode === "edit" && editTarget) {
      onUpdate({ ...editTarget, ...data, stallName });
    } else {
      onAdd({
        id: getUniqueId("prod"),
        ...data,
        stallName,
        createdAt: new Date().toISOString().split("T")[0],
      } as Product);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) { onDelete(deleteId); setDeleteId(null); }
  };

  // Filtered list
  const filtered = useMemo(() => {
    let list = products;
    if (filterStall !== "ALL") list = list.filter((p) => p.stallId === filterStall);
    if (filterCat   !== "ALL") list = list.filter((p) => p.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.stallName.toLowerCase().includes(q));
    }
    return list;
  }, [products, filterStall, filterCat, search]);

  const lowStockCount  = products.filter((p) => p.stock <= p.minStockAlert && p.stock > 0).length;
  const outStockCount  = products.filter((p) => p.stock <= 0).length;
  const unavailCount   = products.filter((p) => !p.isAvailable).length;

  return (
    <div className="space-y-5">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-[800] text-[#1e3d1f]">Mahsulotlar boshqaruvi</h3>
          <p className="text-[11px] text-[#637063] mt-0.5">
            Jami {products.length} ta ·
            {lowStockCount > 0 && <span className="text-amber-600 font-[700]"> ⚠ {lowStockCount} kam zaxira ·</span>}
            {outStockCount > 0 && <span className="text-red-600 font-[700]"> ✖ {outStockCount} tugagan ·</span>}
            {unavailCount > 0  && <span className="text-slate-500"> {unavailCount} nofaol</span>}
          </p>
        </div>
        <button onClick={openCreate} className="btn btn-primary btn-sm">
          <Plus className="w-4 h-4" />
          Yangi mahsulot
        </button>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9daa9e]" />
          <input className="input pl-9" placeholder="Mahsulot yoki rasta nomi bo'yicha qidiring..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {/* Stall filter */}
        <select className="input sm:w-52" value={filterStall}
          onChange={(e) => setFilterStall(e.target.value)}>
          <option value="ALL">Barcha rastalar</option>
          {stalls.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* ── Category tabs ── */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", ...Object.keys(PRODUCT_CATEGORY_META)] as (ProductCategory | "ALL")[]).map((c) => {
          const meta = c !== "ALL" ? PRODUCT_CATEGORY_META[c as ProductCategory] : null;
          const count = c === "ALL" ? products.length
            : products.filter((p) => p.category === c).length;
          return (
            <button key={c}
              onClick={() => setFilterCat(c)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-[700] border transition-all
                ${filterCat === c
                  ? "bg-[#1e3d1f] text-white border-[#1e3d1f]"
                  : "bg-white text-[#637063] border-[#dedad3] hover:border-[#4d8751]"
                }`}
            >
              {meta && <span>{meta.emoji}</span>}
              <span>{meta ? meta.label : "Barchasi"}</span>
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* ── Product table ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-[#9daa9e]">
          <Search className="w-10 h-10 stroke-[1.2]" />
          <p className="text-sm font-[600]">Hech narsa topilmadi</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mahsulot</th>
                  <th>Rasta</th>
                  <th>Kategoriya</th>
                  <th className="text-right">Narx</th>
                  <th className="text-right">Tannarx</th>
                  <th className="text-right hidden md:table-cell">Marjin</th>
                  <th className="text-center">Zaxira</th>
                  <th className="text-center">Holat</th>
                  <th className="text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((p) => {
                    const catMeta    = PRODUCT_CATEGORY_META[p.category];
                    const isLow      = p.stock > 0 && p.stock <= p.minStockAlert;
                    const isEmpty    = p.stock <= 0;
                    const margin     = p.costPrice && p.price
                      ? Math.round(((p.price - p.costPrice) / p.price) * 100)
                      : null;
                    return (
                      <tr key={p.id}>
                        {/* Name */}
                        <td>
                          <div>
                            <p className="font-[700] text-[#1e3d1f] text-xs">{p.name}</p>
                            {p.prepTime != null && p.prepTime > 0 && (
                              <p className="text-[10px] text-[#9daa9e]">⏱ {p.prepTime} daqiqa</p>
                            )}
                          </div>
                        </td>
                        {/* Stall */}
                        <td>
                          <span className="text-xs text-[#637063] font-[500]">{p.stallName}</span>
                        </td>
                        {/* Category */}
                        <td>
                          <span className="flex items-center gap-1 text-xs text-[#637063]">
                            <span>{catMeta.emoji}</span>
                            <span>{catMeta.label}</span>
                          </span>
                        </td>
                        {/* Price */}
                        <td className="text-right">
                          <span className="font-[800] text-[#1e3d1f] font-mono text-xs">
                            {formatNumber(p.price)}
                          </span>
                        </td>
                        {/* Cost */}
                        <td className="text-right">
                          <span className="font-[600] text-[#637063] font-mono text-xs">
                            {p.costPrice ? formatNumber(p.costPrice) : "—"}
                          </span>
                        </td>
                        {/* Margin */}
                        <td className="text-center hidden md:table-cell">
                          {margin !== null ? (
                            <span className={`badge text-[10px]
                              ${margin >= 40 ? "badge-green"
                                : margin >= 20 ? "badge-amber"
                                : "badge-red"
                              }`}>
                              {margin}%
                            </span>
                          ) : <span className="text-[#c4ccc4]">—</span>}
                        </td>
                        {/* Stock */}
                        <td className="text-center">
                          <span className={`badge text-[10px] font-mono
                            ${isEmpty ? "badge-red"
                              : isLow  ? "badge-amber"
                              : "badge-green"
                            }`}>
                            {isEmpty && <AlertTriangle className="w-2.5 h-2.5" />}
                            {p.stock} {p.unit ?? "dona"}
                          </span>
                        </td>
                        {/* Available toggle */}
                        <td className="text-center">
                          <button onClick={() => onToggleAvailable(p.id)}
                            title={p.isAvailable ? "Nofaol qilish" : "Faol qilish"}>
                            {p.isAvailable
                              ? <ToggleRight className="w-6 h-6 text-emerald-500 mx-auto" />
                              : <ToggleLeft  className="w-6 h-6 text-[#c4ccc4] mx-auto" />
                            }
                          </button>
                        </td>
                        {/* Actions */}
                        <td>
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => openEdit(p)}
                              className="btn-icon btn-icon-sm" title="Tahrirlash">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => setDeleteId(p.id)}
                              className="btn-icon btn-icon-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100"
                              title="O'chirish">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Product modal ── */}
      {modalOpen && (
        <ProductModal
          mode={modalMode}
          product={editTarget}
          stalls={stalls}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10,26,11,.72)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ scale: .93, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: .93, y: 16 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-[800] text-[#1e3d1f]">Mahsulot o'chirilsinmi?</p>
                  <p className="text-xs text-[#637063] mt-0.5">
                    «{products.find((p) => p.id === deleteId)?.name}» mahsuloti o'chib ketadi.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn btn-secondary flex-1">Bekor</button>
                <button onClick={handleDelete}
                  className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0">
                  <Trash2 className="w-4 h-4" /> O'chirish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
