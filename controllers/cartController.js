const { Cart, Product, User } = require('../models/index.js');

class CartController {
  static async readCart (req, res, next) {
    try {
      const read = await Cart.findAll({
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

  static async createCart (req, res, next) {
    try {
      let UserId = req.user.id;
      let ProductId = req.body.ProductId;
      let quantity = 1;
      let isPaid = false;

      const findProduct = await Product.findByPk(ProductId);

      if (!findProduct) throw { name: 'productNotFound' };
      if (findProduct.stock < quantity) throw { name: 'notEnoughStock' };

      const findOne = await Cart.findOne({ where: { UserId, ProductId } });

      if (findOne) {
        let oldQuantity = findOne.quantity;
        let newQuantity = oldQuantity + quantity;

        await Cart.update({ UserId, ProductId, quantity: newQuantity, isPaid }, { where: { id: findOne.id } });

        const find = await Cart.findByPk(findOne.id);

        return res.status(200).json(find);
      };

      const create = await Cart.create({ UserId, ProductId, quantity, isPaid });

      return res.status(201).json(create);
    } catch (err) {
      next(err);
    };
  };

  static async updateCart (req, res, next) {
    try {
      const id = req.params.id
      const UserId = req.user.id;
      const { ProductId, quantity, isPaid } = req.body;

      const find = await Cart.findByPk(id);

      if (!find) throw { name: 'cartNotFound' };

      const findProduct = await Product.findByPk(ProductId);

      if (!findProduct) throw { name: 'productNotFound' };
      if (findProduct.stock < quantity) throw { name: 'notEnoughStock' };

      await Cart.update({ UserId, ProductId, quantity, isPaid }, { where: { id } });

      res.status(200).json({ message: 'Product has been checked out!' });
    } catch (err) {
      next(err);
    };
  };

  static async deleteCart (req, res, next) {
    try {
      const id = req.params.id;

      const find = await Cart.findByPk(id);

      if (!find) throw { name: 'cartNotFound' };

      await Cart.destroy({ where: { id } });

      res.status(200).json({ message: 'Product has been removed from your cart!' });
    } catch (err) {
      next(err);
    };
  };
};

module.exports = CartController;