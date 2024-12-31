const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')


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

// operasi post: menambah data akun atau administrasi baru
// router.post('/add-guru', async (req, res) => {
//     const rombelDataArray = req.body;

//     // Periksa apakah input adalah array
//     if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
//         try {
//             // Iterasi melalui setiap data dalam array
//             for (const rombelData of rombelDataArray) {
//                 const {  id_admin, nip, nama_guru, jenis_kelamin,no_telp } = rombelData;

//                 // Validasi input data
//                 if (!nip || !nama_guru || !jenis_kelamin || !no_telp ) {
//                     return res.status(400).json({
//                         Status: 400,
//                         error: 'Data tidak boleh kosong',
//                     });
//                 }

//                 // Cek duplikasi data
//                 const existingGuru = await conn('guru')
//                     .where('nip', nip)
//                     .first();

//                 if (existingGuru) {
//                     console.log("Data Sudah Ada");
//                     continue; // Jika data sudah ada, lewati iterasi ini dan lanjutkan ke berikutnya
//                 }

//                 const idAcak = generateRandomString(5); // ID acak per iterasi
//                 const addData = {
//                     id_guru:idAcak, 
//                     id_admin, 
//                     nip, 
//                     nama_guru, 
//                     jenis_kelamin,
//                     no_telp,
//                 };

//                 await conn('guru').insert(addData);
                
//             }

//             res.status(201).json({
//                 Status: 201,
//                 success: true,
//                 message: 'Data berhasil ditambahkan',
//             });

//         } catch (error) {
//             console.log(error);
//             res.status(500).json({
//                 Status: 500,
//                 error: 'Internal Server Error',
//             });
//         }

//     } else {
//         // Jika input bukan array (data tunggal)
//         const {  id_admin, nip, nama_guru, jenis_kelamin,no_telp } = req.body;

//         // Validasi input data
//         if (!nip || !nama_guru || !jenis_kelamin || !no_telp) {
//             return res.status(400).json({
//                 Status: 400,
//                 error: 'Data tidak boleh kosong',
//             });
//         }

//         try {
//             // Cek duplikasi data
//             const existingGuru = await conn('guru')
//                     .where('nip', nip)
//                     .first();

//                 if (existingGuru) {
//                     console.log("Data Sudah Ada");
                   
//                 }

//             const idAcak = generateRandomString(5); // ID acak untuk data tunggal
//             const addData = {
//                 id_guru:idAcak, 
//                     id_admin, 
//                     nip, 
//                     nama_guru, 
//                     jenis_kelamin,
//                     no_telp
//             };

//             await conn('guru').insert(addData);

//             res.status(201).json({
//                 Status: 201,
//                 success: true,
//                 message: 'Data berhasil ditambahkan',
//                 data: addData
//             });

//         } catch (error) {
//             console.log(error);
//             res.status(500).json({
//                 Status: 500,
//                 error: 'Internal Server Error',
//             });
//         }
//     }
// });

