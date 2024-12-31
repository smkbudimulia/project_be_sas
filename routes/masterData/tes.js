const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB'); // koneksi ke database
const verifyToken = require('../../middleware/jwToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL_IMAGE;


// Konfigurasi penyimpanan Multer
const storage = multer.memoryStorage(); // Menggunakan memory storage untuk mengecek gambar sebelum menyimpan
const upload = multer({ storage }).single('gambar'); // Menggunakan 'gambar' sebagai nama field

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}

// Operasi POST: menambah data baru ke tabel 'tes'
router.post('/add-tes', upload, async (req, res) => {
    const { nama } = req.body; // Hanya ambil nama dari body
    const idAcak = generateRandomString(5);
    const gambar = req.file; // Ambil file yang di-upload

    // Validasi input data
    if (!nama) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong'
        });
    }

    try {
        // Cek duplikasi data
        const existingKelas = await conn('tes').where('nama', nama).first();

        if (existingKelas) {
            // Jika nama sudah ada, jangan simpan file dan return error
            return res.status(409).json({
                Status: 409,
                error: 'Data sudah ada. Gambar tidak disimpan.'
            });
        }

        // Jika tidak ada duplikasi, simpan file ke folder uploads
        if (gambar) {
            const uploadsDir = path.join(__dirname, '../../uploads/siswa');

            // Format tanggal
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const formattedDate = `${day}/${month}/${year}/${hours}-${minutes}-${seconds}`;

             // Ganti tanda '/' dengan '_'
            const formattedFilename = `upload-${formattedDate.replace(/\//g, '-')}${path.extname(gambar.originalname)}`;

            const filepath = path.join(uploadsDir, formattedFilename);

            // Cek dan buat folder uploads jika belum ada
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Simpan file ke sistem file
            fs.writeFileSync(filepath, gambar.buffer);
       

        const addData = {
            id: idAcak,
            nama,
            gambar: formattedFilename // Simpan nama file jika ada
        };

        await conn('tes').insert(addData);

        res.status(201).json({
            Status: 201,
            success: true,
            message: 'OK',
            data: addData
        });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

// Endpoint untuk mengambil semua data dari tabel 'tes'
router.get('/tes', async (req, res) => {
    try {
        // Ambil semua data dari tabel 'tes'
        const dataKelas = await conn('tes').select('*');

        // Jika tidak ada data ditemukan
        if (dataKelas.length === 0) {
            return res.status(404).json({
                Status: 404,
                message: 'Tidak ada data ditemukan'
            });
        }

        // Menambahkan URL gambar ke setiap item
        const dataWithImageUrl = dataKelas.map(item => {
            return {
                ...item,
                gambarUrl: item.gambar ? `${BASE_URL}${item.gambar}` : null
            };
        });

        // Kembalikan data beserta URL gambar
        res.status(200).json({
            Status: 200,
            success: true,
            data: dataWithImageUrl
        });
        
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;
