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
router.post('/add-tahun-pelajaran', async (req, res) =>{
    const { id_tahun_pelajaran, id_admin, tahun, aktif } =req.body
    const idAcak = generateRandomString(5);

    //validai input data
    if (!tahun) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong' 
        })        
    }

    try {
        // cek duplikasi data
        const existingTahunAjaran = await conn('tahun_ajaran')
        // .where('id_tahun_pelajaran', id_tahun_pelajaran)
        .where('tahun', tahun)
        .first()

        if (existingTahunAjaran) {
            return res.status(400).json({ 
                Status: 400,
                error: 'data sudah ada' 
              });
        }
        const addData = {
            id_tahun_pelajaran: idAcak, 
            id_admin, 
            tahun, 
            aktif}
        await conn('tahun_ajaran').insert(addData)

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
router.get('/all-tahun-pelajaran', (req, res)=>{
    try {
        conn('tahun_ajaran')
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
router.put('/edit-tahun-pelajaran/:id', async (req, res) =>{
    const id_tahun_pelajaran = req.params.id;
    const {  id_admin, tahun, aktif } = req.body

    //validasi inputan kosong
    // if (!tahun || !aktif) {
    //     return res.status(400).json({
    //         Status: 400,
    //         error: 'Data tidak boleh kosong'
    //     })
    // }

    try {
        //cek apakah data dengan ID yg dimaksud ada
        const existingTahunAjaran = await conn('tahun_ajaran')
        .where('id_tahun_pelajaran', id_tahun_pelajaran)
        .first()

        if (!existingTahunAjaran) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        const duplicateCheck = await conn('tahun_ajaran')
        .where(function(){
            this.where('tahun', tahun)
        })
        .first()
        
        if (duplicateCheck) {
            return res.status(400).json({
                Status: 400,
                error: 'Tahun sudah ada'
            })
        }

        //update data
        const updateTahunPelajaran = {
            tahun,
            aktif
        }

        await conn('tahun_ajaran')
        .where('id_tahun_pelajaran', id_tahun_pelajaran)
        .update(updateTahunPelajaran)

        res.status(200).json({
            Status: 200,
            message: 'Data berhasil diperbarui',
            data: updateTahunPelajaran
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
router.delete('/hapus-tahun-pelajaran/:id', async (req, res)=>{
    const id_tahun_pelajaran = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingTahunAjaran = await conn('tahun_ajaran')
        .where('id_tahun_pelajaran', id_tahun_pelajaran)
        .first()

        if (!existingTahunAjaran) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        await conn('tahun_ajaran')
        .where('id_tahun_pelajaran', id_tahun_pelajaran)
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