const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB')// koneksi ke database
// const bcrypt = require('bcrypt')
const verifyToken = require('../../middleware/jwToken')

// router.get('/total-kelas-siswa', async (req, res) => {
//     try {
//         // Mendapatkan tanggal sesuai waktu komputer server
//         const today = new Date();
//         const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

//         // Query untuk data siswa
//         const siswaData = await conn('siswa')
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

//         // Query untuk total hadir per kelas pada hari ini
//         const totalHadirData = await conn('absensi')
//             .select(
//                 'kelas.kelas',
//                 'rombel_belajar.nama_rombel',
//                 conn.raw('COUNT(CASE WHEN absensi.keterangan = "Datang" THEN 1 END) AS total_hadir'),
//                 conn.raw('COUNT(CASE WHEN absensi.keterangan = "Terlambat" THEN 1 END) AS total_terlambat'), // Menambahkan hitungan untuk "Terlambat"
//                 conn.raw('COUNT(CASE WHEN absensi.keterangan = "Alpa" THEN 1 END) AS total_alpa'),
//                 conn.raw('COUNT(CASE WHEN absensi.keterangan = "Sakit" THEN 1 END) AS total_sakit'),
//                 conn.raw('COUNT(CASE WHEN absensi.keterangan = "Izin" THEN 1 END) AS total_izin'),
//                 // conn.raw('COUNT(CASE WHEN absensi.pulang IS NOT NULL THEN 1 END) AS total_pulang')
//             )
//             .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
//             .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
//             .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
//             .where('absensi.tanggal', formattedDate) // Filter hanya untuk tanggal hari ini
//             .groupBy('kelas.kelas', 'rombel_belajar.nama_rombel');

//         // Query untuk total semua guru
//         const totalSemuaGuru = await conn('guru').count('* as total_guru').first();

//         // Gabungkan data siswa dan total hadir
//         const combinedData = siswaData.map((siswa) => {
//             const totalHadir = totalHadirData
//                 .filter(
//                     (hadir) =>
//                         hadir.kelas === siswa.kelas &&
//                         hadir.nama_rombel === siswa.nama_rombel
//                 )
//                 .reduce((total, hadir) => total + parseInt(hadir.total_hadir || 0), 0); // Hitung total hadir
//                 const totalizin = totalHadirData
//                 .filter(
//                     (hadir) =>
//                         hadir.kelas === siswa.kelas &&
//                         hadir.nama_rombel === siswa.nama_rombel
//                 )
//                 .reduce((total, hadir) => total + parseInt(hadir.total_izin || 0), 0); // Hitung total hadir
//                 const totalTerlambat = totalHadirData
//                 .filter(
//                     (terlambat) =>
//                         terlambat.kelas === siswa.kelas &&
//                         terlambat.nama_rombel === siswa.nama_rombel
//                 )
//                 .reduce((total, terlambat) => total + parseInt(terlambat.total_terlambat || 0), 0);
//                  // Hitung total alpa
//                  const totalalpa = totalHadirData
//                  .filter(
//                      (alpa) =>
//                          alpa.kelas === siswa.kelas &&
//                          alpa.nama_rombel === siswa.nama_rombel
//                  )
//                  .reduce((total, alpa) => total + parseInt(alpa.total_alpa || 0), 0);
//                  const totalsakit = totalHadirData
//                  .filter(
//                      (sakit) =>
//                          sakit.kelas === siswa.kelas &&
//                          sakit.nama_rombel === siswa.nama_rombel
//                  )
//                  .reduce((total, sakit) => total + parseInt(sakit.total_sakit || 0), 0);
                 
//             return {
//                 ...siswa,
//                 kelas: `${siswa.kelas} ${siswa.nama_rombel}`, // Gabungkan kelas dan rombel
//                 total_hadir_perkelas: totalHadir, // Tambahkan total hadir langsung
//                 total_terlambat_perkelas: totalTerlambat, // Tambahkan total terlambat
//                 total_alpa_perkelas: totalalpa, 
//                 total_sakit_perkelas: totalsakit,
//                 total_izin_perkelas: totalizin,
//             };
//         });
        

//         const totalSemuaSiswa = combinedData.reduce((total, item) => total + item.total_siswa, 0);
//         const totalSemuaRombel = new Set(
//             siswaData.map((item) => `${item.kelas} ${item.nama_rombel}`)
//         ).size;

//         // Hitung total keseluruhan hadir, terlambat, alpa, sakit, dan izin
//         const totalKeseluruhan = combinedData.reduce(
//             (acc, item) => {
//                 acc.total_hadir += item.total_hadir_perkelas + item.total_terlambat_perkelas;
//                 acc.total_terlambat += item.total_terlambat_perkelas;
//                 acc.total_alpa += item.total_alpa_perkelas;
//                 acc.total_sakit += item.total_sakit_perkelas;
//                 acc.total_izin += item.total_izin_perkelas;
//                 return acc;
//             },
//             { total_hadir: 0, total_terlambat: 0, total_alpa: 0, total_sakit: 0, total_izin: 0 }
//         );

//         // Menjumlahkan semua kategori
//         const totalSemuaKategori = 
//         totalKeseluruhan.total_hadir +
//         totalKeseluruhan.total_alpa +
//         totalKeseluruhan.total_sakit +
//         totalKeseluruhan.total_izin;
        
