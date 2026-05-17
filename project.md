PRD: AI-Agentic ERP (Digilio)
Visi Produk: Menghilangkan kompleksitas navigasi ERP tradisional dengan menjadikan AI sebagai operator UI yang responsif. Selain itu, sistem bertindak sebagai "AI-Agentic ERP Builder" dengan pendekatan Hibrida: menyediakan template dasar yang kemudian disesuaikan secara dinamis (Dynamic Blueprint) oleh AI berdasarkan proses bisnis spesifik klien.

1. Ringkasan Eksekutif
Sistem ini bukan sekadar chatbot atau ERP statis, melainkan sistem Intent-to-Action dan ERP Builder Hibrida. Saat onboarding, AI bertindak sebagai Konsultan Bisnis yang membantu klien memilih template ERP dasar dan menyesuaikan skema serta aturan bisnisnya. Setelah beroperasi, user memberikan perintah natural (teks/suara), dan sistem secara otomatis menggerakkan antarmuka (membuka menu, mengisi form) secara real-time di depan mata user untuk divalidasi sebelum disimpan.

2. Tujuan Utama (Goals)
Zero Navigation: User tidak perlu menghafal letak menu.
Guided Input: AI mengisi data secara otomatis, namun user tetap memiliki kendali penuh (verifikasi visual).
Strict Business Logic: AI tidak bisa melampaui aturan sistem (misal: mandatory fields atau hard budgeting).

3. Fitur Utama & Spesifikasi Fungsional
A. Omni-Command Center (The Interface)
- Floating/Sidebar Prompt: Kotak input yang selalu tersedia di setiap halaman.
- Natural Language Processing (NLP): Mengekstrak entitas (Vendor, Produk, Qty, Harga) dari bahasa sehari-hari.
- Multi-Modal Input: Mendukung teks, suara (Voice-to-Action Pipeline via Whisper), dan drag-and-drop dokumen (OCR otomatis ke form).

B. Agentic UI Engine (The "Driver")
- Auto-Navigation: Jika perintah adalah "Buat PO", sistem otomatis melakukan redirect ke modul Purchase Order.
- Ghost Filling: Mengisi field di form secara otomatis. Field yang diisi oleh AI diberi penanda visual (misal: highlight biru muda).
- Schema-Driven UI: Form dirender secara dinamis menggunakan JSON Schema, memungkinkan AI mengenali dan mengisi field modul baru tanpa hardcoding.
- Automated Reasoning: Sebelum eksekusi UI, AI menampilkan "Thought Process" singkat (misal: "Saya akan membuat PO untuk Vendor X...") agar user bisa memantau logika AI.
- Context Awareness: AI tahu halaman dan tab mana yang sedang aktif.

C. Digital Guardrails (Business Logic)
Komponen | Mekanisme Handle
--- | ---
Mandatory Fields | AI mengecek JSON Schema. Jika ada data kurang, muncul tooltip merah dan notifikasi suara/teks.
Hard Budgeting | Validasi real-time via Backend sebelum tombol "Save" aktif.
User Override | Kendali hukum penuh di tangan user; semua input AI bisa diedit manual.
Audit Trail | Setiap aksi pengisian data oleh AI dicatat dalam log sistem (Siapa, Kapan, Perintah Apa, Field Mana yang diubah).
Knowledge Base (RAG) | AI terhubung ke dokumen SOP dan aturan perusahaan via Vector Memory untuk memastikan saran/aksi patuh pada kebijakan internal.
AI-Aware RBAC | Permission Layer yang membatasi akses AI hanya pada data/modul yang diizinkan untuk User ID tersebut (mencegah kebocoran data sensitif oleh AI).
AI Observability | Penyimpanan "Log Reasoning" (isi pikiran AI) untuk setiap aksi guna audit teknis jika terjadi kesalahan input atau halusinasi.

D. Arsitektur UI/UX (Split Workspace)
- Split Layout (75:25): 75% layar adalah Workspace dinamis (Form, Tabel, Grafik) yang dikendalikan AI, dan 25% adalah Chatbox Command Center.
- Multi-Tab / Multi-Session: Mendukung banyak tab di atas area workspace. Setiap tab mewakili satu sesi AI yang terisolasi konteksnya, memungkinkan multitasking tanpa kehilangan data atau memori percakapan.
- On-Page Interaction: Semua perubahan UI terjadi secara instan tanpa reload halaman untuk menjaga fluiditas pengalaman "Agentic".

E. AI Onboarding & Dynamic Blueprint (Hybrid Builder)
- Pre-built Templates: Menyediakan template modul dasar (seperti modul SIAP: Sales, Inventory, Accounting, Purchase) agar user tidak memulai dari kanvas kosong.
- AI Business Consultant: AI mewawancarai user saat onboarding untuk memahami kebutuhan spesifik dan melakukan penyesuaian (Customization) pada template.
- Data Migration Agent: AI membantu memetakan (mapping) data dari file Excel/CSV lama milik user ke dalam struktur Blueprint baru secara otomatis.
- Dynamic Metadata & Rule Engine: Penyesuaian yang dilakukan AI disimpan sebagai JSON Blueprint dan Rule Engine dinamis tanpa mengubah hardcode backend.
- Blueprint Editor (Developer Mode): Antarmuka visual bagi tim support/IT untuk memantau, melacak, dan memperbaiki Blueprint atau Rule jika AI melakukan kesalahan logika.

