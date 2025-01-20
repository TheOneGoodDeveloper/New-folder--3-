import { subCategoryModel } from '../Model/SubCategory_schema.js';

// Create SubCategory
export const createSubCategory = async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;

        // Check if all required fields are provided
        if (!name || !categoryId) {
            return res.status(400).json({ message: 'Name and Category ID are required' });
        }

        const newSubCategory = new subCategoryModel({
            name,
            description,
            categoryId
        });

        const savedSubCategory = await newSubCategory.save();
        res.status(201).json(savedSubCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error creating SubCategory', error });
    }
};

// Get all SubCategories
export const getSubCategories = async (req, res) => {
    try {
        const subCategories = await subCategoryModel.find().populate('categoryId', 'name');
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving SubCategories', error });
    }
};

// Get SubCategory by ID
export const getSubCategoryById = async (req, res) => {
    const { id } = req.params;

    try {
        const subCategory = await subCategoryModel.findById(id).populate('categoryId', 'name');
        if (!subCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }
        res.status(200).json(subCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving SubCategory', error });
    }
};

// Update SubCategory
export const updateSubCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description, categoryId } = req.body;

    try {
        const updatedSubCategory = await subCategoryModel.findByIdAndUpdate(
            id,
            { name, description, categoryId, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json(updatedSubCategory);
    } catch (error) {
        res.status(500).json({ message: 'Error updating SubCategory', error });
    }
};

// Delete SubCategory
export const deleteSubCategory = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSubCategory = await subCategoryModel.findByIdAndDelete(id);

        if (!deletedSubCategory) {
            return res.status(404).json({ message: 'SubCategory not found' });
        }

        res.status(200).json({ message: 'SubCategory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting SubCategory', error });
    }
};
