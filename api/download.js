const axios = require('axios');

module.exports = async (req, res) => {
    // Atur CORS Biar JavaScript di index.html bisa download lancar tanpa kena block browser
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Parameter URL tidak ditemukan, bre!' });
    }

    try {
        // Kita tembak API TikWM dengan parameter hd=1 biar dipaksa ngeluarin kualitas super tajam!
        const response = await axios.post('https://www.tikwm.com/api/', null, {
            params: {
                url: videoUrl,
                hd: 1 // <--- KUNCI RAHASIA ANTI BURIK!
            }
        });

        const data = response.data.data;

        if (!data) {
            return res.status(404).json({ error: 'Video gagal diproses atau tidak ditemukan.' });
        }

        // Ambil jalur link kualitas paling tinggi yang disediakan server
        const highQualityUrl = data.hdplay || data.play || data.download_url;

        // Kirim data bersih ke frontend index.html
        return res.status(200).json({
            title: data.title,
            download_url: highQualityUrl // Ini dijamin link kualitas HD murni!
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Terjadi kesalahan pada server cloud Vercel.' });
    }
};