//         res.status(200).json({
//             Status: 200,
//             message: "ok",
//             totalSemuaSiswa,
//             totalSemuaRombel,
//             totalSemuaGuru: totalSemuaGuru.total_guru, // Tambahkan total guru
//             totalKeseluruhan,
//             totalSemuaKategori,
//             tanggal: formattedDate, // Tanggal hari ini
//             data: combinedData
//         });
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
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const siswaData = await conn('siswa')
            .select(
                'siswa.id_kelas',
                'siswa.id_rombel',
                'kelas.kelas',
                'rombel_belajar.nama_rombel'
            )
            .count('* as total_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .groupBy('siswa.id_kelas', 'siswa.id_rombel', 'kelas.kelas', 'rombel_belajar.nama_rombel');

        const totalHadirData = await conn('absensi')
            .select(
                'kelas.kelas',
                'rombel_belajar.nama_rombel',
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Datang" THEN 1 END) AS total_hadir'),
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Terlambat" THEN 1 END) AS total_terlambat'),
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Alpa" THEN 1 END) AS total_alpa'),
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Sakit" THEN 1 END) AS total_sakit'),
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Izin" THEN 1 END) AS total_izin'),
                conn.raw('COUNT(CASE WHEN absensi.pulang IS NOT NULL THEN 1 END) AS total_pulang')
            )
            .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .where('absensi.tanggal', formattedDate)
            .groupBy('kelas.kelas', 'rombel_belajar.nama_rombel');

        const totalSemuaGuru = await conn('guru').count('* as total_guru').first();

        const combinedData = siswaData.map((siswa) => {
            const matchedData = totalHadirData.find(
                (hadir) => hadir.kelas === siswa.kelas && hadir.nama_rombel === siswa.nama_rombel
            ) || {};

            return {
                ...siswa,
                kelas: `${siswa.kelas} ${siswa.nama_rombel}`,
                total_hadir_perkelas: parseInt(matchedData.total_hadir || 0),
                total_terlambat_perkelas: parseInt(matchedData.total_terlambat || 0),
                total_alpa_perkelas: parseInt(matchedData.total_alpa || 0),
                total_sakit_perkelas: parseInt(matchedData.total_sakit || 0),
                total_izin_perkelas: parseInt(matchedData.total_izin || 0),
                total_pulang_perkelas: parseInt(matchedData.total_pulang || 0),
            };
        });

        const totalKeseluruhan = combinedData.reduce(
            (acc, item) => {
                acc.total_hadir += item.total_hadir_perkelas + item.total_terlambat_perkelas;
                acc.total_terlambat += item.total_terlambat_perkelas;
                acc.total_alpa += item.total_alpa_perkelas;
                acc.total_sakit += item.total_sakit_perkelas;
                acc.total_izin += item.total_izin_perkelas;
                acc.total_pulang += item.total_pulang_perkelas;
                return acc;
            },
            { total_hadir: 0, total_terlambat: 0, total_alpa: 0, total_sakit: 0, total_izin: 0, total_pulang: 0 }
        );

        res.status(200).json({
            Status: 200,
            message: "ok",
            totalSemuaSiswa: combinedData.reduce((total, item) => total + item.total_siswa, 0),
            totalSemuaRombel: new Set(siswaData.map((item) => `${item.kelas} ${item.nama_rombel}`)).size,
            totalSemuaGuru: totalSemuaGuru.total_guru,
            totalKeseluruhan,
            totalSemuaKategori: totalKeseluruhan.total_hadir + totalKeseluruhan.total_alpa + totalKeseluruhan.total_sakit + totalKeseluruhan.total_izin,
            tanggal: formattedDate,
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
router.get('/nama-siswa-kelas', async (req, res) => {
    try {
        // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
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
            .leftJoin('absensi', function() {
                this.on('siswa.id_siswa', '=', 'absensi.id_siswa')
                    .andOn('absensi.tanggal', '=', conn.raw('?', [today])); // Hanya cek untuk hari ini
            })
            .whereNull('absensi.id_absen') // Hanya ambil siswa yang belum absen hari ini
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

router.get('/nama-siswa', async (req, res) => {
    try {
        // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
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
//home page izin(sakit, ket lain, pulang, absensi)
// router.get('/nama-siswa-kelas', async (req, res) => {
//     try {
//         const data = await conn('siswa')
//             .select(
//                 'siswa.id_siswa',
//                 'siswa.nis',
//                 'siswa.id_kelas',
//                 'siswa.id_rombel',
//                 'siswa.nama_siswa',
//                 'siswa.nomor_wali',
//                 'kelas.kelas', // Nama kelas dari tabel kelas
//                 'rombel_belajar.nama_rombel' // Nama rombel dari tabel rombel_belajar
//             )
//             .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
//             .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
//             .groupBy(
//                 'siswa.nis',
//                 'siswa.id_kelas',
//                 'siswa.id_rombel',
//                 'siswa.nama_siswa',
//                 'siswa.nomor_wali',
//                 'kelas.kelas',
//                 'rombel_belajar.nama_rombel'
//             );

//         const result = data.map(item => ({
//             ...item,
//             kelas: `${item.kelas} ${item.nama_rombel}` // Menggabungkan nama kelas dan nama rombel
//         }));

//         if (data && data.length > 0) {
//             res.status(200).json({
//                 Status: 200,
//                 message: "ok",
//                 data: result
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