# Zimmet Projesi - Depo Yönetim Sistemi

Bu proje, depo zimmet takip sistemi için geliştirilmiş modern bir web uygulamasıdır.

## 🚀 Hızlı Başlangıç

### Projeyi İndirme
```bash
git clone https://github.com/alioznn/zimmet.git
cd zimmet
```

### Gereksinimler
- **Node.js** (v18 veya üzeri)
- **.NET 8 SDK**
- **Git**

### Kurulum

#### 1. Backend (.NET API) Kurulumu
```bash
cd zim-api/src/Zim.Api
dotnet restore
dotnet run
```
API varsayılan olarak `https://localhost:7000` adresinde çalışacak.

#### 2. Frontend (Next.js) Kurulumu
```bash
cd zim-ui
npm install
npm run dev
```
Frontend varsayılan olarak `http://localhost:3000` adresinde çalışacak.

### 🎯 Özellikler
- ✅ Çalışan yönetimi
- ✅ Ürün/kategori yönetimi
- ✅ Lokasyon yönetimi
- ✅ Zimmet atama sistemi
- ✅ Raporlama
- ✅ Modern UI/UX (Next.js + Tailwind CSS)

### 📱 Erişim
- **Frontend:** http://localhost:3000
- **API:** https://localhost:7000
- **API Dokümantasyonu:** https://localhost:7000/swagger

### 🔧 Geliştirme
Projeyi geliştirmek için her iki servisi de aynı anda çalıştırmanız gerekiyor:
- Terminal 1: Backend (`dotnet run`)
- Terminal 2: Frontend (`npm run dev`)

### 📞 Destek
Herhangi bir sorun yaşarsanız GitHub Issues'dan bildirebilirsiniz.

---
**GitHub:** https://github.com/alioznn/zimmet