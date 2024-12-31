CREATE TABLE `rombel_belajar`(
    `id_rombel` VARCHAR(255) NOT NULL,
    `nama_rombel` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_rombel`)
);
CREATE TABLE `admin`(
    `id_admin` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `status` VARCHAR(255) NOT NULL,
    `no_telp` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `jenis_kelamin` VARCHAR(255) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `nama_admin` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_admin`)
);
CREATE TABLE `setting`(
    `nama_instansi` VARCHAR(255) NOT NULL,
    `jam_terlambat` VARCHAR(255) NOT NULL,
    `jam_masuk` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(255) NOT NULL,
    `jam_pulang` VARCHAR(255) NOT NULL,
    `id_setting` VARCHAR(255) NOT NULL,
    `hari` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_setting`)
);
CREATE TABLE `mapel`(
    `id_mapel` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `nama_mapel` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_mapel`)
);
CREATE TABLE `detail_guru`(
    `foto` VARCHAR(255) NOT NULL,
    `walas` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `barcode` VARCHAR(255) NOT NULL,
    `id_guru` VARCHAR(255) NOT NULL,
    `pas` VARCHAR(255) NOT NULL
);
CREATE TABLE `kelas`(
    `id_kelas` VARCHAR(255) NOT NULL,
    `kelas` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_kelas`)
);
CREATE TABLE `absensi`(
    `keterangan` VARCHAR(255) NOT NULL,
    `datang` VARCHAR(255) NOT NULL,
    `id_siswa` VARCHAR(255) NOT NULL,
    `tanggal` VARCHAR(255) NOT NULL,
    `id_absen` VARCHAR(255) NOT NULL,
    `pulang` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_absen`)
);
CREATE TABLE `guru`(
    `nama_guru` VARCHAR(255) NOT NULL,
    `no_telp` VARCHAR(255) NOT NULL,
    `id_guru` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `nip` VARCHAR(255) NOT NULL,
    `jenis_kelamin` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_guru`)
);
CREATE TABLE `detail_siswa`(
    `id_siswa` VARCHAR(255) NOT NULL,
    `barcode` VARCHAR(255) NOT NULL,
    `foto` VARCHAR(255) NOT NULL,
    `pass` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `id_ds` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_ds`)
);
CREATE TABLE `siswa`(
    `nis` VARCHAR(255) NOT NULL,
    `nama_wali` VARCHAR(255) NOT NULL,
    `id_kelas` VARCHAR(255) NOT NULL,
    `jenis_kelamin` VARCHAR(255) NOT NULL,
    `nama_siswa` VARCHAR(255) NOT NULL,
    `nomor_wali` VARCHAR(255) NOT NULL,
    `id_siswa` VARCHAR(255) NOT NULL,
    `id_rombel` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `id_tahun_pelajaran` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_siswa`)
);
CREATE TABLE `mengampu`(
    `id_mapel` VARCHAR(255) NOT NULL,
    `id_rombel` VARCHAR(255) NOT NULL,
    `id_guru` VARCHAR(255) NOT NULL,
    `id_kelas` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_guru`)
);
CREATE TABLE `tahun_ajaran`(
    `id_tahun_pelajaran` VARCHAR(255) NOT NULL,
    `id_admin` VARCHAR(255) NOT NULL,
    `tahun` VARCHAR(255) NOT NULL,
    `aktif` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id_tahun_pelajaran`)
);