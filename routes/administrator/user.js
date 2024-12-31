const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')


//middleware untuk mendapatkan variabel umum
// router.use((req, res, next) => {
//   req.id_admin = req.params.id;
//   req.newAdmin = req.body;
//   req.update_admin = req.body;
//   next();
// });

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

// operasi post: menambah data akun atau administrasi baru
router.post('/add-Admin',  async (req, res) => {
  const { nama_admin, alamat, jenis_kelamin, no_telp, email, username, pass, foto, status } = req.body;
  const idAcak = generateRandomString(5);
  
  // Validasi input kosong
  if (!nama_admin || !alamat || !jenis_kelamin || !no_telp || !email || !username || !pass || !status) {
      return res.status(400).json({ 
        Status: 400,
        error: 'Data tidak boleh kosong' 
      });
  }

  try {
      // Cek duplikasi id_admin atau email
      const existingAdmin = await conn('admin')
          .where('id_admin', idAcak)
          .orWhere('email', email)
          .first();

      if (existingAdmin) {
          return res.status(400).json({ 
            Status: 400,
            error: 'ID Admin atau Email sudah terdaftar' 
          });
      }

      //Hash pass sebelum disimpan(enkripsi)
      const hashPass = await bcrypt.hash(pass, 11)

      // Masukkan data baru
      const addData = {
          id_admin: idAcak,
          nama_admin,
          alamat,
          jenis_kelamin,
          no_telp,
          email,
          username,
          pass: hashPass,
          foto,
          status
      };

      await conn('admin').insert(addData);

      res.status(201).json({
          Status: 201,
          success: true,
          message: 'Ok',
          data: addData
      });
  } catch (error) {
      console.log(error);
      res.status(500).json({ 
        Status: 500,
        error: 'Internal Server Error' 
      });
  }
});


//operasi read: melihat semua akun

router.get('/all-Admin',   (req, res) => {

  conn('admin')
  .select('*')
  .then((data) => {
   res.status(200).json({
    Status: 200,
    message: 'Ok',
    data: data
   })
  })
  .catch((error) => {
   console.log(error)
   res.status(500).json({
    Status: 500,
    message: 'Server Error',
    error: error.message
  })
  })
   });
 

//operasi put/ update: merubah data yang sudah ada di database
router.put('/edit-admin/:id', async (req, res) => {
  const id_admin = req.params.id;
  const { nama_admin, alamat, jenis_kelamin, no_telp, email, username, foto, status } = req.body;

  // Validasi input kosong
  if (!nama_admin || !alamat || !jenis_kelamin || !no_telp || !email || !username || !foto || !status) {
    return res.status(400).json({
      Status: 400,
      error: 'Data tidak boleh kosong'
    });
  }

  try {
    // Cek apakah admin dengan ID tersebut ada
    const existingAdmin = await conn('admin')
      .where('id_admin', id_admin)
      .first();

    if (!existingAdmin) {
      return res.status(404).json({
        Status: 404,
        error: 'ok'
      });
    }

    // Cek duplikasi email atau username
    const duplicateCheck = await conn('admin')
      .where(function() {
        this.where('email', email)
        .orWhere('username', username);
      })
      .andWhere('id_admin', '!=', id_admin)
      .first();

    if (duplicateCheck) {
      return res.status(400).json({
        Status: 400,
        error: 'Email atau Username sudah digunakan'
      });
    }

     //Hash pass sebelum disimpan(enkripsi)
     const hashPass = await bcrypt.hash(pass, 11)

    // Update data admin
    const update_admin = {
      nama_admin,
      alamat,
      jenis_kelamin,
      no_telp,
      email,
      username,
      pass:hashPass,
      foto,
      status
    };

    await conn('admin')
      .where('id_admin', id_admin)
      .update(update_admin);

    res.status(200).json({
      Status: 200,
      message: 'Admin berhasil diperbarui',
      data: update_admin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      statusCode: 500,
      error: 'Error 500 - Internal Server Error'
    });
  }
});


//operasi delete: menghapus data by Id
router.delete('/hapus-admin/:id', async (req, res) => {
  const id_admin = req.params.id;

  try {
    // Cek apakah admin dengan ID tersebut ada
    const existingAdmin = await conn('admin')
      .where('id_admin', id_admin)
      .first();

    if (!existingAdmin) {
      return res.status(404).json({
        Status: 404,
        error: 'Admin tidak ditemukan'
      });
    }

    // Hapus admin berdasarkan id_admin
    await conn('admin')
      .where('id_admin', id_admin)
      .del();

    res.status(200).json({
      Status: 200,
      message: 'Data admin berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      Status: 500,
      error: 'Error 500 - Internal Server Error'
    });
  }
});


module.exports = router;