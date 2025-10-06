# Premium Sistemi Kurulum Talimatları

## 1. MongoDB Kurulumu

### Seçenek A: MongoDB Atlas (Cloud - Ücretsiz)
1. https://www.mongodb.com/cloud/atlas adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni bir cluster oluşturun (M0 ücretsiz tier)
4. Database Access'ten yeni bir kullanıcı oluşturun
5. Network Access'ten IP'nizi ekleyin (0.0.0.0/0 herkese açık yapar)
6. "Connect" butonuna tıklayın ve "Connect your application" seçin
7. Connection string'i kopyalayın (örnek: `mongodb+srv://username:password@cluster.mongodb.net/myDatabase`)

### Seçenek B: Lokal MongoDB
```bash
# MongoDB'yi indirin ve kurun
# Windows: https://www.mongodb.com/try/download/community
# Linux: sudo apt install mongodb
# Mac: brew install mongodb-community

# Connection string: mongodb://localhost:27017/premium-system
```

## 2. Proje Bağımlılıklarını Yükleme

### Discord Bot için:
```bash
cd discord-bot
npm install discord.js@14.14.1 mongoose@8.1.1
```

### Web Panel için (ana dizinde):
```bash
npm install mongoose
```

## 3. app.js Dosyasını Güncelleme

`app.js` dosyanızın en üstüne şu satırları ekleyin:

```javascript
const mongoose = require('mongoose');

// MongoDB Bağlantısı
const MONGODB_URI = 'BURAYA_MONGODB_CONNECTION_STRING_YAZIN';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB bağlantısı başarılı'))
.catch(err => console.error('❌ MongoDB bağlantı hatası:', err));

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
    mongoUri: 'MONGODB_CONNECTION_STRING_BURAYA',
    // ... diğer ayarlar
};
```

## 5. Discord Bot Tokenlarını Alma

1. https://discord.com/developers/applications adresine gidin
2. "New Application" ile yeni bir uygulama oluşturun
3. Bot sekmesinden "Add Bot" ile bot oluşturun
4. "Reset Token" ile token'ı alın (sadece bir kez gösterilir!)
5. Privileged Gateway Intents'i aktif edin:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT
6. OAuth2 > General'den Application ID'yi alın (clientId)
7. Sunucu ID'nizi Discord'dan alın (guildId)

## 6. Botları Başlatma

### Discord Botu:
```bash
cd discord-bot
node index.js
```

### Web Paneli (zaten çalışıyorsa MongoDB bağlantısını ekledikten sonra restart edin):
```bash
# Ana dizinde
node app.js
```

## 7. Kullanım

### Web Panelinden:
1. `/yonetim/premium` sayfasına gidin
2. "Premium Kod Oluştur" butonu ile kod oluşturabilirsiniz
3. Kullanıcı listesinde düzenleme ve silme işlemleri yapabilirsiniz

### Discord'dan:
```
/premium-ekle @kullanici basic 30
/premium-kaldir @kullanici
/premium-kontrol @kullanici
/premium-liste
/kod-olustur premium 90 5 "Yıl sonu kampanyası"
/kod-kullan PREM-XXXX-XXXX-XXXX
```

## 8. API Endpoint'leri

Web paneliniz şu API endpoint'lerini kullanır:

- `GET /api/premium/list` - Premium kullanıcıları listele
- `POST /api/premium/add` - Premium ekle
- `PUT /api/premium/update` - Premium güncelle
- `DELETE /api/premium/remove` - Premium kaldır
- `POST /api/premium/code/generate` - Premium kod oluştur

## 9. Sorun Giderme

### MongoDB bağlantı hatası:
- Connection string'in doğru olduğundan emin olun
- MongoDB Atlas kullanıyorsanız IP'nizin whitelist'e eklendiğini kontrol edin
- Kullanıcı adı ve şifreyi kontrol edin

### Discord bot komutları çalışmıyor:
- Bot tokenının doğru olduğundan emin olun
- Intents'lerin aktif olduğunu kontrol edin
- Slash komutların sunucuya yüklendiğini kontrol edin (bot ilk başlatıldığında otomatik yüklenir)

### Web panelinde veriler görünmüyor:
- MongoDB bağlantısının aktif olduğunu kontrol edin
- Browser console'da hata olup olmadığını kontrol edin (F12)
- `/api/premium/list` endpoint'ine manuel istek atarak test edin

## 10. Güvenlik Notları

- MongoDB connection string'inizi ASLA GitHub'a yüklemeyin
- `.env` dosyası kullanarak gizli bilgileri saklayın
- Production ortamında HTTPS kullanın
- MongoDB kullanıcısına sadece gerekli yetkileri verin
