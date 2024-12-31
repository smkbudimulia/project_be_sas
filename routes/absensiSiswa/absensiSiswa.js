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
//         const { id_siswa, datang, pulang } = req.body;
//         const idAcak = generateRandomString(5);

//         // Dapatkan hari saat ini
//         const hariSekarang = moment().locale('id').format('dddd');

//         // Ambil aturan dari tabel setting berdasarkan hari saat ini
//         const settings = await conn('setting').where({ hari: hariSekarang }).first();

//         if (!settings) {
//             return res.status(400).json({
//                 message: `Aturan untuk hari ${hariSekarang} tidak ditemukan. Silakan tambahkan pengaturan terlebih dahulu.`,
//             });
//         }

//         // Parsing data waktu dari pengaturan
//         const [jamMasukAwal, jamMasukAkhir] = JSON.parse(settings.jam_masuk);
//         const [jamTerlambatAwal, jamTerlambatAkhir] = JSON.parse(settings.jam_terlambat);
//         const [jamPulangAwal, jamPulangAkhir] = JSON.parse(settings.jam_pulang);

//         // Validasi waktu datang
//         const datangTime = moment(datang, "HH:mm");
//         let keterangan = '';

//         if (datangTime.isBetween(moment(jamMasukAwal, "HH:mm"), moment(jamMasukAkhir, "HH:mm"), null, '[)')) {
//             keterangan = 'Datang';
//         } else if (datangTime.isBetween(moment(jamTerlambatAwal, "HH:mm"), moment(jamTerlambatAkhir, "HH:mm"), null, '[)')) {
//             keterangan = 'Terlambat';
//         } else if (datangTime.isAfter(moment(jamTerlambatAkhir, "HH:mm"))) {
//             keterangan = 'Alpa';
//         }
//         const tanggalAbsen = moment().format('DD:MM:YYYY'); // Format tanggal dd:mm:yyyy
//         // Validasi waktu pulang jika diberikan
//         if (pulang) {
//             const pulangTime = moment(pulang, "HH:mm");
//             if (!pulangTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
//                 return res.status(400).json({
//                     message: `Waktu pulang tidak valid. Harus antara ${jamPulangAwal} - ${jamPulangAkhir}.`,
//                 });
//             }

//             // Update data absensi jika pulang valid
//             await conn('absensi')
//                 .where({ id_siswa })
//                 .update({ pulang: pulangTime.format("HH:mm") });

//             return res.status(200).json({
//                 message: 'Absen pulang berhasil.',
//             });
//         }

//         // Tambahkan data absensi baru
//         const addData = {
//             id_absen: idAcak,
//             id_siswa,
//             datang: datangTime.format("HH:mm"),
//             tanggal: tanggalAbsen,
//             keterangan,
//         };

//         await conn('absensi').insert(addData);

//         return res.status(201).json({
//             message: 'Absen berhasil ditambahkan.',
//             data: addData,
//         });

//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({
//             message: 'Terjadi kesalahan pada server.',
//             error,
//         });
//     }
// });

// router.post('/siswa-abseni', async (req, res) => {
//     try {
//         const { id_siswa } = req.body;
//         const currentTime = moment(); // Waktu sekarang
//         const currentDate = currentTime.format("YYYY-MM-DD"); // Tanggal saat ini
//         const currentHour = currentTime.hour();
//         const currentMinute = currentTime.minute();

//         // Dapatkan hari saat ini
//         const hariSekarang = moment().locale('id').format('dddd');

//         // Ambil aturan dari tabel setting berdasarkan hari saat ini
//         const settings = await conn('setting').where({ hari: hariSekarang }).first();

//         if (!settings) {
//             return res.status(400).json({
//                 message: `Aturan untuk hari ${hariSekarang} tidak ditemukan. Silakan tambahkan pengaturan terlebih dahulu.`,
//             });
//         }

//         // Parsing jam_masuk, jam_terlambat, dan jam_pulang
//         const jamMasukArray = JSON.parse(settings.jam_masuk);
//         const jamTerlambatArray = JSON.parse(settings.jam_terlambat);
//         const jamPulangArray = JSON.parse(settings.jam_pulang);

//         if (!jamMasukArray || jamMasukArray.length < 2 || !jamTerlambatArray || jamTerlambatArray.length < 2 || !jamPulangArray || jamPulangArray.length < 2) {
//             return res.status(400).json({
//                 message: 'Format jam masuk, jam terlambat, atau jam pulang tidak valid. Harus memiliki minimal dua nilai (awal dan akhir).',
//             });
//         }

//         const [jamMasukAwal, jamMasukAkhir] = jamMasukArray;
//         const [jamTerlambatAwal, jamTerlambatAkhir] = jamTerlambatArray;
//         const [jamPulangAwal, jamPulangAkhir] = jamPulangArray;

//         let keterangan = '';
//         let waktuDatang = null;
//         let waktuPulang = null;

//         // Tentukan status berdasarkan waktu komputer
//         if (currentTime.isBetween(moment(jamMasukAwal, "HH:mm"), moment(jamMasukAkhir, "HH:mm"), null, '[)')) {
//             keterangan = 'Datang';
//             waktuDatang = currentTime.format("HH:mm");
//         } else if (currentTime.isBetween(moment(jamMasukAkhir, "HH:mm"), moment(jamTerlambatAkhir, "HH:mm"), null, '[)')) {
//             keterangan = 'Terlambat';
//             waktuDatang = currentTime.format("HH:mm");
//         } else if (currentTime.isBetween(moment(jamTerlambatAkhir, "HH:mm"), moment(jamPulangAwal, "HH:mm"), null, '[)')) {
//             keterangan = 'Alpa';
//         } else if (currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
//             keterangan = 'Pulang';
//             waktuPulang = currentTime.format("HH:mm");
//         } else {
//             return res.status(400).json({ message: 'Tidak dalam waktu absensi yang valid' });
//         }

