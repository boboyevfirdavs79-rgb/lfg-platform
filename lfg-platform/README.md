# SquadUp — O'yinchilar uchun teammate topish platformasi

Fullstack: NestJS backend + React frontend + PostgreSQL. O'yinchilar
"teammate kerak" e'lonlarini joylashtiradi, boshqalar so'rov yuborib
qo'shiladi, jamoa hosil bo'ladi va saytning o'zida xabar almashadi.
Profil Steam va FACEIT orqali tekshiriladi.

## Asosiy funksiyalar

- Ro'yxatdan o'tish / kirish (JWT)
- E'lon berish — **faqat Steam akkounti ulangan foydalanuvchilar uchun**
- E'longa qo'shilish so'rovi → egasi qabul/rad qiladi → **Team** hosil bo'ladi
- **Profil**: Steam avatar/nickname, CS2 playtime, FACEIT level/ELO/win rate,
  Telegram/telefon kontakt
- **Team**: boshliq bo'lgan va a'zo bo'lgan jamoalar ro'yxati
- **Messages**: foydalanuvchilar orasida oddiy xabar almashish

## Tez ishga tushirish

### 0. PostgreSQL'ni tayyorlang

```bash
psql -U postgres -c "CREATE DATABASE lfg_platform;"
# yoki: docker compose up -d
```

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

`.env` faylida quyidagilarni to'ldiring (batafsili pastda):

- `DB_*` — Postgres ulanish ma'lumotlari
- `STEAM_API_KEY` — Steam login/statistika uchun
- `FACEIT_API_KEY` — FACEIT statistikasi uchun

```bash
npm run start:dev
```

Backend `http://localhost:3000` da ishga tushadi. Jadvallar `synchronize: true`
tufayli avtomatik yaratiladi.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:5173` da ochiladi.

## Steam va FACEIT sozlash (majburiy — bularsiz post yaratib bo'lmaydi)

### Steam Web API kaliti

1. https://steamcommunity.com/dev/apikey ga o'ting (Steam akkounting bilan kiring)
2. Domen sifatida `localhost` yozing
3. Olingan kalitni `.env`dagi `STEAM_API_KEY`ga qo'ying

`STEAM_RETURN_URL` va `STEAM_REALM`ni localhost uchun o'zgartirish shart emas.
Productionga chiqarganda ularni haqiqiy domeningizga moslang.

### FACEIT Data API kaliti

1. https://developers.faceit.com ga o'ting, akkount oching
2. "Create App" → yangi ilova yarating
3. **Server-side API key**ni oling (Client-side emas!)
4. `.env`dagi `FACEIT_API_KEY`ga qo'ying

> Eslatma: agar bu kalitlarni sozlamasangiz, ilova baribir ishlaydi, lekin
> Steam ulash va FACEIT statistikasi ishlamaydi (xato bermaydi, shunchaki
> bo'sh qaytaradi).

## Loyiha tuzilishi

```
backend/
  src/auth/          Register/login, JWT, Steam OpenID ulash
  src/users/         Foydalanuvchi profili (+ Steam/FACEIT enrichment)
  src/posts/         LFG e'lonlari (CRUD + filter)
  src/teams/         Qo'shilish so'rovlari + jamoa ro'yxati
  src/messages/      Shaxsiy xabar almashish
  src/integrations/  Steam Web API va FACEIT Data API bilan ishlash
frontend/
  src/pages/          Login, Register, Feed, CreatePost, Profile, Team, Messages
  src/context/        AuthContext (JWT saqlash)
  src/api/            Axios client + xato xabarlarini formatlash
```

## API endpointlari

| Method | Endpoint                      | Auth | Tavsif                                    |
|--------|--------------------------------|------|--------------------------------------------|
| POST   | /auth/register                 | -    | Ro'yxatdan o'tish                          |
| POST   | /auth/login                    | -    | Kirish, JWT token olish                    |
| GET    | /auth/steam/link?token=        | -    | Steam ulash oqimini boshlaydi (redirect)   |
| GET    | /users/me                      | ✅   | O'z profili (Steam/FACEIT bilan)           |
| PATCH  | /users/me                      | ✅   | Profilni tahrirlash (region/telegram/tel)  |
| GET    | /users/:id                     | -    | Ochiq profil                               |
| GET    | /posts                         | -    | E'lonlar (?game=&region=, ILIKE qidiruv)   |
| POST   | /posts                         | ✅*  | Yangi e'lon (*Steam ulangan bo'lishi shart)|
| DELETE | /posts/:id                     | ✅   | O'z e'lonini o'chirish                     |
| POST   | /posts/:id/apply                | ✅*  | E'longa qo'shilish so'rovi                 |
| GET    | /posts/:id/applications          | ✅   | So'rovlar ro'yxati (faqat egasi)           |
| PATCH  | /teams/applications/:id          | ✅   | So'rovni qabul/rad qilish                  |
| GET    | /teams/mine                     | ✅   | Boshliq/a'zo bo'lgan jamoalarim            |
| GET    | /messages/conversations           | ✅   | Suhbatlar ro'yxati                         |
| GET    | /messages/thread/:userId          | ✅   | Ikki kishi orasidagi xabarlar              |
| POST   | /messages                        | ✅   | Xabar yuborish                             |

## Demo uchun tekshirilgan oqim

1. `/register` — yangi akkount oching
2. `/profile` — "Steam ulash" tugmasini bosing (Steam login orqali)
3. `/create` — endi e'lon berish mumkin
4. Boshqa akkount bilan kirib, o'sha e'longa "Qo'shilish" so'rovini yuboring
5. Birinchi akkount `/team` sahifasida so'rovni qabul qiladi
6. `/messages` orqali ikkalasi bir-biriga yozishadi

## Keyingi qadamlar

- NestJS WebSocket Gateway orqali real vaqtli chat (hozir oddiy polling)
- O'yinlar katalogi (alohida Game entity + har bir o'yin uchun API integratsiyasi)
- Boshqa o'yinlar uchun statistika manbalari (hozir faqat CS2/FACEIT)
- Docker Compose bilan production deploy, migration'ga o'tish (`synchronize: false`)
