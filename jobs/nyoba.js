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

// Cron job berjalan setiap hari pukul 12:00 siang
cron.schedule("0 10 * * *", async () => {
    try {
        const currentDate = moment().format("YYYY-MM-DD");

        // Cari siswa yang belum memiliki keterangan Hadir/Terlambat
        const siswaBelumAbsen = await conn("siswa")
            .leftJoin("absensi", function () {
                this.on("siswa.id_siswa", "=", "absensi.id_siswa").andOn(
                    "absensi.tanggal",
                    "=",
                    conn.raw("?", [currentDate])
                );
            })
            .whereNull("absensi.id_siswa") // Siswa yang belum absen
            .select("siswa.id_siswa");

        if (siswaBelumAbsen.length > 0) {
            const dataAlpa = siswaBelumAbsen.map((siswa) => ({
                id_absen: generateRandomString(5),
                id_siswa: siswa.id_siswa,
                keterangan: "Alpa",
                tanggal: currentDate,
                datang: null,
                pulang: null,
            }));

            await conn("absensi").insert(dataAlpa);
            console.log(`${siswaBelumAbsen.length} siswa otomatis ditandai Alpa.`);
        } else {
            console.log("Semua siswa sudah absen sebelum jam 12 siang.");
        }
    } catch (error) {
        console.error("Gagal menjalankan cron job untuk absensi Alpa:", error);
    }
});

// Ekspor agar bisa di-import di tempat lain
module.exports = cron;
