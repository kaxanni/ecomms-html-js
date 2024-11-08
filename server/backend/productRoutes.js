import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to add a new product
router.post('/add-product', upload.single('productImage'), async (req, res) => {
    console.log("Starting add-product route...");

    const { product_name, quantity, description, price } = req.body;
    const userId = req.session.userId; // Retrieve user UUID from the session

    if (!userId) {
        console.error("User ID not found in session. Unauthorized access.");
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    } else {
        console.log("Session User ID:", userId);
    }

    if (!product_name || !quantity || !description || !price) {
        console.error("Missing product details:", { product_name, quantity, description, price });
        return res.status(400).json({ error: 'All product fields are required.' });
    }

    try {
        const file = req.file;
        console.log("File uploaded:", file ? file.originalname : "No file uploaded");

        if (!file) {
            console.error("Product image is missing.");
            return res.status(400).json({ error: 'Product image is required.' });
        }

        const filePath = `product-images/${Date.now()}_${file.originalname}`;
        
        // Upload the image to Supabase storage
        const { data: imageUpload, error: imageError } = await supabase
            .storage
            .from('product-images')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (imageError) {
            console.error('Image upload error:', imageError);
            return res.status(500).json({ message: 'Image upload error', error: imageError.message });
        } else {
            console.log("Image uploaded to:", filePath);
        }

        // Retrieve the public URL of the uploaded image
        const { data: publicUrlData, error: urlError } = supabase
            .storage
            .from('product-images')
            .getPublicUrl(filePath);

        if (urlError || !publicUrlData) {
            console.error("Failed to retrieve image URL:", urlError);
            throw new Error('Failed to retrieve image URL');
        }

        const publicURL = publicUrlData.publicURL;
        console.log("Image Public URL:", publicURL);

        // Insert product data into the products table
        const { data, error: insertError } = await supabase
            .from('products')
            .insert([{
                product_name,
                quantity: parseInt(quantity),
                description,
                price: parseFloat(price),
                image_url: publicURL,
                seller_id: userId,
            }]);

        if (insertError) {
            console.error("Database insertion error:", insertError);
            throw insertError;
        } else {
            console.log("Product added to database:", data);
        }

        res.status(200).json({ message: 'Product added successfully', product: data });
    } catch (error) {
        console.error('Error adding product:', error.message);
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
});

// Route to fetch all products for inventory display
router.get('/get-products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', req.session.userId);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Route to update the quantity of a product by a specified amount
router.post('/add-quantity/:id', async (req, res) => {
    const productId = req.params.id;
    const { quantityToAdd } = req.body;

    try {
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('quantity')
            .eq('id', productId)
            .single();

        if (fetchError || !product) {
            throw new Error('Product not found');
        }

        const newQuantity = product.quantity + parseInt(quantityToAdd);

        const { data, error } = await supabase
            .from('products')
            .update({ quantity: newQuantity })
            .eq('id', productId);

        if (error) throw error;

        res.status(200).json({ message: 'Quantity updated successfully', product: data });
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).json({ error: 'Failed to update quantity' });
    }
});

// Route to delete a product and its image from storage
router.delete('/delete-product/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image_url')
            .eq('id', productId)
            .single();

        if (fetchError || !product) {
            throw new Error('Product not found');
        }

        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (deleteError) throw deleteError;

        if (product.image_url) {
            const filePath = product.image_url.split('/').slice(-2).join('/');
            const { error: storageError } = await supabase.storage
                .from('product-images')
                .remove([filePath]);

            if (storageError) {
                console.error('Error deleting image from storage:', storageError.message);
            }
        }

        res.status(200).json({ message: 'Product and image deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// Route to fetch all products for the customer's shop page
router.get('/get-all-products', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('id, product_name, description, quantity, price, image_url');

        if (error) throw error;

        const productsWithPlaceholder = data.map(product => ({
            ...product,
            image_url: product.image_url || 'https://via.placeholder.com/150' // Set placeholder if no image URL
        }));

        res.status(200).json(productsWithPlaceholder);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }
});

// Route to add a product to the cart
router.post('/cart/add', async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    try {
        const { data, error } = await supabase
            .from('cart')
            .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
        res.status(200).json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add product to cart' });
    }
});

// Route to add a product to the wishlist
router.post('/wishlist/add', async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ error: 'Unauthorized access. Please log in.' });
    }

    try {
        const { data, error } = await supabase
            .from('wishlist')
            .insert({ user_id: userId, product_id: productId });

        if (error) throw error;
        res.status(200).json({ message: 'Product added to wishlist successfully' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add product to wishlist' });
    }
});

export default router;
