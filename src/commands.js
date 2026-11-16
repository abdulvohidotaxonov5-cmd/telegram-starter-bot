
import { InlineKeyboard } from "grammy"

const CHANNEL = "@timsoll_nmg"
const TIME_ZONE = "Asia/Tashkent"

const morningPosts = [
  "Assalomu alaykum! Timsoll jamoasi ish boshladi. Bugun zakazlaringizni qabul qilamiz. Kerakli ehtiyot qismlar bo‘yicha bizga murojaat qiling!",
  "Xayrli tong! Timsoll’da yangi ish kuni boshlandi. Motor, elektr va xadavoy ehtiyot qismlari bo‘yicha buyurtmalaringizni kutamiz!",
  "Assalomu alaykum, hurmatli mijozlar! Bugun ham xizmatdamiz. Zakazlaringizni yuborishingiz mumkin. Timsoll — ehtiyot qismlar bo‘yicha hamkoringiz!",
  "Yangi kun muborak! Timsoll’da buyurtmalar qabul qilinmoqda. Kerakli ehtiyot qismlarni aniqlash uchun biz bilan bog‘laning!",
  "Xayrli tong! Bugungi ish kunimiz boshlandi. Buyurtmalaringizni vaqtida yuboring, biz ularni tayyorlashga kirishamiz!",
  "Hurmatli mijozlar, Timsoll ish faoliyatini boshladi. Bugun ham sizning buyurtmalaringizni mamnuniyat bilan qabul qilamiz!",
  "Assalomu alaykum! Timsoll jamoasi sizning xizmatingizda. Ehtiyot qismlar bo‘yicha zakazlaringizni yuborishingiz mumkin!"
]

const deliveryPosts = [
  "Hurmatli mijozlar! Bugungi yuk jo‘natish vaqti — 16:30. Buyurtmalaringizni oldindan yuborib qo‘ying!",
  "Eslatma: bugungi yuk jo‘natish 16:30 ga rejalashtirilgan. Zakazlaringiz bo‘lsa, bizga murojaat qiling!",
  "Timsoll’dan kunlik eslatma: bugun yuklar 16:30 da jo‘natiladi. Buyurtmalaringizni tayyorlab qo‘yishni unutmang!",
  "Hurmatli hamkorlar! Bugungi jo‘natish vaqti 16:30. Kerakli ehtiyot qismlar bo‘yicha zakazlaringizni yuborishingiz mumkin.",
  "Bugungi yuk jo‘natish 16:30 da amalga oshiriladi. Buyurtmalar bo‘yicha savollaringiz bo‘lsa, Timsoll jamoasiga yozing!",
  "Mijozlar diqqatiga! Bugun ham yuk jo‘natish vaqti — 16:30. Zakazlaringizni oldindan yuborishingizni tavsiya qilamiz.",
  "Timsoll eslatadi: bugungi jo‘natish 16:30 ga belgilangan. Buyurtmalaringizni qabul qilishda davom etamiz!"
]

function getTashkentTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date())

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function registerCommands(bot) {
  bot.command("start", (ctx) =>
    ctx.reply(
      "Timsoll avtomatik e'lonlar botiga xush kelibsiz!",
      { reply_markup: new InlineKeyboard().text("Ping", "ping") },
    ),
  )

  bot.command("help", (ctx) =>
    ctx.reply("Buyruqlar:\n/start — botni ishga tushirish\n/help — yordam\n/ping — bot holatini tekshirish\n/id — chat va foydalanuvchi ID raqamlari"),
  )

  bot.command("ping", (ctx) => ctx.reply("Bot ishlayapti!"))

  bot.command("id", (ctx) =>
    ctx.reply(`Chat ID: ${ctx.chat.id}\nUser ID: ${ctx.from?.id ?? "unknown"}`),
  )

  bot.callbackQuery("ping", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Bot ishlayapti!" })
  })

  // Avtomatik e'lonlar: har kuni 09:00 va 10:00,
  // juma kuni esa e'lon yuborilmaydi.
  const sentPosts = new Set()

  setInterval(async () => {
    const now = getTashkentTime()

    if (now.weekday === "Fri") return

    const dateKey = `${now.year}-${now.month}-${now.day}`
    const dayIndex = Math.floor(
      (Date.UTC(Number(now.year), Number(now.month) - 1, Number(now.day)) -
        Date.UTC(Number(now.year), 0, 1)) / 86400000,
    )

    let post = null
    let postKey = null

    if (now.hour === "09" && now.minute === "00") {
      postKey = `${dateKey}-09`
      post = morningPosts[dayIndex % morningPosts.length]
    } else if (now.hour === "10" && now.minute === "00") {
      postKey = `${dateKey}-10`
      post = deliveryPosts[dayIndex % deliveryPosts.length]
    }

    if (!post || sentPosts.has(postKey)) return

    try {
      await bot.api.sendMessage(CHANNEL, post)
      sentPosts.add(postKey)
      console.log(`E'lon yuborildi: ${postKey}`)
    } catch (error) {
      console.error("E'lon yuborishda xatolik:", error)
    }
  }, 10000)
}
