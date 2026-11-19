# MoLeCall — 2.5D Multiplayer Fantasy MOBA Platform

> **Call Your Power. Rule The Battle.**

MoLeCall adalah platform game **MOBA 2.5D isometric berbasis browser** dengan tema visual **Blue Sky & Soft Pink**, dukungan penuh dua bahasa (**Bahasa Indonesia & English**), 12 hero original, peta simetris **The Kingdom of Aetheria**, mode **Offline vs AI (Easy/Normal/Hard)**, serta lobi **Multiplayer 5v5 WebSocket**.

---

## Kredit & Identitas

- **Developed by**: VennDev
- **Website Request**: Callysta
- **Instagram Developer**: [@wazzz.dotcom](https://www.instagram.com/wazzz.dotcom/)

---

## Fitur Utama

1. **Landing Page & Bilingual System (ID / EN)**:
   - Pergantian bahasa instan Bahasa Indonesia (default) & English yang tersimpan di `localStorage`.
2. **Autentikasi Firebase & Guest Mode**:
   - Login, Register (Username, Avatar, Email/Password), Reset Password, Google Sign-In, serta **Guest Mode** untuk bermain Offline vs AI tanpa akun.
3. **Phaser.js 2.5D Isometric MOBA Engine (`The Kingdom of Aetheria`)**:
   - 3 Lane (Top, Mid, Bot), 18 Turret (3 per lane per tim), Blue & Red Nexus, Sungai Ajaib, Semak (Bushes), dan Jungle Monster Buff (Azure Sky Golem, Blossom Wyrm, River Sprites).
   - **Kontrol PC**: `WASD` Gerak, Mouse Bidik, Klik Kiri Serangan Dasar, `Q` Skill 1, `E` Skill 2, `R` Ultimate, `B` Recall, `Space` Fokus Kamera, `Tab`/`I` Toko Item, `Esc`/`P` Jeda.
   - **Kontrol Mobile**: Virtual Joystick sentuh, tombol Basic Attack, Skill `Q`/`E`/`R`, Recall `B`, dan Kamera.
4. **12 Hero Original**:
   - Aether (Mage), Valeria (Marksman), Kael (Assassin), Seraphina (Support), Draven (Fighter), Lunaria (Mage), Ragnar (Tank), Evelyne (Marksman), Zephyr (Assassin), Aurelia (Support), Darius (Fighter), Nyxara (Mage).
5. **Offline 5v5 AI & Online 5v5 WebSocket Server**:
   - AI rekan & lawan menavigasi lane, melawan minion, menyerang turret, mundur saat HP rendah, dan bertahan di base.
   - Server WebSocket (`server.ts` pada `/ws`) mengelola pembuatan ruang, Quick Match, pemilihan hero, kesiapan tim, dan obrolan lobi.

---

## Struktur Folder

```text
├── firebase-applet-config.json  # Konfigurasi Firebase project
├── firebase-blueprint.json      # Skema IR Firestore
├── firestore.rules              # Aturan keamanan Firestore
├── server.ts                    # Express + WebSocket authoritative server & Vite middleware
├── index.html                   # Entry HTML & Google Fonts
├── src/
│   ├── audio/soundEngine.ts     # Web Audio API synthesizer (SFX & BGM)
│   ├── components/              # Navbar, LandingPage, AuthModal, GameArenaView, Dashboard
│   ├── data/                    # Heroes (12), Items (15), Ranks (8), Collection, News
│   ├── game/                    # MoLeCallScene.ts, aiSystem.ts, mapData.ts, rules.ts
│   ├── localization/i18n.tsx    # Kamus bilingual ID/EN
│   ├── services/firebase.ts     # Firebase Auth & Firestore helpers
│   └── types/game.ts            # Definisi TypeScript
```

---

## Cara Instalasi & Menjalankan

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Mode Pengembangan (Port 3000)
```bash
npm run dev
```
Buka browser ke `http://localhost:3000`.

### 3. Menjalankan Unit Test Logika Game
```bash
npx --yes tsx --test src/game/rules.test.ts
```

### 4. Build & Produksi
```bash
npm run build
NODE_ENV=production npm start
```

---

## Firebase Setup & Environment Variables

1. Konfigurasi Firebase Web SDK dimuat dari `firebase-applet-config.json`.
2. Aktifkan provider **Email/Password** dan **Google** pada Firebase Console → Authentication → Sign-in method.
3. Deploy aturan keamanan dari `firestore.rules` ke project Firebase Anda.
4. Variabel environment pada `.env.example`:
   - `GEMINI_API_KEY`: Opsional (tidak digunakan di frontend).
   - `APP_URL`: URL publik aplikasi saat deploy.

---

## Deploy ke Vercel

1. Hubungkan repositori proyek ini ke **Vercel**.
2. Gunakan pengaturan build:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Untuk server WebSocket stateful penuh (`server.ts`), jalankan di lingkungan Node persisten (seperti Cloud Run, Railway, atau Render) pada port `3000`, sementara frontend statis (`dist`) dan Mode Offline vs AI berjalan langsung di Vercel tanpa backend.

---

## Cara Bermain

1. Buka aplikasi, lalu tekan **MAIN SEKARANG** atau **Mode Tamu (Offline vs Bot)**.
2. Pada menu **Bermain**, pilih kesulitan AI (**Easy / Normal / Hard**) dan pilih Hero favoritmu.
3. Tekan **MULAI PERTANDINGAN** untuk masuk ke peta **The Kingdom of Aetheria**.
4. Hancurkan turret lawan bersama minion, kumpulkan Gold untuk membeli item di **Toko Item** (`Tab`), dan hancurkan **Red Nexus** untuk meraih kemenangan!
