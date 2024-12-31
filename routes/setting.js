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

  // router.post('/setting-sistem', async (req, res) => {
  //   const settingArray = req.body
  //   const resultMessages = []

  //   if (Array.isArray(settingArray) && settingArray.length > 0) {
  //     try {
  //       await conn.transaction(async trx =>{
  //         for(const settingDataArray of settingArray){
  //           const {hari, jam_masuk, jam_pulang,jam_terlambat}= settingDataArray

  //           if (!hari) {
  //             resultMessages.push({
  //               hari,
  //               status: 'Gagal',
  //               message:' data tidak boleh kosong'
  //             })
  //             continue
  //           }

  //           const existingSetting = await trx('setting')
  //           .where({hari})
  //           .first()

  //           if (!existingSetting) {
  //             resultMessages.push({
  //               hari,
  //               status:'Gagal',
  //               message:'Tidak ada data'
  //             })
  //             continue
  //           }


  //           const addData ={
  //             hari, jam_masuk, jam_pulang,jam_terlambat

  //           }
  //           await trx('setting').insert(addData)

  //           resultMessages.push({
  //             nip,
  //             status: 'Berhasil',
  //             message: 'Data berhasil ditambahkan',
  //         });

  //         }
  //       })
  //       res.status(207).json({
  //         Status: 207,
  //         success: true,
  //         results: resultMessages,
  //     });
  //     } catch (error) {
  //       console.log(error);
  //           res.status(500).json({
  //               Status: 500,
  //               error: error.message || 'Internal Server Error',
  //           });
  //     }
  //   }

  // });

  router.post('/setting-sistem', async (req, res) => {
    const rombelDataArray = req.body;
    const resultMessages = [];

    if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
        try {
            await conn.transaction(async trx => {
                for (const rombelData of rombelDataArray) {
                    const { hari, jam_masuk, jam_pulang,jam_terlambat} = rombelData;

                    // Validasi input data
                    if (!hari) {
                        resultMessages.push({
                          hari,
                            status: 'Gagal',
                            message: 'Data tidak boleh kosong',
                        });
                        continue; // Lewati iterasi jika data tidak valid
                    }

                    // Cek apakah data sudah ada di database
          const existingData = await trx('setting')
          .where('hari', hari)
          .first();

        if (existingData) {
          // Jika data sudah ada, update data yang ada
          await trx('setting')
            .where('hari', hari)
            .update({
              jam_masuk: JSON.stringify(jam_masuk),
              jam_pulang: JSON.stringify(jam_pulang),
              jam_terlambat: JSON.stringify(jam_terlambat),
            });

          resultMessages.push({
            hari,
            status: 'Berhasil',
            message: 'Data berhasil diperbarui',
          });
        } else {
          // Jika data belum ada, insert data baru
          const idAcak = generateRandomString(5);
          const addData = {
            id_setting: idAcak,
            hari,
            jam_masuk: JSON.stringify(jam_masuk),
            jam_pulang: JSON.stringify(jam_pulang),
            jam_terlambat: JSON.stringify(jam_terlambat),
          };

          await trx('setting').insert(addData);

          resultMessages.push({
            hari,
            status: 'Berhasil',
            message: 'Data berhasil ditambahkan',
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

      // Format `jam_masuk` untuk setiap item
      const formattedData = data.map(item => {
          const jamMasukArray = JSON.parse(item.jam_masuk); // Parsing string JSON jika disimpan sebagai teks
          const jamPulangArray = JSON.parse(item.jam_pulang);
          const jamTerlambatArray = JSON.parse(item.jam_terlambat);

          item.jam_masuk = `"${jamMasukArray.join('","')}"`;
          item.jam_pulang = `"${jamPulangArray.join('","')}"`;
          item.jam_terlambat = `"${jamTerlambatArray.join('","')}"`;
          // Format menjadi "07:00","07:17"
          return item;
      });

      res.status(200).json({
          Status: 200,
          Message: "ok",
          data: formattedData,
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