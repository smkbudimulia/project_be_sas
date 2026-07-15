const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')

router.post('/', async (req, res) => {
    const dataToDelete = req.body;

    try {
        if (Array.isArray(dataToDelete)) {
            const deletePromises = dataToDelete.map(async (data) => {
                const { id_siswa } = data;

                await conn('absensi')
                    .where('id_siswa', id_siswa)
                    .del();

                await conn('detail_siswa')
                    .where('id_siswa', id_siswa)
                    .del();

                await conn('siswa')
                    .where('id_siswa', id_siswa)
                    .del();
            });

            await Promise.all(deletePromises);
            res.status(200).json({
                Status: 200,
                message: 'Data berhasil dihapus',
                data: dataToDelete
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
