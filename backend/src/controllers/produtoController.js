const produtoModel = require('../models/produtoModel');
const { validationResult } = require('express-validator');

// Controlador para produtos
const produtoController = {
  // Obter todos os produtos
  getAll: async (req, res) => {
    try {
      const produtos = await produtoModel.getAll();
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
  },

  // Obter um produto pelo ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const produto = await produtoModel.getById(id);
      
      if (!produto) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      res.json(produto);
    } catch (error) {
      console.error(`Erro ao buscar produto ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
    }
  },

  // Criar um novo produto
  create: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const produto = req.body;
      const novoProduto = await produtoModel.create(produto);
      
      res.status(201).json(novoProduto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
  },

  // Atualizar um produto existente
  update: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const id = req.params.id;
      const produto = req.body;
      
      // Verificar se o produto existe
      const produtoExistente = await produtoModel.getById(id);
      if (!produtoExistente) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      const produtoAtualizado = await produtoModel.update(id, produto);
      
      res.json(produtoAtualizado);
    } catch (error) {
      console.error(`Erro ao atualizar produto ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
  },

  // Excluir um produto
  delete: async (req, res) => {
    try {
      const id = req.params.id;
      
      // Verificar se o produto existe
      const produtoExistente = await produtoModel.getById(id);
      if (!produtoExistente) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      await produtoModel.delete(id);
      
      res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error(`Erro ao excluir produto ${req.params.id}:`, error);
      
      // Verificar se é erro de produto associado a pedidos
      if (error.message.includes('associado a pedidos')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erro ao excluir produto', error: error.message });
    }
  },

  // Buscar produtos com estoque baixo
  getEstoqueBaixo: async (req, res) => {
    try {
      const produtos = await produtoModel.getEstoqueBaixo();
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      res.status(500).json({ message: 'Erro ao buscar produtos com estoque baixo', error: error.message });
    }
  },

  // Buscar produtos por categoria
  getByCategoria: async (req, res) => {
    try {
      const categoriaId = req.params.categoriaId;
      const produtos = await produtoModel.getByCategoria(categoriaId);
      res.json(produtos);
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${req.params.categoriaId}:`, error);
      res.status(500).json({ message: 'Erro ao buscar produtos por categoria', error: error.message });
    }
  },

  // Buscar produtos por termo de busca
  search: async (req, res) => {
    try {
      const termo = req.query.termo || '';
      const produtos = await produtoModel.search(termo);
      res.json(produtos);
    } catch (error) {
      console.error(`Erro ao buscar produtos com termo "${req.query.termo}":`, error);
      res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
  },

  // Atualizar estoque de um produto
  updateEstoque: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const id = req.params.id;
      const { quantidade } = req.body;
      
      // Verificar se o produto existe
      const produtoExistente = await produtoModel.getById(id);
      if (!produtoExistente) {
        return res.status(404).json({ message: 'Produto não encontrado' });
      }
      
      const resultado = await produtoModel.updateEstoque(id, quantidade);
      
      res.json(resultado);
    } catch (error) {
      console.error(`Erro ao atualizar estoque do produto ${req.params.id}:`, error);
      
      // Verificar se é erro de estoque insuficiente
      if (error.message.includes('Estoque insuficiente')) {
        return res.status(400).json({ message: error.message });
      }
      
      res.status(500).json({ message: 'Erro ao atualizar estoque', error: error.message });
    }
  },

  // Obter todas as categorias
  getAllCategorias: async (req, res) => {
    try {
      const categorias = await produtoModel.getAllCategorias();
      res.json(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      res.status(500).json({ message: 'Erro ao buscar categorias', error: error.message });
    }
  }
};

module.exports = produtoController;
