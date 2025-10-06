# Premium Sistemi Kurulum Talimatları

## ✅ Sorun Çözüldü

"Cannot overwrite Premium model" hatası düzeltildi. Tüm modeller artık merkezi olarak `models/` klasöründe tanımlı.

## 📁 Dosya Yapısı

```
project/
├── models/
│   ├── Premium.js              # Merkezi Premium model
│   └── PremiumCode.js          # Merkezi PremiumCode model
├── discord-bot/
│   ├── models/
│   │   ├── Premium.js          # Ana modeli import eder
│   │   └── PremiumCode.js      # Ana modeli import eder
│   ├── commands/
│   │   ├── premium-ekle.js
│   │   ├── premium-kaldir.js
│   │   ├── premium-kontrol.js
│   │   ├── premium-liste.js
│   │   ├── kod-olustur.js
│   │   └── kod-kullan.js
│   ├── utils/
│   │   └── premiumManager.js
│   ├── config.js
│   ├── index.js
│   └── package.json
├── routes/
│   └── premium-api.js
├── app-premium-routes.js
├── premium.ejs
└── app.js
```

## 1. MongoDB Kurulumu

### Seçenek A: MongoDB Atlas (Cloud - Önerilen)
1. https://www.mongodb.com/cloud/atlas adresine gidin
2. Ücretsiz hesap oluşturun
3. "Build a Database" > "M0 Free" seçin
4. Database Access > "Add New Database User" ile kullanıcı oluşturun
5. Network Access > "Add IP Address" > "Allow Access from Anywhere" (0.0.0.0/0)
6. "Connect" > "Connect your application" > Connection string'i kopyalayın

**Örnek Connection String:**
```
mongodb+srv://kullanici:sifre@cluster0.xxxxx.mongodb.net/premium-system?retryWrites=true&w=majority
```

### Seçenek B: Lokal MongoDB
```bash
# MongoDB'yi kurun ve başlatın
# Connection string: mongodb://localhost:27017/premium-system
```

## 2. Bağımlılıkları Yükleme

### Ana Proje (Web Panel):
```bash
npm install mongoose
```

### Discord Bot:
```bash
cd discord-bot
npm install
```

## 3. MongoDB Bağlantısını Yapma

`app.js` dosyanızın **EN ÜSTÜNE** şu kodları ekleyin:

```javascript
const mongoose = require('mongoose');

// MongoDB Bağlantısı
const MONGODB_URI = 'mongodb+srv://kullanici:sifre@cluster.mongodb.net/premium-system';
// VEYA lokal için: 'mongodb://localhost:27017/premium-system'

mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => console.error('❌ MongoDB bağlantı hatası:', err));
```

Daha sonra premium route'larını yükleyin (mevcut route tanımlamalarınızın SONUNA ekleyin):

```javascript
// Premium route'larını yükle
require('./app-premium-routes')(app, client, conf, translations);
```

## 4. Discord Bot Konfigürasyonu

`discord-bot/config.js` dosyasını düzenleyin:

```javascript
const config = {
    token: 'DISCORD_BOT_TOKEN_BURAYA',
    clientId: 'DISCORD_CLIENT_ID_BURAYA',
    guildId: 'DISCORD_GUILD_ID_BURAYA',
    mongoUri: 'AYNI_MONGODB_CONNECTION_STRING',

    premiumPlans: {
        basic: {
            name: 'Basic',
            emoji: '🥉',
            color: '#3B82F6'
        },
        premium: {
            name: 'Premium',
            emoji: '🥈',
            color: '#F59E0B'
        },
        professional: {
            name: 'Professional',
            emoji: '🥇',
            color: '#A855F7'
        }
    }
};

module.exports = config;
```

## 5. Discord Bot Token Alma

1. https://discord.com/developers/applications
2. "New Application" ile uygulama oluşturun
3. Bot > "Reset Token" ile token alın (GÜVENLİ SAKLAYIN!)
4. Bot > Privileged Gateway Intents'i AÇIN:
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
5. OAuth2 > General > Application ID = clientId
6. Discord'da sunucunuza sağ tık > "Copy Server ID" = guildId