//         // Simpan ke dalam database
//         if (waktuDatang) {
//             const idAcak = generateRandomString(5); // Buat ID unik untuk absensi
//             const dataAbsensi = {
//                 id_absen: idAcak,
//                 id_siswa,
//                 datang: waktuDatang,
//                 keterangan,
//                 tanggal: currentDate, // Tambahkan tanggal
//             };

//             await conn('absensi').insert(dataAbsensi);
//             return res.status(201).json({ message: 'Absensi berhasil dicatat', data: dataAbsensi });
//         }

//         if (waktuPulang) {
//             // Update waktu pulang jika siswa sudah absen sebelumnya
//             const result = await conn('absensi')
//                 .where({ id_siswa, tanggal: currentDate })
//                 .update({ pulang: waktuPulang });

//             if (result) {
//                 return res.status(200).json({ message: 'Waktu pulang berhasil diperbarui', waktuPulang });
//             } else {
//                 return res.status(404).json({ message: 'Data absensi tidak ditemukan untuk siswa ini' });
//             }
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
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

        // Cek apakah nama siswa memiliki lebih dari satu kata
        const namaArray = nama_siswa.split(' ');

        // Ambil kata kedua jika ada lebih dari satu kata
        if (namaArray.length > 1) {
            nama_siswa = namaArray[1];
        } else {
            nama_siswa = namaArray[0];  // Jika hanya ada satu kata, tetap gunakan nama lengkap
        }

        const currentTime = moment(); // Waktu sekarang
        const currentDate = currentTime.format("YYYY-MM-DD"); // Tanggal saat ini
        const hariSekarang = moment().locale('id').format('dddd'); // Hari saat ini

        // Ambil aturan dari tabel setting berdasarkan hari saat ini
        const settings = await conn('setting').where({ hari: hariSekarang }).first();

        if (!settings) {
            return res.status(400).json({
                message: `Aturan untuk hari ${hariSekarang} tidak ditemukan. Silakan tambahkan pengaturan terlebih dahulu.`,
            });
        }

        // Parsing aturan waktu dari database
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

        // Ambil data absensi siswa untuk hari ini
        const absensiHariIni = await conn('absensi')
            .where({ id_siswa, tanggal: currentDate })
            .first();

        let keterangan = '';
        let waktuDatang = null;
        let waktuPulang = null;

        // Jika tidak ada catatan absensi sebelumnya
        if (!absensiHariIni) {
            // Cek apakah siswa hadir dalam kategori jam masuk, terlambat, atau alpa
            if (currentTime.isBetween(moment(jamMasukAwal, "HH:mm"), moment(jamMasukAkhir, "HH:mm"), null, '[)')) {
                keterangan = 'Datang';
                waktuDatang = currentTime.format("HH:mm");
            } else if (currentTime.isBetween(moment(jamTerlambatAwal, "HH:mm"), moment(jamTerlambatAkhir, "HH:mm"), null, '[)')) {
                keterangan = 'Terlambat';
                waktuDatang = currentTime.format("HH:mm");
            } else if (currentTime.isBetween(moment(jamTerlambatAkhir, "HH:mm"), moment(jamPulangAwal, "HH:mm"), null, '[)')) {
                keterangan = 'Alpa';
                waktuDatang = currentTime.format("HH:mm"); // Gunakan waktu saat ini jika status "Alpa"
            } else {
                // Jika sudah melewati jam pulang, atau jika belum ada absensi sama sekali
                if (currentTime.isAfter(moment(jamPulangAkhir, "HH:mm"))) {
                    keterangan = 'Alpa'; // Status menjadi Alpa jika sudah melewati jam pulang
                    waktuDatang = currentTime.format("HH:mm");
                } else {
                    return res.status(400).json({ message: 'Anda tidak hadir pada waktu yang valid.' });
                }
            }

            // Simpan data absensi datang
            const idAcak = generateRandomString(5); // Buat ID unik
            const dataAbsensi = {
                id_absen: idAcak,
                id_siswa,
                datang: waktuDatang,
                keterangan,
                tanggal: currentDate,
            };

            await conn('absensi').insert(dataAbsensi);
            return res.status(201).json({ message: ` ${nama_siswa} absen`, data: dataAbsensi });
        }

        // Jika ada catatan datang sebelumnya, perbarui dengan waktu pulang
        if (absensiHariIni.datang) {
            // Pastikan waktu pulang valid (dalam rentang jam pulang yang telah ditentukan)
            if (currentTime.isBetween(moment(jamPulangAwal, "HH:mm"), moment(jamPulangAkhir, "HH:mm"), null, '[)')) {
                waktuPulang = currentTime.format("HH:mm");

                // Update data absensi dengan waktu pulang
                await conn('absensi')
                    .where({ id_siswa, tanggal: currentDate })
                    .update({ pulang: waktuPulang });

                // Ambil data lengkap setelah diperbarui
                const dataTerbaru = await conn('absensi')
                    .where({ id_siswa, tanggal: currentDate })
                    .first();

                return res.status(200).json({
                    message: ` ${nama_siswa} pulang`,
                    data: dataTerbaru,
                });
            } else {
                return res.status(400).json({ message: 'Belum waktu pulang yang valid.' });
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
            data: mergedData
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

router.post('/siswa-absensi-sakit', async (req, res) => {
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
                keterangan,  // Status "Sakit"
                tanggal: currentDate,
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

router.get('/siswa-absensi-sakit', async (req, res) => {
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


// router untuk mengatasi sakit di halaman utama
// Rute yang benar adalah '/sakit'
// Endpoint POST untuk menerima data absensi sakit

  


module.exports = router;
