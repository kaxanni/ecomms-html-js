// wishlistRoutes.js
import express from "express";
const router = express.Router();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post("/add", async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    try {
        const { data, error } = await supabase
            .from("wishlist")
            .insert([{ user_id: userId, product_id: productId }]);

        if (error) throw error;
        res.status(200).json({ message: "Product added to wishlist successfully" });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
});

// Backend route to get wishlist items
router.get('/get-wishlist', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select(`
                products (
                    id,
                    product_name,
                    description,
                    price,
                    image_url
                )
            `);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching wishlist:', error.message);
        res.status(500).json({ error: 'Failed to retrieve wishlist' });
    }
});

// Assuming you have a database setup with a function to remove an item from the wishlist
router.delete('/remove/:productId', async (req, res) => {
    const { productId } = req.params;
    const userId = req.session.userId; // Adjust this according to your session management

    try {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', userId)
            .eq('product_id', productId);

        if (error) {
            console.error('Error removing item:', error);
            return res.status(500).json({ error: 'Failed to remove item from wishlist' });
        }

        res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Route to add product to wishlist with additional details
router.post('/wishlist/add', async (req, res) => {
    const { productId, userId } = req.body;

    try {
        const { data, error } = await supabase
            .from('wishlist')
            .insert([
                {
                    user_id: userId,
                    product_id: productId
                }
            ]);

        if (error) throw error;
        res.status(200).json({ message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error.message);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});



export default router;
