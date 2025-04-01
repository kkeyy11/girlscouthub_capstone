const Product = require("../models/productModel");
const Avail = require("../models/Avail");

exports.getDashboard = async (req, res) => {
    try {
        const products = await Product.find({});
        const sales = await Avail.find({});

        // Aggregate data for charts
        const productData = products.map(p => ({ name: p.name, stock: p.quantity }));
        const salesData = sales.reduce((acc, sale) => {
            const year = new Date(sale.date).getFullYear();
            acc[year] = (acc[year] || 0) + sale.quantity;
            return acc;
        }, {});

        res.render("dashboard", {
            productData: JSON.stringify(productData || []),
            salesData: JSON.stringify(salesData || {})
        });
        
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).send("Error loading dashboard");
    }
};