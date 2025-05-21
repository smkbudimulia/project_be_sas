const cron = require("node-cron");
const moment = require("moment");
const conn = require('../Database/ConfigDB'); // Koneksi database Anda

// Fungsi untuk menghasilkan ID acak
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};



// cron.schedule("09 09 * * *", async () => {
//     try {
//         const currentDate = moment().format("YYYY-MM-DD");
//         const isFilterActive = await fetchToggleStatus();

//         let query = conn("siswa")
//             .leftJoin("absensi", function () {
//                 this.on("siswa.id_siswa", "=", "absensi.id_siswa").andOn(
//                     "absensi.tanggal",
//                     "=",
//                     conn.raw("?", [currentDate])
//                 );
//             })
//             .whereNull("absensi.id_siswa"); // Siswa yang belum absen

//         if (isFilterActive) {
//             query = query.whereNotIn("siswa.id_kelas", ["OvEcx", "eAv0S"]);
//         }

//         const siswaBelumAbsen = await query.select("siswa.id_siswa");

//         if (siswaBelumAbsen.length > 0) {
//             const dataAlpa = siswaBelumAbsen.map((siswa) => ({
//                 id_absen: generateRandomString(5),
//                 id_siswa: siswa.id_siswa,
//                 keterangan: "Alpa",
//                 tanggal: currentDate,
//                 datang: null,
//                 pulang: null,
//             }));

//             await conn("absensi").insert(dataAlpa);
//             console.log(`${siswaBelumAbsen.length} siswa otomatis ditandai Alpa.`);
//         } else {
//             console.log("Semua siswa sudah absen sebelum jam 12 siang.");
//         }
//     } catch (error) {
//         console.error("Gagal menjalankan cron job:", error);
//     }
// });

cron.schedule("10 10 * * *", async () => {
    try {
        const currentDate = moment().format("YYYY-MM-DD");

        // Ambil kelas & rombel PKL dari config_pkl
        const kelasPkl = await conn("config_pkl").select("id_kelas", "id_rombel");

        // Ambil semua siswa yang belum absen
        const siswaBelumAbsen = await conn("siswa")
            .leftJoin("absensi", function () {
                this.on("siswa.id_siswa", "=", "absensi.id_siswa").andOn(
                    "absensi.tanggal",
                    "=",
                    conn.raw("?", [currentDate])
                );
            })
            .select("siswa.id_siswa", "siswa.id_kelas", "siswa.id_rombel")
            .whereNull("absensi.id_siswa");

        // Pisahkan siswa yang termasuk PKL
        const siswaPKL = [];
        const siswaNonPKL = [];

        siswaBelumAbsen.forEach((siswa) => {
            const isPKL = kelasPkl.some(
                (kp) => kp.id_kelas === siswa.id_kelas && kp.id_rombel === siswa.id_rombel
            );

            if (isPKL) {
                siswaPKL.push({
                    id_absen: generateRandomString(5),
                    id_siswa: siswa.id_siswa,
                    keterangan: "PKL",
                    tanggal: currentDate,
                    datang: "",
                    pulang: "",
                });
            } else {
                siswaNonPKL.push({
                    id_absen: generateRandomString(5),
                    id_siswa: siswa.id_siswa,
                    keterangan: "Alpa",
                    tanggal: currentDate,
                    datang: "",
                    pulang: "",
                });
            }
        });

        // Simpan hasil absensi
        if (siswaPKL.length > 0) {
            await conn("absensi").insert(siswaPKL);
            console.log(`${siswaPKL.length} siswa PKL otomatis ditandai PKL.`);
        }

        if (siswaNonPKL.length > 0) {
            await conn("absensi").insert(siswaNonPKL);
            console.log(`${siswaNonPKL.length} siswa non-PKL otomatis ditandai Alpa.`);
        }

        if (siswaPKL.length === 0 && siswaNonPKL.length === 0) {
            console.log("Semua siswa sudah absen sebelum jam 12 siang.");
        }
    } catch (error) {
        console.error("Gagal menjalankan cron job untuk absensi:", error);
    }
});




// Cron job berjalan setiap hari pukul 12:00 siang
// cron.schedule("48 10 * * *", async () => {
//     try {
//         const currentDate = moment().format("YYYY-MM-DD");
//         const isFilterActive = await fetchToggleStatus();

//         // Cari siswa kelas 10 & 11 yang belum memiliki keterangan Hadir/Terlambat
//         const siswaBelumAbsen = await conn("siswa")
//             .leftJoin("absensi", function () {
//                 this.on("siswa.id_siswa", "=", "absensi.id_siswa").andOn(
//                     "absensi.tanggal",
//                     "=",
//                     conn.raw("?", [currentDate])
//                 );
//             })
//             .whereNotIn("siswa.id_kelas", ["OvEcx", "eAv0S"]) // ⬅️ Hanya proses kelas 10 dan 11
//             .whereNull("absensi.id_siswa") // Siswa yang belum absen
//             .select("siswa.id_siswa");

//         if (siswaBelumAbsen.length > 0) {
//             const dataAlpa = siswaBelumAbsen.map((siswa) => ({
//                 id_absen: generateRandomString(5),
//                 id_siswa: siswa.id_siswa,
//                 keterangan: "Alpa",
//                 tanggal: currentDate,
//                 datang: null,
//                 pulang: null,
//             }));

//             await conn("absensi").insert(dataAlpa);
//             console.log(`${siswaBelumAbsen.length} siswa kelas 10 & 11 otomatis ditandai Alpa.`);
//         } else {
//             console.log("Semua siswa kelas 10 & 11 sudah absen sebelum jam 12 siang.");
//         }
//     } catch (error) {
//         console.error("Gagal menjalankan cron job untuk absensi Alpa:", error);
//     }
// });

// Ekspor agar bisa di-import di tempat lain
module.exports = cron;
