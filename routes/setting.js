const express = require('express');
const router = express.Router();
const conn = require('../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../middleware/jwToken')


// Fungsi untuk mengacak karakter untuk ID
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }
  
    return randomString;
  }

  router.post('/setting-sistem', async (req, res) => {
    const rombelDataArray = req.body;
    const resultMessages = [];
  
    if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
      try {
        await conn.transaction(async trx => {
          for (const rombelData of rombelDataArray) {
            const { hari, jam_masuk, jam_pulang, jam_terlambat } = rombelData;
  
            if (!hari) {
              resultMessages.push({
                hari,
                status: 'Gagal',
                message: 'Hari tidak boleh kosong',
              });
              continue; // Lewati iterasi jika hari tidak diisi
            }
  
            // Cek jika hanya hari yang diisi tanpa data jam lainnya
            const isLibur = (!jam_masuk || jam_masuk.every(time => time === "")) &&
                            (!jam_pulang || jam_pulang.every(time => time === "")) &&
                            (!jam_terlambat || jam_terlambat.every(time => time === ""));
  
            // Jika hari libur, set "libur" pada jam_masuk, jam_pulang, dan jam_terlambat
            const newJamMasuk = isLibur ? ["libur", "libur"] : jam_masuk;
            const newJamPulang = isLibur ? ["libur", "libur"] : jam_pulang;
            const newJamTerlambat = isLibur ? ["libur", "libur"] : jam_terlambat;
  
            const statusMessage = isLibur
              ? 'Data berhasil diperbarui sebagai hari libur'
              : 'Data berhasil diperbarui';
  
            // Cek apakah data sudah ada di database
            const existingData = await trx('setting')
              .where('hari', hari)
              .first();
  
            if (existingData) {
              // Jika data sudah ada, update data
              await trx('setting')
                .where('hari', hari)
                .update({
                  jam_masuk: JSON.stringify(newJamMasuk),
                  jam_pulang: JSON.stringify(newJamPulang),
                  jam_terlambat: JSON.stringify(newJamTerlambat),
                });
  
              resultMessages.push({
                hari,
                status: 'Berhasil',
                message: statusMessage,
              });
            } else {
              // Jika data belum ada, tambahkan data baru
              const idAcak = generateRandomString(5);
              const addData = {
                id_setting: idAcak,
                hari,
                jam_masuk: JSON.stringify(newJamMasuk),
                jam_pulang: JSON.stringify(newJamPulang),
                jam_terlambat: JSON.stringify(newJamTerlambat),
              };
  
              await trx('setting').insert(addData);
  
              resultMessages.push({
                hari,
                status: 'Berhasil',
                message: statusMessage,
              });
            }
          }
        });
  
        res.status(207).json({
          Status: 207,
          success: true,
          results: resultMessages,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          Status: 500,
          error: error.message || 'Internal Server Error',
        });
      }
    } else {
      res.status(400).json({
        Status: 400,
        success: false,
        message: 'Data tidak valid atau kosong',
      });
    }
  });
  
  router.get('/all-setting', async (req, res) => {
    try {
        const data = await conn('setting').select('*');
  
        let liburDays = [];
  
        if (Array.isArray(data)) {
          liburDays = data
            .filter(item => {
              const jamMasukArray = JSON.parse(item.jam_masuk || '[]');
              const jamPulangArray = JSON.parse(item.jam_pulang || '[]');
              const jamTerlambatArray = JSON.parse(item.jam_terlambat || '[]');
  
              // Memeriksa apakah jam_masuk, jam_pulang, dan jam_terlambat semua berisi "libur"
              const isLibur = jamMasukArray.every(time => time === "libur") &&
                              jamPulangArray.every(time => time === "libur") &&
                              jamTerlambatArray.every(time => time === "libur");
  
              return isLibur; // Jika semuanya "libur", maka hari tersebut adalah libur
            })
            .map(item => item.hari); // Ambil hanya nama hari dari data yang libur
        }
    
       
  
        // Format `jam_masuk` untuk setiap item
        const formattedData = data.map(item => {
            const jamMasukArray = JSON.parse(item.jam_masuk || '[]'); // Parsing string JSON jika disimpan sebagai teks
            const jamPulangArray = JSON.parse(item.jam_pulang || '[]');
            const jamTerlambatArray = JSON.parse(item.jam_terlambat || '[]');
  
            item.jam_masuk = `"${jamMasukArray.join('","')}"`;
            item.jam_pulang = `"${jamPulangArray.join('","')}"`;
            item.jam_terlambat = `"${jamTerlambatArray.join('","')}"`;
            return item;
        });
  
        res.status(200).json({
            Status: 200,
            Message: "ok",
            data: formattedData,
            liburDays, // Mengembalikan daftar hari libur
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
  });

  


  module.exports = router;