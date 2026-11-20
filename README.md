# MY CUSTOM WEBSITE — AI Prompt Builder

Starter project full-stack untuk membuat master prompt Game, APK/Android, Website, AI Chatbot, UI/UX, Business/SaaS, Image, Video, dan Custom.

## Fitur yang sudah tersedia
- Prompt generator berbasis blueprint kategori (bekerja tanpa API AI eksternal).
- Editor output prompt.
- Copy prompt dan download TXT.
- Template library dan pencarian kategori.
- Register/login Supabase Auth.
- Simpan prompt ke database, riwayat, favorit, hapus, dan buka kembali di editor.
- Dashboard admin dengan statistik dan daftar pengguna.
- Proteksi data melalui Supabase Row Level Security.
- SEO metadata dasar dan layout responsive.

> Catatan: generator saat ini adalah prompt composer berbasis template, bukan model AI yang memanggil LLM. Untuk menghasilkan prompt dengan AI sungguhan, integrasikan API AI melalui server-side route dan simpan API key hanya di environment variable server. Jangan pernah menaruh secret key di browser.

## 1. Persiapan
Buat akun:
- GitHub: https://github.com
- Supabase: https://supabase.com
- Vercel: https://vercel.com

Buat project Supabase baru, lalu buka SQL Editor dan jalankan seluruh isi `supabase/schema.sql`.

Di Supabase, buka Project Settings > API dan salin:
- Project URL
- anon/public key

Jangan gunakan `service_role` key di frontend.

## 2. Menjalankan di Android
Cara paling mudah adalah menggunakan GitHub + Vercel tanpa menjalankan server lokal.

### Opsi A — Langsung lewat GitHub (disarankan)
1. Download ZIP proyek ini dan ekstrak di HP.
2. Buka https://github.com lalu login.
3. Buat repository baru bernama `my-custom-website`.
4. Upload seluruh isi folder proyek (bukan folder ZIP-nya).
5. Pastikan `package.json`, folder `app`, `lib`, dan `supabase` berada di root repository.

### Opsi B — Menjalankan lokal memakai Termux
1. Install Termux dari F-Droid atau sumber resmi Termux.
2. Buka Termux dan jalankan:

```bash
pkg update && pkg upgrade -y
pkg install nodejs-lts git -y
node -v
npm -v
```

3. Masuk ke folder proyek. Jika file ZIP berada di Download:

```bash
termux-setup-storage
cd ~/storage/downloads
unzip my-custom-website.zip
cd my-custom-website
npm install
```

4. Buat file `.env.local` di root proyek, isi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

5. Jalankan:

```bash
npm run dev
```

6. Buka browser Android ke `http://localhost:3000`.

Jika paket Node.js di Termux atau perangkat tidak kompatibel, gunakan opsi GitHub + Vercel.

## 3. Mengaktifkan database dan login
1. Buat project di Supabase.
2. SQL Editor > New query.
3. Tempel isi `supabase/schema.sql`, lalu klik Run.
4. Salin Project URL dan anon key.
5. Masukkan keduanya sebagai environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Di Supabase Authentication > URL Configuration, setelah deploy, atur Site URL menjadi URL Vercel kamu. Tambahkan URL preview/callback yang diperlukan sesuai domain deployment.
7. Daftar akun dari website. Jika email confirmation aktif, konfirmasi email dahulu.

## 4. Jadikan akun pertama sebagai admin
1. Login/daftar melalui website.
2. Di Supabase > Table Editor > profiles, cari baris dengan email/id akun kamu (kolom id).
3. Salin UUID `id`.
4. Buka SQL Editor dan jalankan, ganti UUID dengan milikmu:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID-AKUN-ANDA';
```

5. Logout lalu login kembali. Menu Admin Dashboard akan muncul.

Jangan pernah memberi role admin kepada akun yang tidak dipercaya.

## 5. Deploy ke Vercel
1. Buka https://vercel.com dan login menggunakan GitHub.
2. Pilih Add New > Project.
3. Import repository `my-custom-website`.
4. Framework akan terdeteksi sebagai Next.js.
5. Buka Environment Variables dan masukkan dua variable Supabase di atas.
6. Klik Deploy.
7. Setelah selesai, buka domain `.vercel.app` yang diberikan.
8. Jika mengubah environment variable, lakukan redeploy agar perubahan diterapkan.

## 6. Setelah online
- Tes register, verifikasi email bila aktif, login, logout.
- Buat prompt lalu tes copy dan download.
- Simpan prompt, cek riwayat dan favorit.
- Tes akses dashboard admin dengan akun admin.
- Cek tampilan HP dan desktop.
- Tambahkan domain sendiri dari Vercel jika diperlukan.

## 7. Keamanan dan batasan
- Database memakai RLS agar user hanya dapat mengakses prompt miliknya.
- Role admin diatur melalui SQL, bukan dari form publik.
- Jangan pernah memasukkan Supabase service role key ke `NEXT_PUBLIC_*`.
- Gunakan password unik dan aktifkan verifikasi email.
- Generator bawaan tidak mengirim permintaan ke AI eksternal. Hasil dibuat dari blueprint lokal.
- Untuk fitur AI sungguhan, buat API route server-side, validasi input, batasi penggunaan/rate limit, dan simpan provider API key hanya sebagai environment variable server.
- SEO dasar sudah tersedia; sebelum publikasi tambahkan favicon, gambar Open Graph, domain, sitemap, robots.txt, kebijakan privasi, dan halaman legal sesuai kebutuhan.

## Struktur folder

```text
my-custom-website/
├── app/
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   ├── prompt-templates.js
│   └── supabase.js
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```
