const express = require('express');
const router = express.Router();
const conn = require('../Database/ConfigDB');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Gunakan middleware CORS dengan konfigurasi default
app.use(cors());

// Middleware untuk parsing JSON dan cookie
app.use(express.json());
app.use(cookieParser());

//proses untuk login dan membuat token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Memeriksa apakah ada data yang dikirim atau tidak
    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan Password tidak benar' });
    }

    try {
        // Mencari admin berdasarkan username
        const admin = await conn('admin')
            .where('username', username)
            .first();

        if (!admin) {
            return res.status(401).json({ error: 'Username atau Password salah' });
        }

        // Bandingkan password yang diinputkan dengan hash yang disimpan
        const isMatch = await bcrypt.compare(password, admin.pass);

        if (!isMatch) {
            return res.status(401).json({ error: 'Username atau Password salah' });
        }

        // Membuat payload untuk JWT
        const payload = {
            id_admin: admin.id_admin,
            username: admin.username,
            status: admin.status,
        };

        // Membuat token JWT
        const token = jwt.sign(payload, process.env.TOKEN_PRIVATE, { expiresIn: '1h' });

        //set token sebagai http-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',//gunakan https di production
            maxAge: 60000 // 1 menit
        })

        //tmabahkan header 'token' ke dalam respons
        res.set('token', token)
        // Mengirimkan token dan data pengguna sebagai respon
        res.json({
            success: true,
            message: 'Login berhasil',
            token: token,
            data: {
                id_admin: admin.id_admin,
                nama_admin: admin.nama_admin,
                username: admin.username,
                email: admin.email,
                status: admin.status
                // Tambahkan data lain yang ingin dikirim ke frontend
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ada Kesalahan' });
    }
});


//proses logout dan menghapus token dari cookei browser pengguna
router.post('/logout', (req, res)=>{
    res.cookie('token', '', {maxAge: 0})

    res.json({ success: true, message: 'berhasil keluar' })
})

module.exports = router;
