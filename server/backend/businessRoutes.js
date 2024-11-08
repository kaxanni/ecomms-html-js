import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to add business information
router.post('/add-business-info', upload.single('profilePicture'), async (req, res) => {
    const { owner_name, company_name, email } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    try {
        let profilePictureUrl = null;
        if (req.file) {
            const filePath = `profile-pictures/${Date.now()}_${req.file.originalname}`;
            const { error: uploadError } = await supabase
                .storage
                .from('profile-pictures')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw new Error(`Error uploading profile picture: ${uploadError.message}`);

            const { data: publicUrlData, error: urlError } = supabase
                .storage
                .from('profile-pictures')
                .getPublicUrl(filePath);

            if (urlError) throw new Error('Failed to retrieve profile picture URL');
            profilePictureUrl = publicUrlData.publicURL;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                owner_name,
                company_name,
                business_email: email,
                profile_picture: profilePictureUrl,
            })
            .eq('id', userId);

        if (updateError) throw new Error(`Failed to update business info in database: ${updateError.message}`);

        res.status(200).json({ message: 'Business information added successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to get business information
router.get('/get-business-info', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('owner_name, company_name, business_email, profile_picture, payment_method')
            .eq('id', userId)
            .single();

        if (error || !data) {
            throw new Error('Failed to retrieve business information');
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching business info:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to get user products for featured selection
router.get('/get-user-products', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, product_name')
            .eq('seller_id', userId);

        if (error) {
            console.error('Supabase error:', error.message);
            throw new Error('Failed to retrieve products');
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Route to set a featured product
router.post('/set-featured-product', async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    try {
        // Reset any previously featured product for this user
        const { error: resetError } = await supabase
            .from('products')
            .update({ is_featured: false })
            .eq('seller_id', userId);

        if (resetError) throw new Error(`Failed to reset featured product: ${resetError.message}`);

        // Set the new product as featured
        const { error: updateError } = await supabase
            .from('products')
            .update({ is_featured: true })
            .eq('id', productId)
            .eq('seller_id', userId);

        if (updateError) throw new Error(`Failed to set featured product: ${updateError.message}`);

        res.status(200).json({ message: 'Product set as featured successfully' });
    } catch (error) {
        console.error('Error setting featured product:', error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
