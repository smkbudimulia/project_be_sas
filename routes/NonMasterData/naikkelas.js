const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')

router.put('/naik-kelas', async (req, res) => {
    const dataToUpdate = req.body; // Asumsi data ini adalah array

    try {
        if (Array.isArray(dataToUpdate)) {
            // Jika dataToUpdate adalah array, lakukan loop untuk setiap item
            const updatePromises = dataToUpdate.map(async (data) => {
                const { id_siswa, nis, id_kelas} = data;
                return conn('siswa')
                    .where('id_siswa', id_siswa)
                    .andWhere('nis', nis)
                    .update({ id_kelas });
            });

            // Tunggu semua pembaruan selesai
            await Promise.all(updatePromises);
            res.status(200).json({
                Status: 200,
                message: 'Data berhasil diperbarui',
                data: dataToUpdate
            });
        } else {
            res.status(400).json({
                Status: 400,
                error: 'Data yang dikirimkan bukan array'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});


module.exports = router;