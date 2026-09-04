# SquadUp — Deploy qilish bo'yicha qo'llanma

Bu hujjat SquadUp loyihasini **AWS Free Tier** (bepul) + shaxsiy domen orqali
production serverga joylashtirish qadamlarini tavsiflaydi. Bitta EC2 instance
ichida backend (NestJS), frontend (statik React build) va PostgreSQL birga
ishlaydi, nginx esa ularni bitta domen ostida bog'laydi.

**Umumiy xarajat:** $0 (AWS Free Tier, 12 oy) + domen narxi (~$1–10/yil).

---

## 1. AWS'da EC2 server yaratish

1. https://aws.amazon.com da akkount oching (karta so'raladi, lekin Free Tier
   doirasida pul yechilmaydi).
2. **EC2** xizmatiga o'ting → **Launch Instance**.
3. Image: **Ubuntu Server 24.04 LTS**.
4. Instance type: **t2.micro** yoki **t3.micro** ("Free tier eligible"
   yozuvi bilan).
5. **Key pair** yarating (yangi), `.pem` faylni xavfsiz joyga saqlang —
   serverga kirish uchun kerak bo'ladi.
6. **Launch instance**.

### Xavfsizlik guruhi (Security Group)

Instance sozlamalarida "Security Groups" → "Inbound rules" ga qo'shing:

| Type  | Port | Source            |
|-------|------|--------------------|
| SSH   | 22   | My IP (faqat siz)  |
| HTTP  | 80   | Anywhere (0.0.0.0/0) |
| HTTPS | 443  | Anywhere (0.0.0.0/0) |

Bu portlarsiz na serverga ulanib bo'ladi, na sayt tashqaridan ochiladi.

---

## 2. Domen sotib olish va yo'naltirish

> ⚠️ Freenom kabi "bepul domen" xizmatlari 2023–2024'da butunlay yopilgan —
> ular orqali endi domen olib bo'lmaydi. Namecheap yoki Porkbun'dan arzon
> kengaytma (`.xyz`, `.site`, `.online`) odatda birinchi yil $1–3 atrofida
> bo'ladi.

1. Domenni xohlagan reestratordan sotib oling.
2. Domen boshqaruv panelida **DNS / Advanced DNS** bo'limiga o'ting.
3. **A record** qo'shing:
   - Host: `@` (yoki bo'sh)
   - Value: EC2'ning **Public IPv4 address**i (AWS konsolida ko'rinadi)
4. Xohlasangiz, `www` uchun ham xuddi shunday A record qo'shing.

DNS o'zgarishi tarqalishi (propagation) bir necha daqiqadan bir necha soatgacha
vaqt olishi mumkin.

---

## 3. Serverga ulanish va kerakli dasturlarni o'rnatish

```bash
ssh -i sizning-kalit.pem ubuntu@EC2_PUBLIC_IP
```

```bash
sudo apt update && sudo apt upgrade -y

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL
sudo apt install -y postgresql

# nginx
sudo apt install -y nginx

# PM2 (backend'ni doim ishlab turishi uchun)
sudo npm install -g pm2
```

### Swap fayl qo'shish (juda muhim!)

`t2.micro`/`t3.micro`da faqat 1GB RAM bor — `npm install` shu sababli
xotira yetishmasligidan "crash" bo'lishi mumkin:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

---

## 4. Ma'lumotlar bazasini tayyorlash

```bash
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'kuchli-parol-oyating';"
sudo -u postgres psql -c "CREATE DATABASE lfg_platform;"
```

---

## 5. Kodni serverga joylash

```bash
git clone https://github.com/SIZNING-USERNAME/lfg-platform.git
cd lfg-platform
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
nano .env   # quyidagi qiymatlarni to'ldiring
```

`.env`da o'zgartirilishi shart bo'lgan qiymatlar:

