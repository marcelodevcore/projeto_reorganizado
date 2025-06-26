const fornecedorModel = require('../models/fornecedorModel');
const { validationResult } = require('express-validator');

// Controlador para fornecedores
const fornecedorController = {
  // Obter todos os fornecedores
  getAll: async (req, res) => {
    try {
      const fornecedores = await fornecedorModel.getAll();
      res.json(fornecedores);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      res.status(500).json({ message: 'Erro ao buscar fornecedores', error: error.message });
    }
  },

  // Obter um fornecedor pelo ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const fornecedor = await fornecedorModel.getById(id);
      
      if (!fornecedor) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      
      res.json(fornecedor);
    } catch (error) {
      console.error(`Erro ao buscar fornecedor ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao buscar fornecedor', error: error.message });
    }
  },

  // Criar um novo fornecedor
  create: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const fornecedor = req.body;
      
      // Verificar se CNPJ já existe
      const cnpjExists = await fornecedorModel.checkCnpjExists(fornecedor.cnpj);
      if (cnpjExists) {
        return res.status(400).json({ message: 'CNPJ já cadastrado para outro fornecedor' });
      }
      
      const novoFornecedor = await fornecedorModel.create(fornecedor);
      
      res.status(201).json(novoFornecedor);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      res.status(500).json({ message: 'Erro ao criar fornecedor', error: error.message });
    }
  },

  // Atualizar um fornecedor existente
  update: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const id = req.params.id;
      const fornecedor = req.body;
      
      // Verificar se o fornecedor existe
      const fornecedorExistente = await fornecedorModel.getById(id);
      if (!fornecedorExistente) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      
      // Verificar se CNPJ já existe para outro fornecedor
      const cnpjExists = await fornecedorModel.checkCnpjExists(fornecedor.cnpj, id);
      if (cnpjExists) {
        return res.status(400).json({ message: 'CNPJ já cadastrado para outro fornecedor' });
      }
      
      const fornecedorAtualizado = await fornecedorModel.update(id, fornecedor);
      
      res.json(fornecedorAtualizado);
    } catch (error) {
      console.error(`Erro ao atualizar fornecedor ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao atualizar fornecedor', error: error.message });
    }
  },

  // Excluir um fornecedor
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Verificar se o fornecedor existe
      const fornecedorExistente = await fornecedorModel.getById(id);
      if (!fornecedorExistente) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
      
      await fornecedorModel.delete(id);
      
      res.json({ message: 'Fornecedor excluído com sucesso' });
    } catch (error) {
      console.error(`Erro ao excluir fornecedor ${req.params.id}:`, error);
      
      // Verificar se é erro de fornecedor associado a pedidos
      if (error.message.includes('associado a pedidos')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erro ao excluir fornecedor', error: error.message });
    }
  },

  // Buscar fornecedores por estado
  getByEstado: async (req, res) => {
    try {
      const estado = req.params.estado;
      const fornecedores = await fornecedorModel.getByEstado(estado);
      res.json(fornecedores);
    } catch (error) {
      console.error(`Erro ao buscar fornecedores do estado ${req.params.estado}:`, error);
      res.status(500).json({ message: 'Erro ao buscar fornecedores por estado', error: error.message });
    }
  },

  // Buscar fornecedores por termo de busca
  search: async (req, res) => {
    try {
      const termo = req.query.termo || '';
      const fornecedores = await fornecedorModel.search(termo);
      res.json(fornecedores);
    } catch (error) {
      console.error(`Erro ao buscar fornecedores com termo "${req.query.termo}":`, error);
      res.status(500).json({ message: 'Erro ao buscar fornecedores', error: error.message });
    }
  },

  // Obter todos os estados distintos
  getAllEstados: async (req, res) => {
    try {
      const estados = await fornecedorModel.getAllEstados();
      res.json(estados);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      res.status(500).json({ message: 'Erro ao buscar estados', error: error.message });
    }
  }
};

module.exports = fornecedorController;
