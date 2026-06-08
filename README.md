# LunasFTZ — Landed Cost Calculator for Batam FTZ Importers

<div align="center">
  <p><strong>Aplikasi hitung landed cost barang impor untuk kawasan FTZ (Free Trade Zone) Batam.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react" alt="React 18.3" />
    <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript" alt="TypeScript 5.6" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  </p>
</div>

---

## 📖 Tentang

**LunasFTZ** membantu importir barang di kawasan **FTZ Batam** menghitung total biaya kepabeanan dan pajak impor secara cepat. Aplikasi ini menggunakan data kurs dan kode HS dari Google Spreadsheet yang bisa kamu update sendiri.

**Fitur utama:**

- ✅ Kalkulasi **Bea Masuk**, **PPN**, **PPH**, dan **total landed cost**
- ✅ Data **kurs valuta asing** (USD, RMB, SGD) otomatis dari Google Sheets
- ✅ Pencarian **Kode HS** dengan tarif Bea Masuk yang sesuai
- ✅ Dukungan status **NPWP** (tarif PPH berbeda)
- ✅ **Riwayat kalkulasi** tersimpan di LocalStorage
- ✅ *PWA-ready* — bisa diinstal sebagai aplikasi di HP/desktop
- ✅ Desain mobile-first dengan Tailwind CSS

---

## 🚀 Mulai Cepat

### Prasyarat

- Node.js 18+ dan npm

### Instalasi

```bash
# Clone repositori
git clone https://github.com/username/lunasftzapp.git
cd lunasftzapp

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

### Build Production

```bash
npm run build
npm run preview
```

---

## 🔧 Konfigurasi

### Google Spreadsheet (Data Kurs & HS Code)

Aplikasi membaca data dari **Google Spreadsheet**. Buat spreadsheet dengan dua sheet:

| Sheet Name    | Kolom                                 |
|---------------|---------------------------------------|
| ExchangeRates | Kolom A: Mata Uang, Kolom B: Kurs IDR |
| HSCodes       | Kolom A: Kode HS, Kolom B: Kategori, Kolom C: Tarif BM (%) |

Buat file `.env` di root project:

```env
VITE_SHEET_ID=your_google_sheet_id_here
```

> **Catatan:** Pastikan spreadsheet di-**publikasikan** (_File → Share → Publish to web_) agar bisa diakses oleh aplikasi. Jika tidak dikonfigurasi, aplikasi akan menggunakan nilai kurs *fallback* bawaan (hardcoded).

### Ikon Aplikasi

Untuk PWA, generate ikon dengan:

```bash
npm run generate-icons
```

---

## 🗂️ Struktur Proyek

```
lunasftzapp/
├── public/
│   ├── icons/              # PWA icons
│   └── favicon.svg
├── scripts/
│   └── generate-icons.cjs  # Script generate PWA icons
├── src/
│   ├── components/
│   │   ├── Calculator.tsx   # Form input kalkulasi
│   │   ├── ResultBreakdown.tsx # Rincian hasil perhitungan
│   │   └── SavedList.tsx    # Riwayat kalkulasi tersimpan
│   ├── hooks/
│   │   ├── useSheetData.ts  # Fetch data dari Google Sheets
│   │   ├── useTaxCalc.ts    # Logika perhitungan pajak
│   │   └── useSavedCalcs.ts # Manajemen riwayat (LocalStorage)
│   ├── utils/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧮 Rumus Perhitungan

Kalkulasi mengikuti aturan kepabeanan impor FTZ Batam:

| Komponen          | Rumus                                                  |
|-------------------|--------------------------------------------------------|
| **CIF (IDR)**     | (Harga Beli × Kurs) + Ongkir                          |
| **Bea Masuk**     | CIF × Tarif BM (%)                                     |
| **Nilai Impor**   | CIF + Bea Masuk                                        |
| **PPN**           | Nilai Impor × 11% (tarif PPN umum)                    |
| **PPH (NPWP)**    | Nilai Impor × 7.5% (dengan NPWP) / 15% (tanpa NPWP)   |
| **Total**         | Nilai Impor + PPN + PPH                                |

---

## 🛠️ Tech Stack

| Teknologi       | Keterangan                       |
|-----------------|----------------------------------|
| **React 18**    | Library UI                       |
| **TypeScript**  | Type safety                      |
| **Vite 6**      | Build tool & dev server          |
| **Tailwind CSS 4** | Utility-first styling        |
| **Vite PWA**    | Progressive Web App support      |

---

## 🤝 Kontribusi

Pull request dipersilakan. Untuk perubahan besar, buka issue terlebih dahulu untuk diskusi.

1. Fork repositori
2. Buat branch fitur (`git checkout -b fitur/foo`)
3. Commit perubahan (`git commit -m 'Add foo'`)
4. Push ke branch (`git push origin fitur/foo`)
5. Buat Pull Request

---

## ⚠️ Catatan Penting

- **File spreadsheet di folder `/files/` bersifat internal** dan tidak di-commit ke repositori.
- Jangan commit file `.env` yang berisi **Google Sheet ID** asli. Gunakan `.env.example` sebagai template.
- Aplikasi ini **tidak mengirim data ke server** — semua kalkulasi berjalan di sisi klien (browser).

---

## 📄 Lisensi

MIT © 2026 — Dibuat dengan ❤️ untuk importir Batam.