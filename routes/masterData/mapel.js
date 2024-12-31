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
router.post('/add-mapel', async (req, res) =>{
    const { id_mapel, id_admin, nama_mapel } =req.body
    const idAcak = generateRandomString(5);

    //validai input data
    if ( !nama_mapel ) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong' 
        })        
    }

    try {
        // cek duplikasi data
        const existingMapel = await conn('mapel')
        // .where('id_mapel', id_mapel)
        .where('nama_mapel', nama_mapel)
        .first()

        if (existingMapel) {
            return res.status(400).json({ 
                Status: 400,
                error: 'data sudah ada' 
              });
        }
        const addData = {
            id_mapel: idAcak, id_admin, nama_mapel
            }
        await conn('mapel').insert(addData)

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
router.get('/all-mapel', (req, res)=>{
    try {
        conn('mapel')
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
router.put('/edit-mapel/:id', async (req, res) =>{
    const id_mapel = req.params.id;
    const { nama_mapel } = req.body;

    //validasi inputan kosong
    if (!nama_mapel) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong'
        })
    }

    try {
        //cek apakah data dengan ID yg dimaksud ada
        const existingMapel = await conn('mapel')
        .where('id_mapel', id_mapel)
        .first()

        if (!existingMapel) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }

        const duplicateCheck = await conn('mapel')
        .where(function(){
            this.where('nama_mapel', nama_mapel)
            
        })
        .first()

        if (duplicateCheck) {
            return res.status(400).json({
                Status: 400,
                error: 'Mapel sudah ada'
            })
        }

        //update data
        const updateMapel = {
            nama_mapel
        }

        await conn('mapel')
        .where('id_mapel', id_mapel)
        .update(updateMapel)

        res.status(200).json({
            Status: 200,
            message: 'Data berhasil diperbarui',
            data: updateMapel
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
router.delete('/hapus-mapel/:id', async (req, res)=>{
    const id_mapel = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingMapel = await conn('mapel')
        .where('id_mapel', id_mapel)
        .first()

        if (!existingMapel) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        await conn('mapel')
        .where('id_mapel', id_mapel)
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