const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const { body } = require('express-validator');

// Validações para pedido
const pedidoValidation = [
  body('data').notEmpty().withMessage('Data é obrigatória')
    .isDate().withMessage('Data inválida'),
  body('fornecedor_id').notEmpty().withMessage('Fornecedor é obrigatório')
    .isInt().withMessage('ID do fornecedor inválido'),
  body('itens').isArray({ min: 1 }).withMessage('Pedido deve ter pelo menos um item'),
  body('itens.*.produto_id').isInt().withMessage('ID do produto inválido'),
  body('itens.*.quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser maior que zero'),
  body('itens.*.preco_unitario').isNumeric().withMessage('Preço unitário deve ser um número válido')
];

// Validações para busca de pedidos
const searchValidation = [
  body('dataInicio').optional().isDate().withMessage('Data inicial inválida'),
  body('dataFim').optional().isDate().withMessage('Data final inválida'),
  body('fornecedorId').optional().isInt().withMessage('ID do fornecedor inválido'),
  body('produtoId').optional().isInt().withMessage('ID do produto inválido')
];

// Rotas para pedidos
router.get('/', pedidoController.getAll);
router.get('/estatisticas', pedidoController.getEstatisticas);
router.get('/:id', pedidoController.getById);
router.post('/', pedidoValidation, pedidoController.create);
router.post('/search', searchValidation, pedidoController.search);

module.exports = router;
