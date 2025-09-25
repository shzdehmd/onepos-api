const categoryService = require('./productCategory.service');

const createCategoryHandler = async (req, res, next) => {
    try {
        const { name } = req.body;
        const adminId = req.user._id;

        if (!name) {
            res.status(400);
            throw new Error('Category name is required.');
        }

        const category = await categoryService.createCategory(name, adminId);

        res.status(201).json({
            success: true,
            message: 'Product category created successfully.',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminCategoriesHandler = async (req, res, next) => {
    try {
        const adminId = req.user._id;
        const categories = await categoryService.getCategoriesByAdmin(adminId);

        res.status(200).json({
            success: true,
            message: 'Product categories fetched successfully.',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

const updateCategoryHandler = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { name } = req.body;
        const adminId = req.user._id;

        const updatedCategory = await categoryService.updateCategory(categoryId, { name }, adminId);

        if (!updatedCategory) {
            res.status(404);
            throw new Error('Category not found or you do not have permission to update it.');
        }

        res.status(200).json({
            success: true,
            message: 'Product category updated successfully.',
            data: updatedCategory,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategoryHandler = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const adminId = req.user._id;

        const deletedCategory = await categoryService.deleteCategory(categoryId, adminId);

        if (!deletedCategory) {
            res.status(404);
            throw new Error('Category not found or you do not have permission to delete it.');
        }

        res.status(200).json({
            success: true,
            message: 'Product category deleted successfully.',
            data: { _id: deletedCategory._id },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategoryHandler,
    getAdminCategoriesHandler,
    updateCategoryHandler,
    deleteCategoryHandler,
};
