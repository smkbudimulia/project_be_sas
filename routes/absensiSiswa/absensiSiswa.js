const express = require('express');
const router = express.Router();
const conn = require('../../Database/ConfigDB'); // koneksi ke database
const moment = require('moment'); 


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

// Route untuk absensi siswa
// router.post('/siswa-abseni', async (req, res) => {
//     try {
//         const { id_siswa } = req.body;

//         if (!id_siswa) {
//             return res.status(400).json({ message: 'ID siswa wajib diisi.' });
//         }

//         // Ambil nama siswa berdasarkan ID siswa
//         const siswa = await conn('siswa')
//             .select('nama_siswa')
//             .where({ id_siswa })
//             .first();

//         if (!siswa) {
//             return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
//         }

//         let nama_siswa = siswa.nama_siswa;

//         // Cek apakah nama siswa memiliki lebih dari satu kata
//         const namaArray = nama_siswa.split(' ');

//         // Ambil kata kedua jika ada lebih dari satu kata
//         if (namaArray.length > 1) {
//             nama_siswa = namaArray[1];
//         } else {
//             nama_siswa = namaArray[0];  // Jika hanya ada satu kata, tetap gunakan nama lengkap
//         }

//         const currentTime = moment(); // Waktu sekarang
//         const currentDate = currentTime.format("YYYY-MM-DD"); // Tanggal saat ini
//         const hariSekarang = moment().locale('id').format('dddd'); // Hari saat ini

//         // Ambil aturan dari tabel setting berdasarkan hari saat ini
//         const settings = await conn('setting').where({ hari: hariSekarang }).first();

//         if (!settings) {
//             return res.status(400).json({
//                 message:` Aturan untuk hari ${hariSekarang} tidak ditemukan. Silakan tambahkan pengaturan terlebih dahulu.`,
//             });
//         }

//         // Parsing aturan waktu dari database
//         const jamMasukArray = JSON.parse(settings.jam_masuk || '[]');
//         const jamTerlambatArray = JSON.parse(settings.jam_terlambat || '[]');
//         const jamPulangArray = JSON.parse(settings.jam_pulang || '[]');

//         if (jamMasukArray.length < 2 || jamTerlambatArray.length < 2 || jamPulangArray.length < 2) {
//             return res.status(400).json({
//                 message: 'Format jam masuk, terlambat, atau pulang tidak valid.',
//             });
//         }

//         const [jamMasukAwal, jamMasukAkhir] = jamMasukArray;
//         const [jamTerlambatAwal, jamTerlambatAkhir] = jamTerlambatArray;
//         const [jamPulangAwal, jamPulangAkhir] = jamPulangArray;

//         // Ambil data absensi siswa untuk hari ini
//         const absensiHariIni = await conn('absensi')
//             .where({ id_siswa, tanggal: currentDate })
//             .first();

//         let keterangan = '';
//         let waktuDatang = null;
//         let waktuPulang = null;

//         // Jika tidak ada catatan absensi sebelumnya
//         if (!absensiHariIni) {
//             // Cek apakah siswa hadir dalam kategori jam masuk, terlambat, atau alpa
//             if (currentTime.isBetween(moment(jamMasukAwal, "HH:mm"), moment(jamMasukAkhir, "HH:mm"), null, '[)')) {
//                 keterangan = 'Datang';
//                 waktuDatang = currentTime.format("HH:mm");
//             } else if (currentTime.isBetween(moment(jamTerlambatAwal, "HH:mm"), moment(jamTerlambatAkhir, "HH:mm"), null, '[)')) {
//                 keterangan = 'Terlambat';
//                 waktuDatang = currentTime.format("HH:mm");
//             } else if (currentTime.isBetween(moment(jamTerlambatAkhir, "HH:mm"), moment(jamPulangAwal, "HH:mm"), null, '[)')) {
//                 keterangan = 'Alpa';
//                 waktuDatang = currentTime.format("HH:mm"); // Gunakan waktu saat ini jika status "Alpa"
//             } else {
//                 // Jika sudah melewati jam pulang, atau jika belum ada absensi sama sekali
//                 if (currentTime.isAfter(moment(jamPulangAkhir, "HH:mm"))) {
//                     keterangan = 'Alpa'; // Status menjadi Alpa jika sudah melewati jam pulang
//                     waktuDatang = currentTime.format("HH:mm");
//                 } else {
//                     return res.status(400).json({ message: 'Anda tidak hadir pada waktu yang valid.' });
//                 }
//             }

