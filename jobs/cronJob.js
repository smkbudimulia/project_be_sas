const cron = require('node-cron');
const moment = require('moment');
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

// Fungsi untuk mencatat siswa Alpa
const catatAlpa = async () => {
    const currentDate = moment().format('YYYY-MM-DD');
    console.log("Tanggal hari ini:", currentDate);
    try {
        const siswaBelumAbsen = await conn('siswa')
            .leftJoin('absensi', 'siswa.id_siswa', 'absensi.id_siswa')
            .where(function () {
                this.where('absensi.tanggal', currentDate) // Cek tanggal absen
                    .andWhere(function () {
                        this.whereNull('absensi.pulang'); // Pulang belum diisi
                    });
            })
            .orWhereNull('absensi.id_siswa') // Tidak ada catatan absen
            .select('siswa.id_siswa');

        console.log("Siswa yang belum absen pulang:", siswaBelumAbsen);

        if (siswaBelumAbsen.length === 0) {
            console.log('Semua siswa telah tercatat hari ini.');
            return;
        }

        const dataAlpa = siswaBelumAbsen.map((siswa) => {
            if (!siswa.id_siswa) {
                console.error("ID Siswa tidak valid:", siswa);
                return null;
            }
            return {
                id_absen: generateRandomString(5),
                id_siswa: siswa.id_siswa,
                keterangan: 'Alpa',
                tanggal: currentDate,
                datang: "",
                pulang: "",
            };
        }).filter(item => item !== null);

        await conn('absensi').insert(dataAlpa);
        console.log(`${dataAlpa.length} siswa telah dicatat sebagai Alpa.`);
    } catch (error) {
        console.error('Gagal mencatat siswa Alpa:', error.message);
    }
};



// Jadwalkan Cron Job untuk dijalankan setiap hari pukul 23:59
cron.schedule('00 18 * * *', catatAlpa);

console.log('Cron Job untuk mencatat siswa Alpa telah dijalankan.');

// // **Pengujian Manual**
// if (process.env.NODE_ENV === 'test') {
//     catatAlpa(); // Jalankan secara manual saat mode test
// }