F. System Lifecycle & Environment Management
- Onboarding Mode (Sandbox): Fase awal pembangunan "Blueprint" v1.0. User berinteraksi dengan AI Arsitek untuk merancang sistem menggunakan data dummy. Lingkungan terisolasi sepenuhnya.
- Go-Live Mode (Production): Sistem siap digunakan untuk operasional nyata. Blueprint dikunci (locked) untuk menjaga integritas data transaksional. AI beralih peran menjadi Operator UI.
- Development Mode (Staging/Shadow): Fase penyesuaian sistem setelah Go-Live. Sistem membuat "Draft Blueprint" (v1.x) yang bisa diuji coba tanpa mengganggu data operasional aktif. Perubahan baru diterapkan (apply) ke Production setelah divalidasi.

G. Connectivity & Integration
- Standard Webhooks: Menyediakan hook standar untuk integrasi dengan layanan pihak ketiga (Bank, Marketplace, Ekspedisi) meskipun struktur modul bersifat dinamis.
- API-First Approach: Setiap blueprint yang dibuat otomatis menghasilkan endpoint API yang sesuai untuk integrasi eksternal.

H. Agentic Safety & Knowledge Ingestion
- Multi-Agent Isolation: Pemisahan tegas antara Agent Chat (Interface) yang berinteraksi dengan user dan Agent Arsitek (Logic) yang membangun sistem. Keduanya berjalan dalam lingkungan terisolasi.
- No-Shell Policy: AI secara fisik tidak diberikan akses (tools) ke shell command, sistem file server, atau konfigurasi infrastruktur. Interaksi hanya dibatasi pada tool-calling API yang aman.
- Knowledge Ingestion Pipeline: Mekanisme pemberian pengetahuan ke AI melalui:
    - RAG: Dokumen SOP, aturan bisnis, dan panduan akuntansi (PDF/Markdown) yang diindeks di Vector DB.
    - Few-Shot Examples: Contoh-contoh pasangan "Percakapan -> JSON Blueprint" untuk mengarahkan logika AI.
    - Master Templates: Definisi dasar modul SIAP sebagai referensi arsitektur.
- Non-AI Gatekeeper: Kode backend (bukan AI) bertindak sebagai validator terakhir untuk mengecek setiap JSON Blueprint yang dihasilkan AI sebelum diterapkan ke sistem.

4. Alur Pengguna (User Flow)
Input: User mengetik: "Beli semen 100 sak dari Toko Bangunan Jaya pakai budget proyek A."
Processing: AI mengidentifikasi:
- Action: CREATE_PURCHASE_ORDER
- Vendor: Toko Bangunan Jaya
- Items: Semen (100 sak)
- Project: Proyek A
Execution: UI otomatis berpindah ke form Purchase Order. Field Vendor, Item, dan Project terisi otomatis.
Validation: Sistem (Backend) mengecek budget Proyek A secara real-time.
Confirmation:
- Jika OK: AI berkata: "Sudah saya siapkan drafnya. Cek lagi ya, kalau oke tinggal klik Simpan."
- Jika Budget Kurang: AI berkata: "Waduh, budget Proyek A sisa 2jt, sedangkan total ini 5jt. Mau kurangi jumlahnya?"
Final Action: User menekan tombol "Save" (Keputusan hukum ada di user).

5. Persyaratan Teknis (Technical Requirements)
- Infrastructure Strategy (Dedicated Resources): Menggunakan pendekatan **"1 Server per Client"** (atau Dedicated Instance) untuk menangani beban komputasi Local LLM secara stabil dan terisolasi.
- AI LLM Engine (Pluggable Architecture):
    - Default (Basic Tier): Local LLM menggunakan Ollama atau vLLM (Model: Llama 3 8B atau Qwen 2.5).
    - Premium (Bring Your Own Key / BYOK): Dukungan integrasi API eksternal (OpenAI, Anthropic).
- Voice Processing: Whisper (Local) untuk konversi suara ke teks secara privat.
- Frontend: Next.js (React) dengan Tailwind CSS dan Shadcn UI. State management menggunakan Zustand.
- Backend: FastAPI (Python) untuk logika bisnis, integrasi LLM (LangChain/LlamaIndex), dan OCR.
- Database Stack:
    - PostgreSQL (Tenant-Specific Schema): Database utama untuk integritas data transaksional.
    - PostgreSQL + pgvector: Untuk penyimpanan vektor (RAG).
    - Redis: In-memory database untuk session management AI dan caching.
    - Meilisearch: Search engine untuk pencarian master data instan.
- OCR & Storage: PaddleOCR dan MinIO sebagai object storage lokal.
- Metadata API: JSON Schema dengan Blueprint Versioning (v1.0, v1.1-draft).

6. Rencana Rilis (Roadmap)
Fase 1 (MVP): Fokus pada navigasi menu dan pengisian form dasar (Sales/Purchase).
Fase 2: Integrasi OCR (Upload nota langsung jadi draf form).
Fase 3: Proactive Assistant (AI memberikan insight/report tanpa diminta, misal: "Stok besi sudah tipis, mau buat PO ke supplier langganan?").

Catatan Tambahan (Wildcard):
Pertimbangkan fitur "Training Mode". Jika AI salah mengisi data, user bisa mengoreksi secara manual, dan sistem akan mencatat koreksi tersebut sebagai referensi untuk perintah serupa di masa depan (Personalized AI Agent).