export const categories = [
  { id: "game", name: "Game Development", icon: "🎮", desc: "Game 2D, 3D, mobile, PC, mechanics, story." },
  { id: "apk", name: "APK / Android App", icon: "📱", desc: "Aplikasi Android, fitur, UI, database, build APK." },
  { id: "website", name: "Website / Web App", icon: "🌐", desc: "Landing page, dashboard, SaaS, e-commerce." },
  { id: "chatbot", name: "AI Chatbot", icon: "🤖", desc: "Asisten AI, customer service, knowledge bot." },
  { id: "uiux", name: "UI / UX Design", icon: "🎨", desc: "Design system, wireframe, prototype." },
  { id: "business", name: "Business / SaaS", icon: "🚀", desc: "Ide bisnis, strategi produk, monetisasi." },
  { id: "image", name: "AI Image", icon: "🖼️", desc: "Prompt gambar, karakter, ilustrasi, produk." },
  { id: "video", name: "AI Video", icon: "🎬", desc: "Storyboard, adegan, kamera, video generatif." },
  { id: "custom", name: "Custom Prompt", icon: "✨", desc: "Bangun prompt untuk kebutuhan lainnya." }
];

const blueprints = {
  game: {
    role: "senior game designer, gameplay programmer, technical artist, dan QA lead",
    goal: "rancang dan bangun game yang menyenangkan, stabil, mudah dikembangkan, dan sesuai target platform",
    deliverables: "game concept, core loop, gameplay mechanics, controls, level design, progression, UI/UX, art direction, audio direction, architecture, milestones, testing plan, dan contoh implementasi",
    checks: "jelaskan performa target, accessibility, save system, balancing, edge cases, dan optimasi"
  },
  apk: {
    role: "senior Android engineer, product designer, backend engineer, dan QA lead",
    goal: "rancang aplikasi Android siap dikembangkan dan diuji, dengan pengalaman pengguna yang jelas",
    deliverables: "product requirement, user flows, screen list, UI components, navigation, data model, API contract, permissions, offline behavior, security, testing, dan build/release steps",
    checks: "minimalkan permission, amankan data, validasi input, tangani error dan loading, serta jelaskan kompatibilitas Android"
  },
  website: {
    role: "senior full-stack engineer, UI/UX designer, SEO specialist, dan QA lead",
    goal: "rancang website responsif, accessible, cepat, aman, dan mudah dipelihara",
    deliverables: "site map, user journeys, page specifications, design system, frontend architecture, backend/API, database schema, authentication, SEO, analytics plan, tests, dan deployment guide",
    checks: "validasi form, loading/error/empty states, responsive breakpoints, accessibility, security, metadata, sitemap, dan performance"
  },
  chatbot: {
    role: "conversational AI architect, prompt engineer, product designer, dan safety reviewer",
    goal: "rancang asisten AI yang berguna, konsisten, aman, dan transparan terhadap batasannya",
    deliverables: "system prompt, persona, scope, conversation flows, knowledge strategy, tool rules, fallback behavior, evaluation set, privacy notes, dan deployment plan",
    checks: "cegah prompt injection, lindungi data pribadi, hindari klaim palsu, dan sediakan eskalasi ke manusia bila perlu"
  },
  uiux: {
    role: "lead product designer, UX researcher, dan design systems specialist",
    goal: "buat pengalaman produk yang intuitif, konsisten, accessible, dan berorientasi pada pengguna",
    deliverables: "personas, user journeys, information architecture, wireframes, visual direction, component library, responsive states, interaction specs, dan usability test plan",
    checks: "kontras warna, keyboard navigation, readable typography, touch targets, dan states untuk setiap komponen"
  },
  business: {
    role: "product strategist, startup operator, market researcher, dan financial planner",
    goal: "susun konsep bisnis yang realistis, dapat diuji, dan memiliki model operasional yang jelas",
    deliverables: "problem statement, target customer, value proposition, competitor assumptions, MVP, pricing hypotheses, go-to-market, metrics, risks, dan 30/60/90-day roadmap",
    checks: "bedakan fakta dan asumsi, sebutkan cara validasi, dan jangan mengarang data pasar"
  },
  image: {
    role: "art director, visual prompt engineer, dan composition specialist",
    goal: "hasilkan arahan visual yang spesifik, koheren, dan mudah dipahami model gambar",
    deliverables: "subject, environment, composition, camera, lighting, color palette, materials, style, mood, details, and negative constraints",
    checks: "hindari instruksi saling bertentangan dan jelaskan elemen yang harus tetap konsisten"
  },
  video: {
    role: "film director, cinematographer, storyboard artist, dan generative video prompt engineer",
    goal: "buat konsep video dengan adegan, gerakan kamera, subjek, dan kontinuitas yang jelas",
    deliverables: "logline, scene breakdown, shot list, camera movement, subject motion, lighting, pacing, transitions, sound direction, and continuity notes",
    checks: "jaga konsistensi karakter, lokasi, arah gerak, dan urutan waktu"
  },
  custom: {
    role: "senior consultant, solution architect, researcher, dan quality reviewer",
    goal: "selesaikan kebutuhan pengguna dengan pendekatan terstruktur dan hasil yang bisa ditindaklanjuti",
    deliverables: "objective, requirements, assumptions, solution options, implementation plan, examples, validation checklist, and final output",
    checks: "nyatakan asumsi, tanyakan hanya hal yang benar-benar penting, dan jangan mengarang fakta"
  }
};

