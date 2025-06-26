const pedidoModel = require('../models/pedidoModel');
const produtoModel = require('../models/produtoModel');
const { validationResult } = require('express-validator');

// Controlador para pedidos
const pedidoController = {
  // Obter todos os pedidos
  getAll: async (req, res) => {
    try {
      const pedidos = await pedidoModel.getAll();
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
  },

  // Obter um pedido pelo ID
  getById: async (req, res) => {
    try {
      const id = req.params.id;
      const pedido = await pedidoModel.getById(id);
      
      if (!pedido) {
        return res.status(404).json({ message: 'Pedido não encontrado' });
      }
      
      res.json(pedido);
    } catch (error) {
      console.error(`Erro ao buscar pedido ${req.params.id}:`, error);
      res.status(500).json({ message: 'Erro ao buscar pedido', error: error.message });
    }
  },

  // Criar um novo pedido
  create: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const pedido = req.body;
      
      // Validar itens do pedido
      if (!pedido.itens || pedido.itens.length === 0) {
        return res.status(400).json({ message: 'O pedido deve conter pelo menos um item' });
      }
      
      // Verificar estoque disponível para cada item
      for (const item of pedido.itens) {
        const produto = await produtoModel.getById(item.produto_id);
        
        if (!produto) {
          return res.status(400).json({ message: `Produto ID ${item.produto_id} não encontrado` });
        }
        
        if (produto.estoque < item.quantidade) {
          return res.status(400).json({ 
            message: `Estoque insuficiente para o produto ${produto.nome}. Disponível: ${produto.estoque}` 
          });
        }
      }
      
      const novoPedido = await pedidoModel.create(pedido);
      
      res.status(201).json(novoPedido);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ message: 'Erro ao criar pedido', error: error.message });
    }
  },

  // Buscar pedidos com filtros
  search: async (req, res) => {
    try {
      const filtros = {
        dataInicio: req.body.dataInicio || null,
        dataFim: req.body.dataFim || null,
        fornecedorId: req.body.fornecedorId || null,
        produtoId: req.body.produtoId || null
      };
      
      const pedidos = await pedidoModel.search(filtros);
      res.json(pedidos);
    } catch (error) {
      console.error('Erro ao buscar pedidos com filtros:', error);
      res.status(500).json({ message: 'Erro ao buscar pedidos', error: error.message });
    }
  },

  // Obter estatísticas de pedidos
  getEstatisticas: async (req, res) => {
    try {
      const estatisticas = await pedidoModel.getEstatisticas();
      res.json(estatisticas);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pedidos:', error);
      res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
    }
  }
};

module.exports = pedidoController;
