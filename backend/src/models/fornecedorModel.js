const { pool } = require('../config/database');

// Modelo para operações com fornecedores
const fornecedorModel = {
  // Obter todos os fornecedores
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM fornecedores
        WHERE ativo = true
        ORDER BY nome
      `);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }
  },

  // Obter um fornecedor pelo ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM fornecedores
        WHERE id = ? AND ativo = true
      `, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Erro ao buscar fornecedor ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo fornecedor
  create: async (fornecedor) => {
    try {
      const { nome, cnpj, cidade, estado, telefone, email, endereco } = fornecedor;
      
      const [result] = await pool.query(`
        INSERT INTO fornecedores 
        (nome, cnpj, cidade, estado, telefone, email, endereco) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [nome, cnpj, cidade, estado, telefone, email, endereco]);
      
      return { id: result.insertId, ...fornecedor };
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  },

  // Atualizar um fornecedor existente
  update: async (id, fornecedor) => {
    try {
      const { nome, cnpj, cidade, estado, telefone, email, endereco } = fornecedor;
      
      await pool.query(`
        UPDATE fornecedores 
        SET nome = ?, cnpj = ?, cidade = ?, estado = ?, 
            telefone = ?, email = ?, endereco = ? 
        WHERE id = ?
      `, [nome, cnpj, cidade, estado, telefone, email, endereco, id]);
      
      return { id, ...fornecedor };
    } catch (error) {
      console.error(`Erro ao atualizar fornecedor ${id}:`, error);
      throw error;
    }
  },

  // Excluir um fornecedor (exclusão lógica)
  delete: async (id) => {
    try {
      // Verificar se o fornecedor está em algum pedido
      const [pedidos] = await pool.query(`
        SELECT COUNT(*) as count FROM pedidos WHERE fornecedor_id = ?
      `, [id]);
      
      if (pedidos[0].count > 0) {
        throw new Error('Não é possível excluir este fornecedor pois ele está associado a pedidos.');
      }
      
      // Exclusão lógica (atualiza o campo ativo para false)
      await pool.query(`
        UPDATE fornecedores SET ativo = false WHERE id = ?
      `, [id]);
      
      return { success: true };
    } catch (error) {
      console.error(`Erro ao excluir fornecedor ${id}:`, error);
      throw error;
    }
  },

  // Buscar fornecedores por estado
  getByEstado: async (estado) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM fornecedores
        WHERE estado = ? AND ativo = true
        ORDER BY nome
      `, [estado]);
      return rows;
    } catch (error) {
      console.error(`Erro ao buscar fornecedores do estado ${estado}:`, error);
      throw error;
    }
  },

  // Buscar fornecedores por termo de busca
  search: async (termo) => {
    try {
      const [rows] = await pool.query(`
        SELECT * FROM fornecedores
        WHERE (nome LIKE ? OR cnpj LIKE ? OR cidade LIKE ?) AND ativo = true
        ORDER BY nome
      `, [`%${termo}%`, `%${termo}%`, `%${termo}%`]);
      return rows;
    } catch (error) {
      console.error(`Erro ao buscar fornecedores com termo "${termo}":`, error);
      throw error;
    }
  },

  // Verificar se CNPJ já existe
  checkCnpjExists: async (cnpj, excludeId = null) => {
    try {
      let query = `SELECT COUNT(*) as count FROM fornecedores WHERE cnpj = ?`;
      let params = [cnpj];
      
      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }
      
      const [result] = await pool.query(query, params);
      return result[0].count > 0;
    } catch (error) {
      console.error(`Erro ao verificar CNPJ ${cnpj}:`, error);
      throw error;
    }
  },

  // Obter todos os estados distintos
  getAllEstados: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT DISTINCT estado FROM fornecedores
        WHERE ativo = true
        ORDER BY estado
      `);
      return rows.map(row => row.estado);
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      throw error;
    }
  }
};

module.exports = fornecedorModel;