//             // Simpan data absensi datang
//             const idAcak = generateRandomString(5); // Buat ID unik
//             const dataAbsensi = {
//                 id_absen: idAcak,
//                 id_siswa,
//                 datang: waktuDatang,
//                 keterangan,
//                 tanggal: currentDate,
//             };

//             await conn('absensi').insert(dataAbsensi);
//             return res.status(201).json({ message: ` ${nama_siswa} Hadir`, data: dataAbsensi });
//         }

//         // Jika ada catatan datang sebelumnya, perbarui dengan waktu pulang
//         if (absensiHariIni.datang) {
//             // Pastikan waktu pulang valid (dalam rentang jam pulang yang telah ditentukan)
//             if (currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
//                 waktuPulang = currentTime.format("HH:mm");

//                 // Update data absensi dengan waktu pulang
//                 await conn('absensi')
//                     .where({ id_siswa, tanggal: currentDate })
//                     .update({ pulang: waktuPulang });

//                 // Ambil data lengkap setelah diperbarui
//                 const dataTerbaru = await conn('absensi')
//                     .where({ id_siswa, tanggal: currentDate })
//                     .first();

//                 return res.status(200).json({
//                     message: ` ${nama_siswa} pulang`,
//                     data: dataTerbaru,
//                 });
//             } else {
//                 return res.status(400).json({ message: 'Belum waktu pulang yang valid.' });
//             }
//         }

//         return res.status(400).json({ message: 'Terjadi kesalahan yang tidak terduga.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
//     }
// });