export function buildPrompt(input) {
  const b = blueprints[input.category] || blueprints.custom;
  const detail = input.detail || "Lengkap";
  const language = input.language || "Bahasa Indonesia";
  return `# MASTER PROMPT — ${input.title || "Proyek Baru"}

## 1. PERAN
Bertindaklah sebagai ${b.role}. Gabungkan kemampuan strategis, teknis, dan evaluasi kualitas.

## 2. TUJUAN
${b.goal}.

## 3. KONTEKS PROYEK
${input.description || "[Jelaskan ide, masalah, dan hasil yang diinginkan]"}
Target pengguna: ${input.audience || "[Target pengguna]"}
Platform / teknologi: ${input.platform || "[Platform atau teknologi pilihan]"}
Referensi / batasan: ${input.constraints || "[Batasan, preferensi, atau referensi]"}

## 4. TINGKAT DETAIL
Berikan jawaban dengan tingkat detail: ${detail}.
Gunakan bahasa: ${language}.
Jangan melewati kebutuhan inti. Jika informasi penting belum tersedia, tulis asumsi secara eksplisit.

## 5. CAKUPAN OUTPUT
Wajib mencakup: ${b.deliverables}.

## 6. STANDAR KUALITAS
${b.checks}.
Utamakan solusi yang maintainable, aman, accessible, dan realistis. Jangan mengklaim fitur telah diuji atau dijalankan jika belum benar-benar dilakukan.

## 7. FORMAT JAWABAN
1. Ringkasan solusi
2. Asumsi dan requirement
3. Rancangan lengkap
4. Langkah implementasi berurutan
5. Contoh konkret / source code bila relevan
6. Cara menjalankan dan menguji
7. Risiko, keterbatasan, dan solusi
8. Checklist final

## 8. ATURAN KERJA
- Kerjakan secara bertahap dan jangan melompati fondasi penting.
- Berikan kode yang konsisten dengan struktur proyek.
- Jelaskan nama file dan lokasi setiap kode.
- Gunakan placeholder untuk secret; jangan pernah menaruh API key atau password di frontend.
- Hormati lisensi, privasi, keamanan, dan ketentuan platform.
- Jika ada beberapa pendekatan, bandingkan singkat lalu rekomendasikan satu.

Mulai dengan menganalisis konteks proyek, lalu hasilkan output sesuai format di atas.`;
}
