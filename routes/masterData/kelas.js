const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')


// untuk mengaktifkan verivikasi token ke semua aksi
// router.use(verifyToken);

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

  // Operasi Post: luntuk menambah data baru
router.post('/add-kelas', async (req, res) =>{
    const { id_kelas, id_admin, kelas } =req.body
    const idAcak = generateRandomString(5);

    //validai input data
    if (!kelas) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong' 
        })        
    }

    try {
        // cek duplikasi data
        const existingKelas = await conn('kelas')
        // .where('id_kelas', id_kelas)
        .where('kelas', kelas)
        .first()

        if (existingKelas) {
            return res.status(400).json({ 
                Status: 400,
                error: 'data sudah ada' 
              });
        }
        const addData = {
            id_kelas: idAcak, 
            id_admin, 
            kelas
            }
        await conn('kelas').insert(addData)

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
})

//operasi read: melihat semua data
router.get('/all-kelas', (req, res)=>{
    try {
        conn('kelas')
        .select('*')
        .then((data)=>{
            res.status(200).json({
                Status: 200,
                message: "ok",
                data: data
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
          Status: 500,
          error: 'Internal Server Error' 
        });        
    }
   
})

// Operasi Put/ Update: merubah data yang sudah ada pada database
router.put('/edit-kelas/:id', async (req, res) =>{
    const id_kelas = req.params.id;
    const { kelas } = req.body;

    //validasi inputan kosong
    if (!kelas) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong'
        })
    }

    try {
        //cek apakah data dengan ID yg dimaksud ada
        const existingKelas = await conn('kelas')
        .where('id_kelas', id_kelas)
        .first()

        if (!existingKelas) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }

        const duplicateCheck = await conn('kelas')
        .where(function(){
            this.where('kelas', kelas)
            
        })
        .first()

        if (duplicateCheck) {
            return res.status(400).json({
                Status: 400,
                error: 'Kelas sudah ada'
            })
        }

        //update data
        const updateKelas = {
            kelas
        }

        await conn('kelas')
        .where('id_kelas', id_kelas)
        .update(updateKelas)

        res.status(200).json({
            Status: 200,
            message: 'Data berhasil diperbarui',
            data: updateKelas
        })
    } catch (error) {
        console.error(error);
    res.status(500).json({
      Status: 500,
      error: 'Internal Server Error'
    })
    }
})

//operasi delete: menghapus data by Id
router.delete('/hapus-kelas/:id', async (req, res)=>{
    const id_kelas = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingKelas = await conn('kelas')
        .where('id_kelas', id_kelas)
        .first()

        if (!existingKelas) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        await conn('kelas')
        .where('id_kelas', id_kelas)
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