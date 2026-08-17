const express = require('express');
const mineflayer = require('mineflayer');
const path = require('path');

const app = express();
// استخدام البورت الذي توفره منصة الاستضافة أو 3000 كبديل
const PORT = process.env.PORT || 3000;

app.use(express.json());
// تحديد مجلد الواجهة
app.use(express.static('public'));

let bot = null;

app.post('/start', (req, res) => {
    const { username, host, port } = req.body;

    if (bot) {
        bot.quit(); 
    }

    try {
        bot = mineflayer.createBot({
            host: host,
            port: parseInt(port) || 25565,
            username: username,
            auth: 'offline', // للدخول بدون حساب بريميوم
            version: false   // يتعرف على إصدار السيرفر تلقائياً
        });

        bot.on('login', () => {
            console.log(`تم دخول البوت ${username} إلى السيرفر`);
            // حركة Anti-AFK كل دقيقة
            setInterval(() => {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }, 60000); 
        });

        bot.on('kicked', (reason) => {
            console.log(`تم طرد البوت: ${reason}`);
        });

        bot.on('error', (err) => {
            console.log(`خطأ: ${err}`);
        });

        res.json({ message: 'تم إرسال البوت بنجاح!' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تشغيل البوت' });
    }
});

// مسار الـ Ping لإبقاء السيرفر مستيقظاً 24 ساعة
app.get('/ping', (req, res) => res.send('Pong'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
