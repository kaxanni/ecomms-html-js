import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token

    console.log('Received Token in Header:', token); // Log received token

    if (!token) return res.status(403).json({ error: 'Token is required' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded token data to req.user
        next(); // Continue to next middleware or route handler
    } catch (err) {
        console.error('Token verification error:', err); // Log the error
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

export default verifyToken;
