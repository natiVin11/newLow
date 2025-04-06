const express = require('express');
const fs = require('fs');
const app = express();
const port = 3102;
const path = require('path');

app.use(express.json());
app.use(express.static('public')); // תיקיית סטטיים

// קריאה לקובץ הדירות
app.get('/get-apartments', (req, res) => {
    fs.readFile('2025.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'שגיאה בקריאת הקובץ' });
        }
        res.json(JSON.parse(data));
    });
});

// עדכון סטטוס דירה
app.post('/update-status', (req, res) => {
    const { building, apartment, status } = req.body;

    fs.readFile('2025.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'שגיאה בקריאת הקובץ' });
        }

        let apartments = JSON.parse(data);
        apartments[building] = apartments[building].map(a => {
            if (a.דירה === apartment) {
                a.סטטוס = status;
            }
            return a;
        });

        fs.writeFile('2025.json', JSON.stringify(apartments, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'שגיאה בשמירת הנתונים' });
            }
            res.json({ success: true });
        });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // מגיש את הקובץ HTML
});

app.listen(port, () => {
    console.log(`השרת פועל בכתובת http://localhost:${port}`);
});
