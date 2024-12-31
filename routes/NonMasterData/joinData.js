const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')



// data jumlah kelas dan siswanya
// router.get('/total-kelas-siswa', async (req, res) => {
//     try {
//         const data = await conn('siswa')
//             .select(
//                 'siswa.id_kelas',
//                 'siswa.id_rombel',
//                 'kelas.kelas', // Nama kelas dari tabel kelas
//                 'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
//             )
//             .count('* as total_siswa')
//             .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
//             .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
//             .groupBy('siswa.id_kelas', 'siswa.id_rombel', 'kelas.kelas', 'rombel_belajar.nama_rombel');

//             //mengambil data guru
//             const guruData = await conn('guru')
//             .select('id_guru', 'nama_guru');

            

//         const result = data.map(item => ({
//             ...item,
//             kelas: `${item.kelas} ${item.nama_rombel}` // Menggabungkan nama kelas dan nama rombel
//         }));

//         // Menghitung total semua siswa
//         const totalSemuaSiswa = result.reduce((total, item) => total + item.total_siswa, 0);

//         if (data && data.length > 0) {
//             res.status(200).json({
//                 Status: 200,
//                 message: "ok",
//                 Guru: guruData,
//                 totalSemuaSiswa, // Menambahkan total semua siswa
//                 data: result,

