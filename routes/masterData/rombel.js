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

// Operasi Post: untuk menambah data baru
router.post('/add-rombel', async (req, res) => {
    const rombelDataArray = req.body;

    // Periksa apakah input adalah array
    if (Array.isArray(rombelDataArray) && rombelDataArray.length > 0) {
        try {
            // Iterasi melalui setiap data dalam array
            for (const rombelData of rombelDataArray) {
                const { id_admin, nama_rombel } = rombelData;

                // Validasi input data
                if (!nama_rombel) {
                    return res.status(400).json({
                        Status: 400,
                        error: 'Data tidak boleh kosong',
                    });
                }

                // Cek duplikasi data
                const existingRombel = await conn('rombel_belajar')
                    .where('nama_rombel', nama_rombel)
                    .first();

                if (existingRombel) {
                    console.log(`Data dengan nama_rombel ${nama_rombel} sudah ada, melewati proses penyimpanan.`);
                    continue; // Jika data sudah ada, lewati iterasi ini dan lanjutkan ke berikutnya
                }

                const idAcak = generateRandomString(5); // ID acak per iterasi
                const addData = {
                    id_rombel: idAcak,
                    id_admin,
                    nama_rombel,
                };

                await conn('rombel_belajar').insert(addData);
            }

            res.status(201).json({
                Status: 201,
                success: true,
                message: 'Data berhasil ditambahkan',
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
        const { id_admin, nama_rombel } = req.body;

        // Validasi input data
        if (!nama_rombel) {
            return res.status(400).json({
                Status: 400,
                error: 'Data tidak boleh kosong',
            });
        }

        try {
            // Cek duplikasi data
            const existingRombel = await conn('rombel_belajar')
                .where('nama_rombel', nama_rombel)
                .first();

            if (existingRombel) {
                return res.status(400).json({
                    Status: 400,
                    error: 'Data sudah ada',
                });
            }

            const idAcak = generateRandomString(5); // ID acak untuk data tunggal
            const addData = {
                id_rombel: idAcak,
                id_admin,
                nama_rombel,
            };

            await conn('rombel_belajar').insert(addData);

            res.status(201).json({
                Status: 201,
                success: true,
                message: 'Data berhasil ditambahkan',
                data: addData
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
  

//operasi read: melihat semua data
router.get('/all-rombel', (req, res)=>{
    try {
        conn('rombel_belajar')
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

// // Operasi Put/ Update: merubah data yang sudah ada pada database
router.put('/edit-rombel/:id', async (req, res) =>{
    const id_rombel = req.params.id;
    const { nama_rombel } = req.body;

    //validasi inputan kosong
    if (!nama_rombel) {
        return res.status(400).json({
            Status: 400,
            error: 'Data tidak boleh kosong'
        })
    }

    try {
        //cek apakah data dengan ID yg dimaksud ada
        const existingRombel = await conn('rombel_belajar')
        .where('id_rombel', id_rombel)
        .first()

        if (!existingRombel) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }

        const duplicateCheck = await conn('rombel_belajar')
        .where(function(){
            this.where('nama_rombel', nama_rombel)
            
        })
        .first()

        if (duplicateCheck) {
            return res.status(400).json({
                Status: 400,
                error: 'Rombel sudah ada'
            })
        }

        //update data
        const updateRombel = {
            nama_rombel
        }

        await conn('rombel_belajar')
        .where('id_rombel', id_rombel)
        .update(updateRombel)

        res.status(200).json({
            Status: 200,
            message: 'Data berhasil diperbarui',
            data: updateRombel
        })
    } catch (error) {
        console.error(error);
    res.status(500).json({
      Status: 500,
      error: 'Internal Server Error'
    })
    }
})

// //operasi delete: menghapus data by Id
router.delete('/hapus-rombel/:id', async (req, res)=>{
    const id_rombel = req.params.id;

    try {
        //cek apakah Id yang dimaksud ada.!
        const existingRombel = await conn('rombel_belajar')
        .where('id_rombel', id_rombel)
        .first()

        if (!existingRombel) {
            return res.status(404).json({
                Status: 404,
                error: 'Tidak ada data'
            })            
        }
        // hapus tahun pelajaran berdasarkan id
        await conn('rombel_belajar')
        .where('id_rombel', id_rombel)
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