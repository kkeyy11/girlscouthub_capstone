const District = require('../models/district.model');

exports.createDistrict = async (req, res, next) => {
    const { name, description } = req.body;
    try {
        const newDistrict = new District({ name, description });
        await newDistrict.save();
        req.flash('success', 'District added successfully!');
        res.redirect('/admin/districts');
    } catch (error) {
        next(error);
    }
};

exports.getDistricts = async (req, res, next) => {
    try {
        const districts = await District.find();
        res.render('districts', { districts });
    } catch (error) {
        next(error);
    }
};

exports.showCreateDistrictForm = (req, res) => {
    res.render('district-create'); // Ensure 'district-create.ejs' exists inside the 'views' folder
};

exports.showEditDistrictForm = async (req, res, next) => {
    const { districtId } = req.params;
    try {
        const district = await District.findById(districtId);
        if (!district) {
            req.flash('error', 'District not found');
            return res.redirect('/admin/districts');
        }
        res.render('district-edit', { district }); // Pass the district data to the view
    } catch (error) {
        next(error);
    }
};

exports.updateDistrict = async (req, res, next) => {
    const { districtId, name, description } = req.body;
    try {
        await District.findByIdAndUpdate(districtId, { name, description });
        req.flash('success', 'District updated successfully!');
        res.redirect('/admin/districts');
    } catch (error) {
        next(error);
    }
};

exports.deleteDistrict = async (req, res, next) => {
    const { districtId } = req.params;
    try {
        await District.findByIdAndDelete(districtId);
        req.flash('success', 'District deleted successfully!');
        res.redirect('/admin/districts');
    } catch (error) {
        next(error);
    }
};

