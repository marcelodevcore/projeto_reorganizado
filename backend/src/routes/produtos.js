const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const { body } = require('express-validator');

// Validações para produto
const produtoValidation = [
  body('codigo').notEmpty().withMessage('Código é obrigatório'),
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('categoria_id').isInt({ min: 1 }).withMessage('Categoria é obrigatória'),
  body('preco').isNumeric().withMessage('Preço deve ser um número válido'),
  body('estoque').isInt({ min: 0 }).withMessage('Estoque deve ser um número inteiro não negativo')
];

// Rotas para produtos
router.get('/', produtoController.getAll);
router.get('/estoque-baixo', produtoController.getEstoqueBaixo);
router.get('/categoria/:categoriaId', produtoController.getByCategoria);
router.get('/search', produtoController.search);
router.get('/categorias', produtoController.getAllCategorias);
router.get('/:id', produtoController.getById);
router.post('/', produtoValidation, produtoController.create);
router.put('/:id', produtoValidation, produtoController.update);
router.delete('/:id', produtoController.delete);
router.patch('/:id/estoque', [
  body('quantidade').isInt().withMessage('Quantidade deve ser um número inteiro')
], produtoController.updateEstoque);

module.exports = router;