router.post('/siswa-abseni', async (req, res) => {
    try {
        const { id_siswa } = req.body;

        if (!id_siswa) {
            return res.status(400).json({ message: 'ID siswa wajib diisi.' });
        }

        // Ambil nama siswa berdasarkan ID siswa
        const siswa = await conn('siswa')
            .select('nama_siswa')
            .where({ id_siswa })
            .first();

        if (!siswa) {
            return res.status(404).json({ message: 'Siswa tidak ditemukan.' });
        }

        let nama_siswa = siswa.nama_siswa;
        const namaArray = nama_siswa.split(' ');

        if (namaArray.length > 1) {
            nama_siswa = namaArray[1];
        } else {
            nama_siswa = namaArray[0];
        }

        const currentTime = moment();
        const currentDate = currentTime.format("YYYY-MM-DD");
        const hariSekarang = moment().locale('id').format('dddd');

        const settings = await conn('setting').where({ hari: hariSekarang }).first();
        if (!settings) {
            return res.status(400).json({
                message: `Aturan untuk hari ${hariSekarang} tidak ditemukan. Silakan tambahkan pengaturan terlebih dahulu.`,
            });
        }

        const jamMasukArray = JSON.parse(settings.jam_masuk || '[]');
        const jamTerlambatArray = JSON.parse(settings.jam_terlambat || '[]');
        const jamPulangArray = JSON.parse(settings.jam_pulang || '[]');

        if (jamMasukArray.length < 2 || jamTerlambatArray.length < 2 || jamPulangArray.length < 2) {
            return res.status(400).json({
                message: 'Format jam masuk, terlambat, atau pulang tidak valid.',
            });
        }

        const [jamMasukAwal, jamMasukAkhir] = jamMasukArray;
        const [jamTerlambatAwal, jamTerlambatAkhir] = jamTerlambatArray;
        const [jamPulangAwal, jamPulangAkhir] = jamPulangArray;

        const absensiHariIni = await conn('absensi')
            .where({ id_siswa, tanggal: currentDate })
            .first();

        let keterangan = '';
        let waktuDatang = null;
        let waktuPulang = null;

        // Jika siswa sudah absen pulang
        if (absensiHariIni && absensiHariIni.pulang) {
            return res.status(400).json({
                message: `${nama_siswa} sudah pulang.`,
            });
        }

        // Jika sudah absen datang dan belum waktunya pulang
        if (absensiHariIni && absensiHariIni.datang && !absensiHariIni.pulang) {
            if (!currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
                return res.status(400).json({
                    message: 'Belum waktu pulang.',
                });
            }
        }

        // Jika tidak ada catatan absensi sebelumnya
        if (!absensiHariIni) {
            // Validasi tambahan jika mencoba absen di jam pulang tanpa absen datang
            if (currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
                // Catat siswa sebagai Alpa
                const idAcak = generateRandomString(5);
                const dataAbsensi = {
                    id_absen: idAcak,
                    id_siswa,
                    keterangan: 'Alpa',
                    tanggal: currentDate,
                    datang: null, // Tidak ada waktu datang
                    pulang: null, // Tidak ada waktu pulang
                };
        
                await conn('absensi').insert(dataAbsensi);
        
                return res.status(400).json({
                    message: 'Kamu belum absen datang dan tercatat sebagai Alpa.',
                    data: dataAbsensi,
                });
            }
            if (currentTime.isBetween(moment(jamMasukAwal, "HH:mm"), moment(jamTerlambatAwal, "HH:mm"), null, '[)')) {
                keterangan = 'Datang';
                waktuDatang = currentTime.format("HH:mm");
            } else if (currentTime.isBetween(moment(jamTerlambatAwal, "HH:mm"), moment(jamPulangAwal, "HH:mm"), null, '[)')) {
                keterangan = 'Terlambat';
                waktuDatang = currentTime.format("HH:mm");
            // } else if (currentTime.isBetween(moment(jamTerlambatAkhir, "HH:mm"), moment(jamPulangAwal, "HH:mm"), null, '[)')) {
            //     keterangan = 'Alpa';
            //     waktuDatang = currentTime.format("HH:mm");
            } else {
                if (currentTime.isAfter(moment(jamPulangAkhir, "HH:mm"))) {
                    return res.status(200).json({
                        message: 'Maaf, Pembelajaran hari ini telah selesai :).',
                    });
                }
            }

            const idAcak = generateRandomString(5);
            const dataAbsensi = {
                id_absen: idAcak,
                id_siswa,
                keterangan,  
                tanggal: currentDate,
                datang: currentDate,
            };

            await conn('absensi').insert(dataAbsensi);
            const message =
                keterangan === 'Terlambat'
                    ? `${nama_siswa} Terlambat`
                    : `${nama_siswa} Hadir`;

            return res.status(201).json({ message, data: dataAbsensi });
        }

        if (absensiHariIni.datang) {
            if (currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
                waktuPulang = currentTime.format("HH:mm");
                await conn('absensi')
                    .where({ id_siswa, tanggal: currentDate })
                    .update({ pulang: waktuPulang });

                const dataTerbaru = await conn('absensi')
                    .where({ id_siswa, tanggal: currentDate })
                    .first();

                return res.status(200).json({
                    message: `${nama_siswa} Pulang`,
                    data: dataTerbaru,
                });
            } else {
                return res.status(400).json({ message: 'Belum Waktu Pulang.' });
            }
        }

        return res.status(400).json({ message: 'Terjadi kesalahan yang tidak terduga.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
    }
});


router.get('/all-absensi', async (req, res) => {
    try {
        // Query untuk total hadir dan terlambat per siswa
        const totalHadirDanTerlambatQuery = conn('absensi')
            .select(
                'siswa.id_siswa',
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Datang" THEN 1 END) AS total_hadir'), // Total Hadir
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Terlambat" THEN 1 END) AS total_terlambat'), // Total Terlambat
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Alpa" THEN 1 END) AS total_alpa') // Total Alpa
            )
            .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
            .groupBy('siswa.id_siswa');

        // Query untuk detail absensi per siswa dan tanggal
        const detailAbsensiQuery = conn('absensi')
            .select(
                'absensi.id_absen',
                'absensi.tanggal',
                'absensi.keterangan',
                'siswa.id_siswa',
                'siswa.nama_siswa',
                'kelas.kelas',
                'rombel_belajar.nama_rombel'
            )
            .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel');


        // Eksekusi kedua query secara paralel
        const [totalHadirDanTerlambatData, detailAbsensiData] = await Promise.all([
            totalHadirDanTerlambatQuery,
            detailAbsensiQuery
        ]);

        // Gabungkan hasil berdasarkan id_siswa
        const mergedData = detailAbsensiData.map((absensi) => {
            const totals = totalHadirDanTerlambatData.find((item) => item.id_siswa === absensi.id_siswa);
            // Gabungkan data absensi dengan total hadir dan terlambat
            return {
                id_siswa: absensi.id_siswa,
                nama_siswa: absensi.nama_siswa,
                kelas: absensi.kelas,
                nama_rombel: absensi.nama_rombel,
                tanggal: absensi.tanggal,
                keterangan: absensi.keterangan,
                total_hadir: totals ? totals.total_hadir : 0, // Tambahkan total hadir
                total_terlambat: totals ? totals.total_terlambat : 0, // Tambahkan total terlambat
                total_alpa: totals ? totals.total_alpa : 0
            };
        });
        const result = mergedData.map(item => ({
            ...item,
            kelas: `${item.kelas} ${item.nama_rombel}` // Menggabungkan nama kelas dan nama rombel
        }));

        // Kirimkan data tanpa duplikasi
        res.status(200).json({
            Status: 200,
            message: "ok",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

router.get('/total-hadir-per-kelas-per-hari', async (req, res) => {
    try {
        // Query untuk total hadir per kelas per hari
        const totalHadirPerKelasPerHariQuery = conn('absensi')
            .select(
                'kelas.kelas',
                'rombel_belajar.nama_rombel',
                'absensi.tanggal',
                conn.raw('COUNT(CASE WHEN absensi.keterangan = "Datang" THEN 1 END) AS total_hadir') // Menghitung total hadir
            )
            .leftJoin('siswa', 'absensi.id_siswa', 'siswa.id_siswa')
            .leftJoin('kelas', 'siswa.id_kelas', 'kelas.id_kelas')
            .leftJoin('rombel_belajar', 'siswa.id_rombel', 'rombel_belajar.id_rombel')
            .groupBy('kelas.kelas', 'rombel_belajar.nama_rombel', 'absensi.tanggal')
            .orderBy('absensi.tanggal', 'asc'); // Urutkan berdasarkan tanggal

        // Eksekusi query
        const totalHadirPerKelasPerHariData = await totalHadirPerKelasPerHariQuery;

        // Kelompokkan data berdasarkan kelas dan nama rombel
        const groupedData = totalHadirPerKelasPerHariData.reduce((acc, curr) => {
            // Kombinasikan kelas dan rombel sebagai key grup
            const key = `${curr.kelas}-${curr.nama_rombel}`;

            // Jika grup belum ada, buat objek baru
            if (!acc[key]) {
                acc[key] = {
                    kelas: curr.kelas,
                    nama_rombel: curr.nama_rombel,
                    hadir_per_hari: [] // Menyimpan hadir per hari
                };
            }

            // Tambahkan data total hadir per tanggal ke dalam grup
            acc[key].hadir_per_hari.push({
                tanggal: curr.tanggal,
                total_hadir: curr.total_hadir
            });

            return acc;
        }, {});

        // Mengubah objek ke dalam bentuk array
        const result = Object.values(groupedData);

        // Kirimkan data
        res.status(200).json({
            Status: 200,
            message: "ok",
            data: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            Status: 500,
            error: 'Internal Server Error'
        });
    }
});

router.post('/add-siswa-absensi-sakit', async (req, res) => {
    try {
        const { id_siswa, keterangan } = req.body;

        if (!id_siswa) {
            return res.status(400).json({ message: 'ID siswa wajib diisi.' });
        }

        if (keterangan !== 'Sakit') {
            return res.status(400).json({ message: 'Keterangan harus "Sakit".' });
        }

        const currentTime = moment(); // Waktu sekarang
        const currentDate = currentTime.format("YYYY-MM-DD"); // Tanggal saat ini

        // Ambil data absensi siswa untuk hari ini
        const absensiHariIni = await conn('absensi')
            .where({ id_siswa, tanggal: currentDate })
            .first();

        // Jika tidak ada catatan absensi sebelumnya, catat "Sakit"
        if (!absensiHariIni) {
            const idAcak = generateRandomString(5); // Buat ID unik
            const dataAbsensi = {
                id_absen: idAcak,
                id_siswa,
                keterangan: "Sakit",  // Status "Sakit"
                tanggal: currentDate,
                datang: currentDate,
            };

            await conn('absensi').insert(dataAbsensi);
            return res.status(201).json({ message: 'Absensi sakit berhasil dicatat', data: dataAbsensi });
        } else {
            return res.status(400).json({ message: 'Absensi sudah tercatat untuk hari ini.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
    }
});

router.get('/all-siswa-absensi-sakit', async (req, res) => {
    try {
        // Ambil semua data absensi dengan keterangan "Sakit"
        const absensiSakit = await conn('absensi')
            .where({ keterangan: 'Sakit' })
            .select('id_absen', 'id_siswa', 'tanggal', 'keterangan');

        // Periksa apakah ada data yang ditemukan
        if (absensiSakit.length === 0) {
            return res.status(404).json({ message: 'Tidak ada data absensi dengan status "Sakit".' });
        }

        return res.status(200).json({ 
            message: 'Data absensi dengan status "Sakit" berhasil diambil.', 
            data: absensiSakit 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
    }
});

router.post('/add-siswa-absensi-izin', async (req, res) => {
    try {
        const { id_siswa, keterangan } = req.body;

        if (!id_siswa) {
            return res.status(400).json({ message: 'ID siswa wajib diisi.' });
        }

        if (keterangan !== 'Izin') {
            return res.status(400).json({ message: 'Keterangan harus "Izin".' });
        }

        const currentTime = moment(); // Waktu sekarang
        const currentDate = currentTime.format("YYYY-MM-DD"); // Tanggal saat ini

        // Ambil data absensi siswa untuk hari ini
        const absensiHariIni = await conn('absensi')
            .where({ id_siswa, tanggal: currentDate })
            .first();

        // Jika tidak ada catatan absensi sebelumnya, catat "Izin"
        if (!absensiHariIni) {
            const idAcak = generateRandomString(5); // Buat ID unik
            const dataAbsensi = {
                id_absen: idAcak,
                id_siswa,
                keterangan: "Izin",  // Status "Izin"
                tanggal: currentDate,
                datang: currentDate,
            };

            await conn('absensi').insert(dataAbsensi);
            return res.status(201).json({ message: 'Absensi izin berhasil dicatat', data: dataAbsensi });
        } else {
            return res.status(400).json({ message: 'Absensi sudah tercatat untuk hari ini.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error });
    }
});


// router untuk mengatasi sakit di halaman utama
// Rute yang benar adalah '/sakit'
// Endpoint POST untuk menerima data absensi sakit

  


module.exports = router;
