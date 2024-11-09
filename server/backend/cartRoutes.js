// cartRoutes.js
import express from "express";
const router = express.Router();
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post("/add", async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: "Unauthorized access" });
    }

    try {
        const { data, error } = await supabase
            .from("cart")
            .insert([{ customer_id: userId, product_id: productId, quantity }]);

        if (error) throw error;
        res.status(200).json({ message: "Product added to cart successfully" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ error: "Failed to add to cart" });
    }
});

export default router;
