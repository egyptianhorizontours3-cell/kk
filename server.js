const express = require('express');
const mineflayer = require('mineflayer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// التعديل هنا: قراءة ملف الواجهة مباشرة من نفس المجلد
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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
            auth: 'offline', 
            version: false   
        });

        bot.on('login', () => {
            console.log(`تم دخول البوت ${username} إلى السيرفر`);
            // حركة Anti-AFK كل دقيقة
            setInterval(() => {
                if (bot) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                }
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
