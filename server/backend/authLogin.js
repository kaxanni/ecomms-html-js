import express from 'express';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user from Supabase
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !data) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Compare provided password with the stored password hash
        const passwordMatch = await bcrypt.compare(password, data.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Store user UUID in session
        req.session.userId = data.id; // Assuming `id` is the UUID in your users table

        // Send a successful response with account type
        res.json({ message: 'Login successful', account_type: data.account_type });
    } catch (err) {
        console.error('Error during login process:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
});

export default router;