router.post('/add-guru', async (req, res) => {
    const rombelDataArray = req.body;
    const resultMessages = [];

    if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
        try {
            await conn.transaction(async trx => {
                for (const rombelData of rombelDataArray) {
                    const { id_admin, nip, nama_guru, jenis_kelamin, no_telp, email, pas, foto, staf,walas, barcode } = rombelData;

                    // Validasi input data
                    if (!nip || !nama_guru || !jenis_kelamin || !no_telp) {
                        resultMessages.push({
                            nip,
                            status: 'Gagal',
                            message: 'Data tidak boleh kosong',
                        });
                        continue; // Lewati iterasi jika data tidak valid
                    }

                    // Cek duplikasi data
                    const existingGuru = await trx('guru')
                        .where('nip', nip)
                        .first();

                    if (existingGuru) {
                        resultMessages.push({
                            status: 'Gagal',
                            message: `Data guru dengan NIP sudah ada`,
                        });
                        continue; // Lewati iterasi jika data sudah ada
                    }

                    // ID acak per iterasi
                    const idAcak = generateRandomString(5);
                    const addData = {
                        id_guru: idAcak,
                        id_admin,
                        nip,
                        nama_guru,
                        jenis_kelamin,
                        no_telp,
                    };

                    // Insert data ke tabel guru
                    await trx('guru').insert(addData);

                    // Insert data ke tabel detail_guru                    
                    const detailData = {
                        id_guru: idAcak,
                        email, 
                        pas, 
                        foto, 
                        staf,
                        walas, 
                        barcode,// Gunakan id_guru yang baru dibuat
                        // tambahkan kolom lainnya sesuai struktur tabel detail_guru
                    };
                    await trx('detail_guru').insert(detailData);

                                        
                    resultMessages.push({
                        nip,
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
  router.get('/all-guru', async (req, res) => {
    try {
        const data = await conn('guru')
        .select('*')
            .leftJoin('detail_guru', 'guru.id_guru', '=', 'detail_guru.id_guru')
            // .leftJoin('mengampu','guru.id_guru','=','mengampu.id_guru')
            // // Mengambil semua kolom dari kedua tabel
            // .leftJoin('mapel', 'mengampu.id_mapel', 'mapel.id_mapel')
            // .leftJoin('kelas', 'mengampu.id_kelas', 'kelas.id_kelas')
            // .leftJoin('rombel_belajar', 'mengampu.id_rombel', 'rombel_belajar.id_rombel')
        
        // Log data untuk debugging
        // console.log("Data dari Database:", data);

        // const AllData = data.map(item => {
        //     let id_mapelArray = [];
        //     if (item.id_mapel && item.id_mapel.trim() !== "") {
        //         try {
        //             id_mapelArray = JSON.parse(item.id_mapel);
        //         } catch (error) {
        //             console.error('Error parsing JSON:', error);
        //         }
        //     }
        //     return {
        //         ...item,
        //         id_mapel: id_mapelArray.join(", "),
        //     };
        // });

        res.status(200).json({
            Status: 200,
            success: true,
            data: data,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            Status: 500,
            error: error.message || 'Internal Server Error',
        });
    }
});



     // Operasi Put/ Update: merubah data yang sudah ada pada database
     router.put('/edit-guru', async (req, res) => {
        const rombelDataArray = req.body;
        const resultMessages = [];
    
        if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
            try {
                await conn.transaction(async trx => {
                    for (const rombelData of rombelDataArray) {
                        const { id_guru, nip, nama_guru, jenis_kelamin, no_telp, 
                            email, pass, foto, staf, walas, barcode,
                         } = rombelData;
    
                        // Validasi input data
                        if (!id_guru ) {
                            resultMessages.push({
                                nip,
                                status: 'Gagal',
                                message: 'Data tidak boleh kosong',
                            });
                            continue; // Lewati iterasi jika data tidak valid
                        }
    
                        // Cek keberadaan data berdasarkan id_guru
                        const existingGuru = await trx('guru')
                            .where({ id_guru })
                            .first();
    
                        if (!existingGuru) {
                            // Jika data tidak ditemukan, tambahkan pesan ke hasil
                            resultMessages.push({
                                nip,
                                status: 'Gagal',
                                message: 'tidak ditemukan',
                            });
                            continue; // Lewati iterasi jika data tidak ditemukan
                        }
    
                        // Update data di tabel guru
                        await trx('guru')
                            .where({ id_guru })
                            .update({
                                nip,
                                nama_guru,
                                jenis_kelamin,
                                no_telp,
                            });
                            
    
                        // Update data di tabel detail_guru jika ada data detail
                        const existingDetailGuru = await trx('detail_guru')
                            .where({ id_guru })
                            .first();
    
                        if (!existingDetailGuru) {
                            resultMessages.push({
                                nip,
                                status: 'Gagal',
                                message: 'tidak ditemukan',
                            });
                            continue;
                            // Jika data detail_guru ada, update
                           
                        } 
                        // Update data di tabel detail_guru
                        await trx('detail_guru')
                        .where({ id_guru })
                        .update({
                            email, 
                            pass, 
                            foto, 
                            staf,
                            walas, 
                            barcode,
                        });


                        
                        resultMessages.push({
                            nip,
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
router.delete('/hapus-guru/:id', async (req, res)=>{
    const id_guru = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingGuru = await conn('guru')
        .where('id_guru', id_guru)
        .first()

        if (!existingGuru) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        //di tabel guru
        await conn('guru')
        .where('id_guru', id_guru)
        .del();

        //di tabel detail_guru
        await conn('detail_guru')
        .where('id_guru', id_guru)
        .del();

        //di tabel detail_guru
        await conn('mengampu')
        .where('id_guru', id_guru)
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