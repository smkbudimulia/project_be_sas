const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')
const multer = require('multer')
const path = require('path')



function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}

// // Operasi Post: untuk menambah data baru
// router.post('/add-siswa', async (req, res) => {
//   const rombelDataArray = req.body;

//   // Periksa apakah input adalah array
//   if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
//       try {
//           // Iterasi melalui setiap data dalam array
//           for (const rombelData of rombelDataArray) {
//               const { id_siswa, id_admin, nis,nama_siswa,jenis_kelamin, id_tahun_pelajaran,id_kelas,id_rombel,nama_wali,nomor_wali} = rombelData;

//               // Validasi input data
//               if (!id_siswa || !nis || !nama_siswa || !jenis_kelamin ||!nama_wali || !nomor_wali) {
//                   return res.status(400).json({
//                       Status: 400,
//                       error: 'Data tidak boleh kosong',
//                   });
//               }

//               // Cek duplikasi data
//               const existingSiswa = await conn('siswa')
//                   .where('id_siswa', id_siswa)
//                   .orWhere('nis', nis)
//                   .first();

//               if (existingSiswa) {
//                   console.log(`Data dengan NIS ${nis} sudah ada, melewati proses penyimpanan.`);
//                   continue; // Jika data sudah ada, lewati iterasi ini dan lanjutkan ke berikutnya
//               }

             
//               const addData = {
//                 id_siswa, 
//                 id_admin,
//                 nis,
//                 nama_siswa,
//                 jenis_kelamin, 
//                 id_tahun_pelajaran,
//                 id_kelas,
//                 id_rombel,
//                 nama_wali,
//                 nomor_wali,
//               };

//               await conn('siswa').insert(addData);
//           }

//           res.status(201).json({
//               Status: 201,
//               success: true,
//               message: 'Data berhasil ditambahkan',
//           });

//       } catch (error) {
//           console.log(error);
//           res.status(500).json({
//               Status: 500,
//               error: 'Internal Server Error',
//           });
//       }

//   } else {
//       // Jika input bukan array (data tunggal)
//       const { id_siswa, id_admin, nis,nama_siswa,jenis_kelamin, id_tahun_pelajaran,id_kelas,id_rombel,nama_wali,nomor_wali } = req.body;

//       // Validasi input data
//       if (!id_siswa || !nis || !nama_siswa || !jenis_kelamin ||!nama_wali || !nomor_wali) {
//         return res.status(400).json({
//             Status: 400,
//             error: 'Data tidak boleh kosong',
//         });
//     }

//       try {
//           // Cek duplikasi data
//           const existingSiswa = await conn('siswa')
//           .where('id_siswa', id_siswa)
//           .orWhere('nis', nis)
//           .first();

//           if (existingSiswa) {
//             return res.status(400).json({
//                 Status: 400,
//                 error: 'Data sudah ada',
//             });
//         }

         
//         const addData = {
//           id_siswa, 
//           id_admin,
//           nis,
//           nama_siswa,
//           jenis_kelamin, 
//           id_tahun_pelajaran,
//           id_kelas,
//           id_rombel,
//           nama_wali,
//           nomor_wali,
//         };

//           await conn('siswa').insert(addData);

//           res.status(201).json({
//               Status: 201,
//               success: true,
//               message: 'Data berhasil ditambahkan',
//               data: addData
//           });

//       } catch (error) {
//           console.log(error);
//           res.status(500).json({
//               Status: 500,
//               error: 'Internal Server Error',
//           });
//       }
//   }
// });

