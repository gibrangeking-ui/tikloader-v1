const axios = require('axios');

module.exports = async (req, res) => {
    // Mengaktifkan CORS Head Manual untuk Environment Vercel Serverless
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight request CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const videoUrl = req.query.url;

    // Validasi input link video
    if (!videoUrl) {
        return res.status(400).json({ error: 'URL tidak boleh kosong, bre!' });
    }

    try {
        // Request data ke target provider TikWM API
        const response = await axios.post('https://www.tikwm.com/api/', {
            url: videoUrl
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const result = response.data;

        // Cek integritas response data dari API provider
        if (result.code === 0 && result.data) {
            return res.status(200).json({
                title: result.data.title || "TikTok Video",
                download_url: result.data.play // Direct link No-Watermark HD
            });
        } else {
            return res.status(500).json({ error: 'Gagal mengekstrak video. Pastikan link valid!' });
        }

    } catch (error) {
        console.error('Vercel Function Error:', error.message);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server internal backend Vercel.' });
    }
};
