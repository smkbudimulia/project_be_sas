const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')
const multer = require('multer')
const path = require('path')

const BASE_URL = process.env.BASE_URL_IMAGE; 

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder tempat foto disimpan
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname); // Nama unik untuk setiap file
    cb(null, uniqueName);
  },
});

// Inisialisasi Multer
const upload = multer({ storage }).single('foto');


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
router.post('/add-siswa', async (req, res) => {
    // const siswaDataArray = JSON.parse(req.body.siswaData)
   // Pastikan `req.body.siswaData` terdefinisi sebelum memparsing
  if (!req.body.siswaData) {
    return res.status(400).json({
      Status: 400,
      error: 'Data siswa tidak ditemukan',
    });
  }

  let siswaDataArray;
  // Coba parsing `siswaData` jika terdefinisi
  try {
    siswaDataArray = JSON.parse(req.body.siswaData);
  } catch (error) {
    return res.status(400).json({
      Status: 400,
      error: 'Data siswa tidak valid atau bukan JSON',
    });
  }

    // Jika data berbentuk array
    if (Array.isArray(siswaDataArray) && siswaDataArray.length > 0) {
        try {
            for (const siswaData of siswaDataArray) {
                const { id_siswa, id_admin, nis, nama_siswa, jenis_kelamin, id_tahun_pelajaran, id_kelas, id_rombel, email, pass,  barcode, nama_wali, nomor_wali } = siswaData;
                

                // // Validasi input data
                // if (!nis || !nama_siswa || !jenis_kelamin || !id_tahun_pelajaran || !id_kelas || !id_rombel || !nama_wali || !nomor_wali) {
                //     return res.status(400).json({
                //         Status: 400,
                //         error: 'Data tidak boleh kosong',
                //     });
                // }

                // Cek duplikasi data siswa berdasarkan id_siswa atau nis
                const existingSiswa = await conn('siswa')
                    .where('id_siswa', id_siswa)
                    .orWhere('nis', nis)
                    .first();

                if (existingSiswa) {
                    console.log(`Data dengan id_siswa ${id_siswa} atau nis ${nis} sudah ada, melewati proses penyimpanan.`);
                    continue; // Lewati jika sudah ada
                }

                upload(req, res, async function (err) {
                    if (err) {
                      return res.status(500).json({
                        Status: 500,
                        error: 'Error uploading file',
                      });
                    }
          
                    const foto = req.file ? req.file.filename : null;
                    const idAcak = generateRandomString(5); // ID acak
                    const addData = {
                      id_siswa: idAcak,
                      id_admin,
                      nis,
                      nama_siswa,
                      jenis_kelamin,
                      id_tahun_pelajaran,
                      id_kelas,
                      id_rombel,
                      email,
                      pass,
                      foto,
                      barcode,
                      nama_wali,
                      nomor_wali,
                    };
          
                    await conn('siswa').insert(addData);
                  });

               
            }

            res.status(201).json({
                Status: 201,
                success: true,
                message: 'Data siswa berhasil ditambahkan',
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                Status: 500,
                error: 'Internal Server Error',
            });
        }

    } else {
        // Jika input bukan array (data tunggal)
        const { id_siswa, id_admin, nis, nama_siswa, jenis_kelamin, id_tahun_pelajaran, id_kelas, id_rombel, email, pass, barcode, nama_wali, nomor_wali } = req.body;
        // const foto = req.file ? req.file.filename : null;
        // // Validasi input data
        // if (!nis || !nama_siswa || !jenis_kelamin || !id_tahun_pelajaran || !id_kelas || !id_rombel || !nama_wali || !nomor_wali) {
        //     return res.status(400).json({
        //         Status: 400,
        //         error: 'Data tidak boleh kosong',
        //     });
        // }

        try {
            // Cek duplikasi data siswa berdasarkan id_siswa atau nis
            const existingSiswa = await conn('siswa')
                    .where('id_siswa', id_siswa)
                    .orWhere('nis', nis)
                    .first();

                if (existingSiswa) {
                    console.log(`Data dengan ID ${id_siswa} atau NIS ${nis} sudah ada, melewati proses penyimpanan.`);
                     // Lewati jika sudah ada
                }
                 // Mulai upload file jika tidak ada data duplikat
        upload(req, res, async function (err) {
            if (err) {
              return res.status(500).json({
                Status: 500,
                error: 'Error uploading file',
              });
            }
    
            const foto = req.file ? req.file.filename : null;
            const idAcak = generateRandomString(5); // ID acak
            const addData = {
              id_siswa: idAcak,
              id_admin,
              nis,
              nama_siswa,
              jenis_kelamin,
              id_tahun_pelajaran,
              id_kelas,
              id_rombel,
              email,
              pass,
              foto,
              barcode,
              nama_wali,
              nomor_wali,
            };
    
            await conn('siswa').insert(addData);
    
            res.status(201).json({
              Status: 201,
              success: true,
              message: 'Data siswa berhasil ditambahkan',
              data: addData,
            });
          });

         } catch (error) {
            console.log(error);
            res.status(500).json({
                Status: 500,
                error: 'Internal Server Error',
            });
        }
    }
});


  //operasi read: melihat semua akun
router.get('/all-Siswa',  (req, res) => {
    conn('siswa')
    .select('*')
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
     router.put('/edit-siswa/:id/:nis', async (req, res) => {
        const id_siswa = req.params.id;
        const nis = req.params.nis;
        const { nama_siswa, jenis_kelamin, id_tahun_pelajaran, id_kelas, id_rombel, email, pass, foto, barcode, nama_wali, nomor_wali } = req.body;
    
        // Validasi inputan kosong
        if (!nama_siswa || !jenis_kelamin || !id_tahun_pelajaran || !id_kelas || !id_rombel || !nama_wali || !nomor_wali) {
            return res.status(400).json({
                Status: 400,
                error: 'Data tidak boleh kosong'
            });
        }
    
        try {
            // Cek apakah data dengan ID dan NIS yang dimaksud ada
            const existingSiswa = await conn('siswa')
                .where('id_siswa', id_siswa)
                // .andWhere('nis', nis)
                .first();
    
            if (!existingSiswa) {
                return res.status(404).json({
                    Status: 404,
                    error: 'Tidak ada data'
                });
            }
    
            // Cek apakah ada NIS yang sama di data siswa lain
            const duplicateCheck = await conn('siswa')
                .where('nis', nis)
                .andWhere('id_siswa', '!=', id_siswa) // Make sure it's not the same record being updated
                .first();
    
            if (duplicateCheck) {
                return res.status(400).json({
                    Status: 400,
                    error: 'NIS sudah digunakan oleh siswa lain'
                });
            }
    
            // Update data
            const updateSiswa = {
                nama_siswa, 
                jenis_kelamin, 
                id_tahun_pelajaran, 
                id_kelas, 
                id_rombel, 
                email, 
                pass, 
                foto, 
                barcode, 
                nama_wali, 
                nomor_wali
            };
    
            await conn('siswa')
                .where('id_siswa', id_siswa)
                .andWhere('nis', nis)
                .update(updateSiswa);
    
            res.status(200).json({
                Status: 200,
                message: 'Data berhasil diperbarui',
                data: updateSiswa
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                Status: 500,
                error: 'Internal Server Error'
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