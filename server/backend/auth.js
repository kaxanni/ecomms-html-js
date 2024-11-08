import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import express from 'express';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
    const { username, email, password, accountType } = req.body;

    console.log(`Signup attempt for username: ${username}`);
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password_hash: hashedPassword, account_type: accountType }]);

        if (error) {
            console.error('Error inserting into Supabase:', error);
            return res.status(400).json({ error: 'Signup failed' });
        }

        console.log('User created successfully:', data);
        res.status(200).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error during signup process:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
