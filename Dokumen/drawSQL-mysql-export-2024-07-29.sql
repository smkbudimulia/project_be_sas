CREATE TABLE `tahun_ajaran`(
    `id_tahun_pelajaran` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `tahun` VARCHAR(255) NOT NULL,
    `aktif` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_tahun_pelajaran`)
);
CREATE TABLE `absensi`(
    `id_absen` VARCHAR(255) NOT NULL,
    `id_siswa_kelas` VARCHAR(255) NOT NULL,
    `datang` VARCHAR(255) NOT NULL,
    `pulang` VARCHAR(255) NOT NULL,
    `keterangan` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_absen`)
);
CREATE TABLE `kelas`(
    `id_kelas` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `kelas` VARCHAR(255) NOT NULL,
    `jurusan` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_kelas`)
);
CREATE TABLE `admin`(
    `id_admin` VARCHAR(255) NOT NULL,
    `nama_admin` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_admin`)
);
CREATE TABLE `siswa_kelas`(
    `id_siswa_kelas` VARCHAR(255) NOT NULL,
    `id_siswa` VARCHAR(255) NOT NULL,
    `id_kelas` VARCHAR(255) NOT NULL,
    `id_tahun_pelajaran` VARCHAR(255) NOT NULL,
    `id_guru` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_siswa_kelas`)
);
CREATE TABLE `siswa`(
    `id_siswa` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `nis` VARCHAR(255) NOT NULL,
    `nama_siswa` VARCHAR(255) NOT NULL,
    `jenis_kelamin` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `barcode` VARCHAR(255) NOT NULL,
    `nama_wali` VARCHAR(255) NOT NULL,
    `nomor_wali` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_siswa`)
);
CREATE TABLE `guru`(
    `id_guru` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `nip` VARCHAR(255) NOT NULL,
    `nama_guru` VARCHAR(255) NOT NULL,
    `jenis_kelamin` VARCHAR(255) NOT NULL,
    `mapel` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `walas` VARCHAR(255) NOT NULL,
    `brcode` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_guru`)
);
ALTER TABLE
    `tahun_ajaran` ADD CONSTRAINT `tahun_ajaran_id_admin_foreign` FOREIGN KEY(`id_admin`) REFERENCES `admin`(`id_admin`);
ALTER TABLE
    `siswa_kelas` ADD CONSTRAINT `siswa_kelas_id_tahun_pelajaran_foreign` FOREIGN KEY(`id_tahun_pelajaran`) REFERENCES `tahun_ajaran`(`id_tahun_pelajaran`);
ALTER TABLE
    `kelas` ADD CONSTRAINT `kelas_id_admin_foreign` FOREIGN KEY(`id_admin`) REFERENCES `admin`(`id_admin`);
ALTER TABLE
    `absensi` ADD CONSTRAINT `absensi_id_siswa_kelas_foreign` FOREIGN KEY(`id_siswa_kelas`) REFERENCES `siswa_kelas`(`id_siswa_kelas`);
ALTER TABLE
    `siswa_kelas` ADD CONSTRAINT `siswa_kelas_id_kelas_foreign` FOREIGN KEY(`id_kelas`) REFERENCES `kelas`(`id_kelas`);
ALTER TABLE
    `siswa_kelas` ADD CONSTRAINT `siswa_kelas_id_siswa_foreign` FOREIGN KEY(`id_siswa`) REFERENCES `siswa`(`id_siswa`);
ALTER TABLE
    `siswa_kelas` ADD CONSTRAINT `siswa_kelas_id_guru_foreign` FOREIGN KEY(`id_guru`) REFERENCES `guru`(`id_guru`);
ALTER TABLE
    `guru` ADD CONSTRAINT `guru_id_admin_foreign` FOREIGN KEY(`id_admin`) REFERENCES `admin`(`id_admin`);