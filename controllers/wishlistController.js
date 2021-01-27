const { Wishlist, User, Product } = require('../models/index.js');

class WishlistController {
  static async readWishlist (req, res, next) {
    try {
      const read = await Wishlist.findAll({
        where: { UserId: req.user.id }, include: [{
          model: User,
          attributes: { exclude: ['password', 'role', 'createdAt', 'updatedAt'] }
        }, {
          model: Product,
          attributes: { exclude: ['UserId'] }
        }],
      })

      return res.status(200).json(read);
    } catch (err) {
      next(err);
    };
  };

  static async createWishlist (req, res, next) {
    try {
      let UserId = req.user.id;
      let ProductId = req.body.ProductId;

      const findProduct = await Product.findByPk(ProductId);

      if (!findProduct) throw { name: 'productNotFound' };

      const findOne = await Wishlist.findOne({ where: { UserId, ProductId } });

      if (findOne) throw { name: 'alreadyAddWish' };

      const create = await Wishlist.create({ UserId, ProductId });

      return res.status(201).json(create);
    } catch (err) {
      next(err);
    };
  };

  static async deleteWishlist (req, res, next) {
    try {
      const id = req.params.id;

      const find = await Wishlist.findByPk(id);

      if (!find) throw { name: 'wishlistNotFound' };

      await Wishlist.destroy({ where: { id } });

      res.status(200).json({ message: 'Product has been removed from your wishlist!' });
    } catch (err) {
      next(err);
    };
  };
};

module.exports = WishlistController;