```
JWT_SECRET=uzun-va-tasodifiy-qiymat-shu-yerga   # HECH QACHON default qiymatni qoldirmang!

DB_PASSWORD=4-qadamda-qo'ygan-parolingiz

FRONTEND_URL=https://domeningiz.com
STEAM_RETURN_URL=https://domeningiz.com/auth/steam/return
STEAM_REALM=https://domeningiz.com/

STEAM_API_KEY=...   # steamcommunity.com/dev/apikey (Domain: domeningiz.com)
FACEIT_API_KEY=...  # developers.faceit.com
```

```bash
npm run build
pm2 start dist/main.js --name backend
pm2 save
pm2 startup   # server qayta yoqilganda ham avtomatik ishga tushishi uchun
```

### Frontend

```bash
cd ../frontend
echo "VITE_API_URL=https://domeningiz.com" > .env
npm install
npm run build
```

Natija `frontend/dist/` papkasida statik fayllar bo'ladi — bularni nginx
to'g'ridan-to'g'ri xizmat qiladi (alohida server kerak emas).

---

## 6. nginx'ni sozlash

`/etc/nginx/sites-available/default` faylini oching (`sudo nano ...`) va
quyidagicha almashtiring (yo'llarni o'z papka joylashuvingizga moslang):

```nginx
server {
    listen 80;
    server_name domeningiz.com www.domeningiz.com;

    root /home/ubuntu/lfg-platform/frontend/dist;
    index index.html;

    # Backend'ga tegishli yo'llar
    location ~ ^/(auth|users|posts|teams|messages) {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Qolgan hammasi — React (SPA) frontend
    location / {
        try_files $uri /index.html;
    }
}
```

```bash
sudo nginx -t              # sintaksis xato yo'qligini tekshiradi
sudo systemctl restart nginx
```

Shu bosqichda `http://domeningiz.com` allaqachon ochilishi kerak.

---

## 7. Bepul SSL (HTTPS) — Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domeningiz.com -d www.domeningiz.com
```

Certbot avtomatik ravishda sertifikat oladi va nginx konfiguratsiyasini
HTTPS uchun yangilaydi (90 kunda avtomatik yangilanadi). Shundan keyin sayt
`https://domeningiz.com` orqali ochiladi.

---

## Yangilash (kod o'zgargach)

```bash
cd ~/lfg-platform
git pull

cd backend && npm install && npm run build && pm2 restart backend

cd ../frontend && npm install && npm run build
# nginx qayta ishga tushirish shart emas — u dist/ papkani to'g'ridan-to'g'ri o'qiydi
```

---

## Nosozliklarni bartaraf etish

**"Cannot GET /"** yoki 502 xato — backend ishlamayapti. Tekshiring:
```bash
pm2 status
pm2 logs backend
```

**Steam ulash ishlamayapti** — backend loglarida (`pm2 logs backend`) aniq
xato matnini qidiring. Eng ko'p uchraydigan sabablar:
- `.env`dagi `STEAM_RETURN_URL`/`STEAM_REALM` domeningiz bilan mos emas
- Steam API kalitida ro'yxatdan o'tkazilgan "Domain Name" domeningiz bilan mos emas
- `STEAM_API_KEY` bo'sh — bu Steam login jarayonining o'ziga xalaqit
  bermaydi (faqat statistika olishga kerak), lekin baribir to'ldirilishi tavsiya etiladi

**`npm install` to'xtab qoladi / "Killed" deb chiqadi** — xotira yetishmayapti,
3-qadamdagi swap fayl sozlanganini tekshiring: `free -h` (Swap qatorida 0
emas, 2.0G ko'rinishi kerak).

**Ma'lumotlar bazasiga ulanmayapti** — `.env`dagi `DB_PASSWORD` 4-qadamda
qo'ygan parol bilan bir xilligini, `DB_HOST=localhost` ekanligini tekshiring.

**CORS xatosi (brauzer konsolida "blocked by CORS policy")** — `VITE_API_URL`
domeningiz bilan aniq mos kelishini (http/https, www bor-yo'qligi) tekshiring,
so'ng frontend'ni qayta build qiling.
