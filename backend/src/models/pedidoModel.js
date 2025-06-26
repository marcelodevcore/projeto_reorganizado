const { pool } = require('../config/database');

// Modelo para operações com pedidos
const pedidoModel = {
  // Obter todos os pedidos
  getAll: async () => {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.data, p.observacoes, p.data_registro,
               f.id as fornecedor_id, f.nome as fornecedor_nome
        FROM pedidos p
        INNER JOIN fornecedores f ON p.fornecedor_id = f.id
        ORDER BY p.data DESC
      `);
      
      // Para cada pedido, buscar seus itens
      for (const pedido of rows) {
        const itens = await pedidoModel.getItensByPedidoId(pedido.id);
        pedido.itens = itens;
        
        // Calcular valor total do pedido
        pedido.valor_total = itens.reduce((total, item) => {
          return total + (item.quantidade * item.preco_unitario);
        }, 0);
      }
      
      return rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw error;
    }
  },

  // Obter um pedido pelo ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query(`
        SELECT p.id, p.data, p.observacoes, p.data_registro,
               f.id as fornecedor_id, f.nome as fornecedor_nome
        FROM pedidos p
        INNER JOIN fornecedores f ON p.fornecedor_id = f.id
        WHERE p.id = ?
      `, [id]);
      
      if (!rows[0]) {
        return null;
      }
      
      const pedido = rows[0];
      
      // Buscar itens do pedido
      pedido.itens = await pedidoModel.getItensByPedidoId(id);
      
      // Calcular valor total do pedido
      pedido.valor_total = pedido.itens.reduce((total, item) => {
        return total + (item.quantidade * item.preco_unitario);
      }, 0);
      
      return pedido;
    } catch (error) {
      console.error(`Erro ao buscar pedido ${id}:`, error);
      throw error;
    }
  },

  // Obter itens de um pedido
  getItensByPedidoId: async (pedidoId) => {
    try {
      const [rows] = await pool.query(`
        SELECT i.id, i.quantidade, i.preco_unitario,
               p.id as produto_id, p.codigo as produto_codigo, p.nome as produto_nome
        FROM itens_pedido i
        INNER JOIN produtos p ON i.produto_id = p.id
        WHERE i.pedido_id = ?
      `, [pedidoId]);
      
      return rows;
    } catch (error) {
      console.error(`Erro ao buscar itens do pedido ${pedidoId}:`, error);
      throw error;
    }
  },

  // Criar um novo pedido
  create: async (pedido) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { data, fornecedor_id, observacoes, itens } = pedido;
      
      // Inserir pedido
      const [resultPedido] = await connection.query(`
        INSERT INTO pedidos (data, fornecedor_id, observacoes)
        VALUES (?, ?, ?)
      `, [data, fornecedor_id, observacoes]);
      
      const pedidoId = resultPedido.insertId;
      
      // Inserir itens do pedido
      for (const item of itens) {
        await connection.query(`
          INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
          VALUES (?, ?, ?, ?)
        `, [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]);
        
        // Atualizar estoque do produto
        await connection.query(`
          UPDATE produtos
          SET estoque = estoque + ?
          WHERE id = ?
        `, [item.quantidade, item.produto_id]);
      }
      
      await connection.commit();
      
      // Retornar o pedido completo
      return await pedidoModel.getById(pedidoId);
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao criar pedido:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // Buscar pedidos com filtros
  search: async (filtros) => {
    try {
      let query = `
        SELECT p.id, p.data, p.observacoes, p.data_registro,
               f.id as fornecedor_id, f.nome as fornecedor_nome
        FROM pedidos p
        INNER JOIN fornecedores f ON p.fornecedor_id = f.id
      `;
      
      const params = [];
      const conditions = [];
      
      // Aplicar filtros
      if (filtros.dataInicio) {
        conditions.push('p.data >= ?');
        params.push(filtros.dataInicio);
      }
      
      if (filtros.dataFim) {
        conditions.push('p.data <= ?');
        params.push(filtros.dataFim);
      }
      
      if (filtros.fornecedorId) {
        conditions.push('p.fornecedor_id = ?');
        params.push(filtros.fornecedorId);
      }
      
      if (filtros.produtoId) {
        query += `
          INNER JOIN itens_pedido ip ON p.id = ip.pedido_id
        `;
        conditions.push('ip.produto_id = ?');
        params.push(filtros.produtoId);
      }
      
      // Adicionar condições à query
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Ordenação
      query += ' ORDER BY p.data DESC';
      
      const [rows] = await pool.query(query, params);
      
      // Para cada pedido, buscar seus itens
      for (const pedido of rows) {
        const itens = await pedidoModel.getItensByPedidoId(pedido.id);
        pedido.itens = itens;
        
        // Calcular valor total do pedido
        pedido.valor_total = itens.reduce((total, item) => {
          return total + (item.quantidade * item.preco_unitario);
        }, 0);
      }
      
      return rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos com filtros:', error);
      throw error;
    }
  },

  // Obter estatísticas de pedidos
  getEstatisticas: async () => {
    try {
      // Total de pedidos
      const [totalPedidos] = await pool.query(`
        SELECT COUNT(*) as total FROM pedidos
      `);
      
      // Valor total de pedidos
      const [valorTotal] = await pool.query(`
        SELECT SUM(ip.quantidade * ip.preco_unitario) as total
        FROM itens_pedido ip
      `);
      
      // Quantidade total de itens
      const [quantidadeTotal] = await pool.query(`
        SELECT SUM(ip.quantidade) as total
        FROM itens_pedido ip
      `);
      
      // Pedidos por fornecedor
      const [pedidosPorFornecedor] = await pool.query(`
        SELECT f.id, f.nome, COUNT(p.id) as total_pedidos
        FROM fornecedores f
        LEFT JOIN pedidos p ON f.id = p.fornecedor_id
        GROUP BY f.id
        ORDER BY total_pedidos DESC
      `);
      
      // Produtos mais pedidos
      const [produtosMaisPedidos] = await pool.query(`
        SELECT p.id, p.nome, SUM(ip.quantidade) as quantidade_total
        FROM produtos p
        INNER JOIN itens_pedido ip ON p.id = ip.produto_id
        GROUP BY p.id
        ORDER BY quantidade_total DESC
        LIMIT 5
      `);
      
      return {
        total_pedidos: totalPedidos[0].total,
        valor_total: valorTotal[0].total || 0,
        quantidade_total: quantidadeTotal[0].total || 0,
        pedidos_por_fornecedor: pedidosPorFornecedor,
        produtos_mais_pedidos: produtosMaisPedidos
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pedidos:', error);
      throw error;
    }
  }
};

module.exports = pedidoModel;
