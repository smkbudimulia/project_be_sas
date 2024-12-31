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
router.post('/add-guru', async (req, res) => {
    const { id_guru, id_admin, nip, nama_guru, jenis_kelamin, id_mapel, email, pass, foto, walas, barcode, id_kelas, rombel, no_telp} = req.body;
    const idAcak = generateRandomString(5);
    
    // Validasi input kosong
    if ( !nip || !nama_guru || !jenis_kelamin || !email || !rombel || !no_telp) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong'
          });
        }
  
    try {
        // Cek duplikasi id_siswa
        const existingGuru = await conn('guru')
            .where('id_guru', id_guru)
            .orWhere('nip', nip)
            .first();
  
        if (existingGuru) {
            return res.status(404).json({
                Status: 404,
                error: 'data sudah ada'
              });
            }
  
        // Masukkan data baru
        const addData = {
            id_guru:idAcak, id_admin, nip, nama_guru, jenis_kelamin, id_mapel, email, pass, foto, walas, barcode, id_kelas, rombel, no_telp
        };
  
        await conn('guru').insert(addData);
  
        res.status(201).json({
            Status: 201,
            success: true,
            message: 'OK',
            data: addData
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
          Status: 500,
          error: 'Internal Server Error' 
        });   
    }
  });

  //operasi read: melihat semua akun
router.get('/all-guru',  (req, res) => {
    conn('guru')
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
     router.put('/edit-guru/:id/:nip', async (req, res) => {
        const id_guru = req.params.id;
        const nip = req.params.nip;
        const {  nama_guru, jenis_kelamin, id_mapel, email, pass, foto, walas, barcode, id_kelas, rombel, no_telp } = req.body;
    
        // Validasi inputan kosong
        // if (!nip || !nama_guru || !jenis_kelamin || !email || !rombel || !no_telp) {
        //     return res.status(400).json({
        //         Status: 400,
        //         error: 'Data tidak boleh kosong'
        //     });
        // }
    
        try {
            // Cek apakah data dengan ID dan NIS yang dimaksud ada
            const existingGuru = await conn('guru')
                .where('id_guru', id_guru)
                .andWhere('nip', nip)
                .first();
    
            if (!existingGuru) {
                return res.status(404).json({
                    Status: 404,
                    error: 'Tidak ada data'
                });
            }
    
            // Cek apakah ada NIS yang sama di data guru lain
            const duplicateCheck = await conn('guru')
                .where('nip', nip)
                .andWhere('id_guru', '!=', id_guru) // Make sure it's not the same record being updated
                .first();
    
            if (duplicateCheck) {
                return res.status(400).json({
                    Status: 400,
                    error: 'NIP sudah digunakan oleh Guru lain'
                });
            }
    
            // Update data
            const updateGuru = {
                nama_guru, jenis_kelamin, id_mapel, email, pass, foto, walas, barcode, id_kelas, rombel, no_telp
            };
    
            await conn('guru')
                .where('id_guru', id_guru)
                .andWhere('nip', nip)
                .update(updateGuru);
    
            res.status(200).json({
                Status: 200,
                message: 'Data berhasil diperbarui',
                data: updateGuru
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
        await conn('guru')
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