//             });
//         } else {
//             res.status(200).json({
//                 Status: 200,
//                 message: "No data found",
//                 data: []
//             });
//         }
//     } catch (error) {
//         console.error("Database query failed:", error.message);
//         res.status(500).json({
//             Status: 500,
//             error: 'Internal Server Error'
//         });
//     }
// });
router.get('/total-kelas-siswa', async (req, res) => {
    try {
        // Mendapatkan tanggal sesuai waktu komputer server
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Query untuk data siswa
        const siswaData = await conn('siswa')
            .select(
                'siswa.id_kelas',
                'siswa.id_rombel',
                'kelas.kelas', // Nama kelas dari tabel kelas
                'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
            )
            .count('* as total_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .groupBy('siswa.id_kelas', 'siswa.id_rombel', 'kelas.kelas', 'rombel_belajar.nama_rombel');

        // Query untuk total hadir per kelas pada hari ini
        const totalHadirData = await conn('absensi')
            .select(
                'kelas.kelas',
                'rombel_belajar.nama_rombel',
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Datang" THEN 1 END) AS total_hadir')
            )
            .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .where('absensi.tanggal', formattedDate) // Filter hanya untuk tanggal hari ini
            .groupBy('kelas.kelas', 'rombel_belajar.nama_rombel');

        // Query untuk total semua guru
        const totalSemuaGuru = await conn('guru').count('* as total_guru').first();

        // Gabungkan data siswa dan total hadir
        const combinedData = siswaData.map((siswa) => {
            const totalHadir = totalHadirData
                .filter(
                    (hadir) =>
                        hadir.kelas === siswa.kelas &&
                        hadir.nama_rombel === siswa.nama_rombel
                )
                .reduce((total, hadir) => total + parseInt(hadir.total_hadir || 0), 0); // Hitung total hadir

            return {
                ...siswa,
                kelas: `${siswa.kelas} ${siswa.nama_rombel}`, // Gabungkan kelas dan rombel
                total_hadir_perkelas: totalHadir // Tambahkan total hadir langsung
            };
        });
        

        const totalSemuaSiswa = combinedData.reduce((total, item) => total + item.total_siswa, 0);
        const totalSemuaRombel = new Set(
            siswaData.map((item) => `${item.kelas} ${item.nama_rombel}`)
        ).size;
        
        res.status(200).json({
            Status: 200,
            message: "ok",
            totalSemuaSiswa,
            totalSemuaRombel,
            totalSemuaGuru: totalSemuaGuru.total_guru, // Tambahkan total guru
            tanggal: formattedDate, // Tanggal hari ini
            data: combinedData
        });
    } catch (error) {
        console.error("Database query failed:", error.message);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});



router.get('/absensi-siswa', async (req, res) => {
    try {
        // Query untuk mengambil data absensi dengan join ke tabel siswa
        const absensiData = await conn('absensi')
            .select(
                'absensi.id_absen',  // ID absensi
                'absensi.tanggal',     // Tanggal absensi
                'absensi.keterangan',  // Keterangan absensi
                'siswa.id_siswa',      // ID siswa dari tabel siswa
                'siswa.nama_siswa',    // Nama siswa dari tabel siswa
                'siswa.id_kelas',      // ID kelas dari tabel siswa
                'kelas.kelas',         // Nama kelas dari tabel kelas
                'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
            )
            .join('siswa', 'absensi.id_siswa', 'siswa.id_siswa') // Join absensi ke siswa berdasarkan id_siswa
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas') // Join siswa ke kelas
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel') // Join siswa ke rombel_belajar
            .orderBy('absensi.tanggal', 'desc'); // Urutkan data berdasarkan tanggal absensi, terbaru ke lama

        // Cek apakah data ditemukan
        if (absensiData && absensiData.length > 0) {
            res.status(200).json({
                Status: 200,
                message: "ok",
                totalAbsensi: absensiData.length, // Total jumlah data absensi
                data: absensiData
            });
        } else {
            res.status(200).json({
                Status: 200,
                message: "No absensi data found",
                data: []
            });
        }
    } catch (error) {
        console.error("Error fetching absensi data:", error.message);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

//home page izin(sakit, ket lain, pulang, absensi)
router.get('/nama-siswa-kelas', async (req, res) => {
    try {
        const data = await conn('siswa')
            .select(
                'siswa.id_siswa',
                'siswa.nis',
                'siswa.id_kelas',
                'siswa.id_rombel',
                'siswa.nama_siswa',
                'siswa.nomor_wali',
                'kelas.kelas', // Nama kelas dari tabel kelas
                'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
            )
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .groupBy(
                'siswa.nis',
                'siswa.id_kelas',
                'siswa.id_rombel',
                'siswa.nama_siswa',
                'siswa.nomor_wali',
                'kelas.kelas',
                'rombel_belajar.nama_rombel'
            );

        const result = data.map(item => ({
            ...item,
            kelas: `${item.kelas} ${item.nama_rombel}` // Menggabungkan nama kelas dan nama rombel
        }));

        if (data && data.length > 0) {
            res.status(200).json({
                Status: 200,
                message: "ok",
                data: result
            });
        } else {
            res.status(200).json({
                Status: 200,
                message: "No data found",
                data: []
            });
        }
    } catch (error) {
        console.error("Database query failed:", error.message);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

//Halaman Rombel yang ada di masterdata siswa
router.get('/rombel-siswa', async (req, res) => {
    try {
        const data = await conn('siswa')
            .select(
                'siswa.id_tahun_pelajaran',
                'siswa.id_kelas',
                'siswa.id_rombel',
                'tahun_ajaran.tahun',
                'kelas.kelas', // Nama kelas dari tabel kelas
                'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
            )
            .count('* as total_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .leftJoin('tahun_ajaran', 'siswa.id_tahun_pelajaran', 'tahun_ajaran.id_tahun_pelajaran')
            .groupBy('siswa.id_kelas', 'siswa.id_rombel','kelas.kelas', 'rombel_belajar.nama_rombel');

            const guruData = await conn('guru')
            .select('id_guru', 'nama_guru'); // Sesuaikan dengan kolom di tabel guru


        const result = data.map(item => ({
            ...item,
            kelas: `${item.kelas} ${item.nama_rombel}` // Menggabungkan nama kelas dan nama rombel
        }));

        if (data && data.length > 0) {
            res.status(200).json({
                Status: 200,
                message: "ok",
                // dataGuru:guruData,
                data: result,
                
            });
        } else {
            res.status(200).json({
                Status: 200,
                message: "No data found",
                data: []
            });
        }
    } catch (error) {
        console.error("Database query failed:", error.message);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;