router.post('/add-siswa', async (req, res) => {
    const siswaDataArray = req.body;
    const resultMessages = [];

    if (Array.isArray(siswaDataArray) && siswaDataArray.length > 0) {
        try {
            await conn.transaction(async trx => {
                for (const siswaData of siswaDataArray) {
                    const {  id_siswa, id_admin, nis,nama_siswa,jenis_kelamin, id_tahun_pelajaran,id_kelas,id_rombel,nama_wali,nomor_wali, email, pass, foto, barcode, } = siswaData;

                    // Validasi input data
                    if (!nis || !nama_siswa || !jenis_kelamin ) {
                        resultMessages.push({
                            nis,
                            status: 'Gagal',
                            message: 'Data tidak boleh kosong',
                        });
                        continue; // Lewati iterasi jika data tidak valid
                    }

                    // Cek duplikasi data
                    const existingSiswa = await trx('siswa')
                        .where('nis', nis)
                        .first();

                    if (existingSiswa) {
                        resultMessages.push({
                            status: 'Gagal',
                            message: `Data guru dengan NIP sudah ada`,
                        });
                        continue; // Lewati iterasi jika data sudah ada
                    }

                    // ID acak per iterasi
                    // const idAcak = generateRandomString(5);
                    const addData = {
                        id_siswa,
                        id_admin, 
                        nis,
                        nama_siswa,
                        jenis_kelamin,
                        id_tahun_pelajaran,
                        id_kelas,
                        id_rombel,
                        nama_wali,
                        nomor_wali
                    };

                    // Insert data ke tabel guru
                    await trx('siswa').insert(addData);

                    // Insert data ke tabel detail_guru
                    const idAcak2 = generateRandomString(5);
                    const detailData = {
                        id_ds: idAcak2,
                        id_siswa,
                        email, 
                        pass, 
                        foto,
                        barcode,// Gunakan id_guru yang baru dibuat
                        // tambahkan kolom lainnya sesuai struktur tabel detail_guru
                    };
                    await trx('detail_siswa').insert(detailData);

                    resultMessages.push({
                        nis,
                        status: 'Berhasil',
                        message: 'Data berhasil ditambahkan',
                    });
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

  //operasi read: melihat semua akun
router.get('/all-Siswa',  (req, res) => {
    conn('siswa')
    .select('*',
        'siswa.id_tahun_pelajaran',
        'siswa.id_kelas',
        'siswa.id_rombel'
    )
    .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
    .leftJoin('tahun_ajaran', 'siswa.id_tahun_pelajaran', 'tahun_ajaran.id_tahun_pelajaran')
    .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
    .then((data) => {
        res.status(200).json({
            Status: 200,
            message: "ok",
            data: data
        })
    }).catch((error) => {
        console.log(error);
        res.status(500).json({ 
          Status: 500,
          error: 'Internal Server Error' 
        });
    })
     });

     // Operasi Put/ Update: merubah data yang sudah ada pada database
     router.put('/edit-siswa', async (req, res) => {
        const siswaDataArray = req.body;
        const resultMessages = [];
    
        if (Array.isArray(siswaDataArray) && siswaDataArray.length > 0) {
            try {
                await conn.transaction(async trx => {
                    for (const siswaData of siswaDataArray) {
                        const { id_siswa, nis,nama_siswa,jenis_kelamin, id_tahun_pelajaran,id_kelas,id_rombel,nama_wali,nomor_wali, email, pass, foto, barcode,
                         } = siswaData;
    
                        // Validasi input data
                        if (!id_siswa ) {
                            resultMessages.push({
                                nis,
                                status: 'Gagal',
                                message: 'Data tidak boleh kosong',
                            });
                            continue; // Lewati iterasi jika data tidak valid
                        }
    
                        // Cek keberadaan data berdasarkan id_guru
                        const existingSiswa = await trx('siswa')
                            .where({ id_siswa })
                            .first();
    
                        if (!existingSiswa) {
                            // Jika data tidak ditemukan, tambahkan pesan ke hasil
                            resultMessages.push({
                                status: 'Gagal',
                                message: `Data tidak ditemukan`,
                            });
                            continue; // Lewati iterasi jika data tidak ditemukan
                        }
    
                        // Update data di tabel guru
                        await trx('siswa')
                            .where({ id_siswa })
                            .update({
                                
                        nis,
                        nama_siswa,
                        jenis_kelamin,
                        id_tahun_pelajaran,
                        id_kelas,
                        id_rombel,
                        nama_wali,
                        nomor_wali
                            });
    
                        // Update data di tabel detail_guru jika ada data detail
                        const existingDetailSiswa = await trx('detail_siswa')
                            .where({ id_siswa })
                            .first();
    
                        if (existingDetailSiswa) {
                            // Jika data detail_guru ada, update
                            await trx('detail_siswa')
                                .where({ id_siswa })
                                .update({
                                  
                                    email: email || existingDetailSiswa.email, // Hanya update jika ada data baru
                                    pass: pass || existingDetailSiswa.pass,
                                    foto: foto || existingDetailSiswa.foto,
                                    barcode: barcode || existingDetailSiswa.barcode,
                                });
                        } else {
                            // Jika data detail_guru tidak ada, buat entri baru
                            const idAcak2 = generateRandomString(5);
                            const detailData = {
                                id_ds: idAcak2,
                                id_siswa: id_siswa,
                                email, 
                                pass, 
                                foto,
                                barcode,
                            };
                            await trx('detail_siswa').insert(detailData);
                        }
    
                        resultMessages.push({
                            nis,
                            status: 'Berhasil',
                            message: 'Data berhasil diperbarui di kedua tabel',
                        });
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
    
    //operasi delete: menghapus data by Id
router.delete('/hapus-siswa/:id', async (req, res)=>{
    const id_siswa = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingSiswa = await conn('siswa')
        .where('id_siswa', id_siswa)
        .first()

        if (!existingSiswa) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        await conn('siswa')
        .where('id_siswa', id_siswa)
        .del();

        await conn('detail_siswa')
        .where('id_siswa', id_siswa)
        .del();


        res.status(200).json({
            Status: 200,
            message: 'Data berhasil dihapus'
        })
    } catch (error) {
        console.error(error);
    res.status(500).json({
      Status: 500,
      error: 'Internal Server Error'
    })        
    }
})

  module.exports = router;