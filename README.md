# Bank Soal SD

Aplikasi web untuk membantu orang tua mengajari anak SD dengan bank soal yang terstruktur.

## Fitur

- **Bank Soal Terstruktur**: Soal dikelompokkan berdasarkan Mata Pelajaran dan Topik.
- **Progress Tracking**: Memantau perkembangan belajar anak.
- **Interaktif**: Soal pilihan ganda dengan pengecekan jawaban otomatis dan pembahasan.
- **Multi-User**: Mendukung banyak anak dalam satu akun orang tua.

## Persiapan Awal (Firebase Setup)

Sebelum menjalankan aplikasi, Anda perlu menyiapkan project Firebase.

### 1. Buat Project Firebase

1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Klik **"Create a project"**.
3.  Beri nama project (misal: `bank-soal-sd`).
4.  Matikan Google Analytics (opsional) untuk setup lebih cepat.
5.  Klik **"Create project"**.

### 2. Aktifkan Layanan

Setelah masuk ke dashboard project, aktifkan layanan berikut di menu **Build**:

- **Authentication**:

  1.  Klik **Authentication** > **Get started**.
  2.  Pilih tab **Sign-in method**.
  3.  Klik **Email/Password** dan aktifkan (Enable).
  4.  Klik **Save**.

- **Firestore Database**:

  1.  Klik **Firestore Database** > **Create database**.
  2.  Pilih lokasi server (misal: `asia-southeast2` untuk Jakarta).
  3.  Pilih **Start in test mode** (untuk development) atau **Production mode**.
  4.  Klik **Create**.

- **Storage**:
  1.  Klik **Storage** > **Get started**.
  2.  Pilih **Start in test mode** atau **Production mode**.
  3.  Klik **Done**.

### 3. Dapatkan API Key (Config)

1.  Di dashboard project, klik icon **Web** (`</>`) di bagian atas (atau via Project Settings > General > Your apps).
2.  Masukkan nama aplikasi (misal: `Bank Soal Web`).
3.  Klik **Register app**.
4.  Anda akan melihat kode konfigurasi `const firebaseConfig = { ... }`.
5.  Salin nilai-nilai di dalamnya untuk langkah selanjutnya.

## Instalasi & Setup Lokal

### 1. Clone & Install

```bash
# Masuk ke direktori web
cd web

# Install dependencies
npm install
```

### 2. Konfigurasi Environment

Buat file `.env.local` dari contoh yang ada:

```bash
cp .env.example .env.local
```

Buka file `.env.local` dan isi dengan config yang didapat dari langkah "Dapatkan API Key" di atas:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=api_key_anda
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=sender_id_anda
NEXT_PUBLIC_FIREBASE_APP_ID=app_id_anda
```

### 3. Seed Data Awal (Isi Database)

Agar aplikasi tidak kosong, kita perlu mengisi data mata pelajaran dan topik awal.

1.  Di Firebase Console, buka **Project Settings** (icon gear) > **Service accounts**.
2.  Klik **Generate new private key**.
3.  Simpan file JSON yang terdownload ke dalam folder `web` dengan nama `serviceAccountKey.json`.
4.  Jalankan script seeding:
    ```bash
    node scripts/seedFirestore.js
    ```
5.  Jika berhasil, akan muncul pesan `✅ Seeding completed`.

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Deployment

### Deploy ke Vercel (Recommended)

1.  Push kode ke GitHub/GitLab.
2.  Buka [Vercel Dashboard](https://vercel.com/dashboard) > **Add New...** > **Project**.
3.  Import repository git Anda.
4.  Di bagian **Environment Variables**, masukkan semua key yang ada di `.env.local` satu per satu.
5.  Klik **Deploy**.

### Deploy ke Firebase Hosting

1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Init project: `firebase init hosting`
    - Pilih project yang sudah dibuat.
    - Public directory: `out` (jika static export) atau biarkan default jika menggunakan framework integration.
    - Configure as single-page app: `Yes`.
4.  Build & Deploy:
    ```bash
    npm run build
    firebase deploy --only hosting
    ```
