///
app.get("/yonetim/premium", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login-error"); // Giriş yapmamış kullanıcılar için giriş sayfasına yönlendirme
  }
  const userID = req.params.userID;
  const lang = req.cookies.lang || "tr"; // Varsayılan dil
  const guild = client.guilds.cache.get(conf.guildID);

  if (!translations[lang]) {
    console.warn(`Geçersiz dil: ${lang}. Varsayılan olarak 'tr' kullanılıyor.`);
  }
const member = await guild.members.fetch(req.user.id);
if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
  return res.redirect("/admin-error"); // Yetkisi olmayan kullanıcılar için özel bir yönlendirme
}
    let auth;
if (guild.roles.cache.has(conf.bsahip)) auth = "Bot Sahibi";
else if (guild.roles.cache.has(conf.admin)) auth = "Taxperia Yetkili";

let isStaff;
if (guild.roles.cache.has(conf.ownerRole)) isStaff = "Owner";

res.render("adminpanel/premium", {
user: req.user,
member : req.isAuthenticated() ? req.user : null,
guild,
conf,
translations: translations[lang],
auth,
icon: client.guilds.cache.get(conf.guildID).iconURL({ dynamic: true }),
bot: client,
path: req.path, 
isStaff,
reqMember: req.user ? client.guilds.cache.get(conf.guildID).members.cache.get(req.user.id) : null
});
});

///
