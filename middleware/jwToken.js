const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    
    // Mengambil token dari header Authorization atau cookie 'token'
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies['token'];
    console.log('token:', token);
    
    // Jika token tidak ditemukan, kirimkan respon 401 (Unauthorized)
    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak, token tidak ditemukan.' });
    }

    try {
        // Verifikasi token dengan secret key
        const verifikasiToken = jwt.verify(token, process.env.TOKEN_PRIVATE);
        
        // Simpan informasi user yang terverifikasi ke req.user
        req.user = verifikasiToken;
        
        // Lanjutkan ke middleware berikutnya atau route handler
        next();
    } catch (error) {
        // Jika verifikasi token gagal, kirimkan respon 400 (Bad Request)
        res.status(400).json({ error: 'Token tidak valid atau tidak diizinkan.' });
    }
}

module.exports = auth;
