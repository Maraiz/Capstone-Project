import Users from '../models/userModel.js';
import jwt from 'jsonwebtoken';

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.sendStatus(401);
        
        // ✅ Fix 1: Gunakan findOne() bukan findAll()
        const user = await Users.findOne({
            where: {
                refresh_token: refreshToken
            }
        });

        // ✅ Fix 2: Cek user dengan benar
        if (!user) return res.sendStatus(403);

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);

            // ✅ Fix 3: Langsung akses properti (tanpa [0])
            const userId = user.id;
            const name = user.name;
            const email = user.email;

            const accessToken = jwt.sign(
                { userId, name, email },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' } // ✅ Konsisten dengan login (15 menit)
            );

            res.json({ accessToken });
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({ msg: "Server error" });
    }
};