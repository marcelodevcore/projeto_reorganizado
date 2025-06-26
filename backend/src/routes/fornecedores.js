const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');
const { body } = require('express-validator');

// Validações para fornecedor
const fornecedorValidation = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('cnpj').notEmpty().withMessage('CNPJ é obrigatório')
    .isLength({ min: 14, max: 14 }).withMessage('CNPJ deve ter 14 dígitos'),
  body('cidade').notEmpty().withMessage('Cidade é obrigatória'),
  body('estado').notEmpty().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres')
];

// Rotas para fornecedores
router.get('/', fornecedorController.getAll);
router.get('/estado/:estado', fornecedorController.getByEstado);
router.get('/search', fornecedorController.search);
router.get('/estados', fornecedorController.getAllEstados);
router.get('/:id', fornecedorController.getById);
router.post('/', fornecedorValidation, fornecedorController.create);
router.put('/:id', fornecedorValidation, fornecedorController.update);
router.delete('/:id', fornecedorController.delete);

module.exports = router;
