const { pool } = require('../config/database');

// Modelo para operações com produtos
const produtoModel = {
  // Obter todos os produtos
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.ativo = true
        ORDER BY p.nome
      `);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw error;
    }
  },

  // Obter um produto pelo ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ? AND p.ativo = true
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Erro ao buscar produto ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo produto
  create: async (produto) => {
    try {
      const { codigo, nome, categoria_id, preco, estoque, estoque_minimo, descricao } = produto;
      
      const [result] = await pool.query(`
        INSERT INTO produtos 
        (codigo, nome, categoria_id, preco, estoque, estoque_minimo, descricao) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [codigo, nome, categoria_id, preco, estoque, estoque_minimo || 5, descricao]);
      
      return { id: result.insertId, ...produto };
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar um produto existente
  update: async (id, produto) => {
    try {
      const { codigo, nome, categoria_id, preco, estoque, estoque_minimo, descricao } = produto;
      
      await pool.query(`
        UPDATE produtos 
        SET codigo = ?, nome = ?, categoria_id = ?, preco = ?, 
            estoque = ?, estoque_minimo = ?, descricao = ? 
        WHERE id = ?
      `, [codigo, nome, categoria_id, preco, estoque, estoque_minimo || 5, descricao, id]);
      
      return { id, ...produto };
    } catch (error) {
      console.error(`Erro ao atualizar produto ${id}:`, error);
      throw error;
    }
  },

  // Excluir um produto (exclusão lógica)
  delete: async (id) => {
    try {
      // Verificar se o produto está em algum pedido
      const [pedidos] = await pool.query(`
        SELECT COUNT(*) as count FROM itens_pedido WHERE produto_id = ?
      `, [id]);
      
      if (pedidos[0].count > 0) {
        throw new Error('Não é possível excluir este produto pois ele está associado a pedidos.');
      }
      
      // Exclusão lógica (atualiza o campo ativo para false)
      await pool.query(`
        UPDATE produtos SET ativo = false WHERE id = ?
      `, [id]);
      
      return { success: true };
    } catch (error) {
      console.error(`Erro ao excluir produto ${id}:`, error);
      throw error;
    }
  },

  // Buscar produtos com estoque baixo
  getEstoqueBaixo: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.estoque <= p.estoque_minimo AND p.ativo = true
        ORDER BY p.estoque ASC
      `);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  },

  // Buscar produtos por categoria
  getByCategoria: async (categoriaId) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.categoria_id = ? AND p.ativo = true
        ORDER BY p.nome
      `, [categoriaId]);
      return rows;
    } catch (error) {
      console.error(`Erro ao buscar produtos da categoria ${categoriaId}:`, error);
      throw error;
    }
  },

  // Buscar produtos por termo de busca
  search: async (termo) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.nome as categoria_nome 
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE (p.nome LIKE ? OR p.codigo LIKE ?) AND p.ativo = true
        ORDER BY p.nome
      `, [`%${termo}%`, `%${termo}%`]);
      return rows;
    } catch (error) {
      console.error(`Erro ao buscar produtos com termo "${termo}":`, error);
      throw error;
    }
  },

  // Atualizar estoque de um produto
  updateEstoque: async (id, quantidade) => {
    try {
      // Obter estoque atual
      const [produto] = await pool.query(`
        SELECT estoque FROM produtos WHERE id = ?
      `, [id]);
      
      if (!produto[0]) {
        throw new Error('Produto não encontrado');
      }
      
      const novoEstoque = produto[0].estoque + quantidade;
      
      // Não permitir estoque negativo
      if (novoEstoque < 0) {
        throw new Error('Estoque insuficiente');
      }
      
      // Atualizar estoque
      await pool.query(`
        UPDATE produtos SET estoque = ? WHERE id = ?
      `, [novoEstoque, id]);
      
      return { id, estoque: novoEstoque };
    } catch (error) {
      console.error(`Erro ao atualizar estoque do produto ${id}:`, error);
      throw error;
    }
  },

  // Obter todas as categorias
  getAllCategorias: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM categorias ORDER BY nome
      `);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }
};

module.exports = produtoModel;