## 6. Botları Başlatma

### Terminal 1 - Discord Bot:
```bash
cd discord-bot
node index.js
```

Başarılı çıktı:
```
✅ Komut yüklendi: premium-ekle
✅ Komut yüklendi: premium-kaldir
...
✅ Bot hazır: YourBot#1234
✅ MongoDB bağlantısı başarılı
✅ Slash komutları başarıyla yüklendi!
```

### Terminal 2 - Web Panel:
```bash
node app.js
```

## 7. Kullanım

### 🌐 Web Panelinden:
1. Tarayıcıda `/yonetim/premium` sayfasına gidin
2. **Premium Kod Oluştur** - Kod oluşturabilirsiniz
3. **Düzenle** butonu - Premium bilgilerini güncelleyin
4. **Sil** butonu - Premium üyeliği kaldırın
5. **Arama** - Kullanıcı ID veya isim ile arayın
6. **Filtre** - Plan türüne göre filtreleyin

### 💬 Discord'dan:
```
/premium-ekle @kullanici basic 30
/premium-kaldir @kullanici
/premium-kontrol @kullanici
/premium-liste
/kod-olustur premium 90 5 "Yıl sonu kampanyası"
/kod-kullan PREM-XXXX-XXXX-XXXX
```

## 8. API Endpoint'leri

- `GET /api/premium/list` - Premium kullanıcıları listele
- `POST /api/premium/add` - Premium ekle
- `PUT /api/premium/update` - Premium güncelle
- `DELETE /api/premium/remove` - Premium kaldır
- `POST /api/premium/code/generate` - Premium kod oluştur

## 9. Sorun Giderme

### ❌ "Cannot overwrite Premium model"
**Çözüldü!** Artık tüm modeller merkezi olarak tanımlı.

### ❌ MongoDB bağlantı hatası
- Connection string'i kontrol edin
- MongoDB Atlas kullanıyorsanız IP whitelist'i kontrol edin
- Kullanıcı adı ve şifrede özel karakter varsa URL encode edin

### ❌ Discord bot komutları görünmüyor
- Bot tokenının doğru olduğunu kontrol edin
- Intents'lerin aktif olduğunu kontrol edin
- Botu sunucudan atıp tekrar davet edin
- Bot log'larını kontrol edin

### ❌ Web panelinde veriler görünmüyor
- Browser console'u açın (F12) ve hata olup olmadığını kontrol edin
- MongoDB bağlantısının başarılı olduğunu kontrol edin
- Network tab'da `/api/premium/list` isteğini kontrol edin

### ❌ Slash komutlar güncellenmedi
```bash
# Bot'u yeniden başlatın, komutlar otomatik yüklenecek
cd discord-bot
node index.js
```

## 10. Örnek Kullanım Senaryoları

### Senaryo 1: Kullanıcıya Premium Verme
```
/premium-ekle @Kullanici basic 30
```
Web panelinde görünür ve düzenlenebilir.

### Senaryo 2: Premium Kod Oluşturma
1. Web panelinden "Premium Kod Oluştur"
2. Plan: Premium, Süre: 90, Limit: 5
3. Kodu kopyalayıp paylaşın
4. Kullanıcılar Discord'da `/kod-kullan PREM-XXX-XXXX-XXXX`

### Senaryo 3: Premium Düzenleme
1. Web panelinde kullanıcıyı bulun
2. "Düzenle" butonuna tıklayın
3. Plan veya bitiş tarihini değiştirin
4. "Kaydet" ile güncelleme yapın

## 11. Güvenlik

- ⚠️ MongoDB connection string'i ASLA GitHub'a eklemeyin
- ⚠️ Discord bot token'ı paylaşmayın
- ✅ Production ortamında `.env` dosyası kullanın
- ✅ MongoDB kullanıcısına sadece gerekli yetkileri verin
- ✅ HTTPS kullanın (production'da)

## 12. Destek

Sorun yaşarsanız:
1. Console log'larını kontrol edin
2. MongoDB bağlantısını test edin
3. Discord bot permissions'ı kontrol edin
4. Browser console'da hata olup olmadığını kontrol edin
