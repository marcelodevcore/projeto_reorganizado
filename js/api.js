const API_BASE_URL = 'http://localhost:3000/api';

// Função auxiliar para mostrar alertas (pode ser movida para main.js se for usada em outros lugares)
function mostrarAlerta(mensagem, tipo) {
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  if (!alertPlaceholder) return;
  
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
  
  alertPlaceholder.appendChild(wrapper);
  
  // Auto-remover após 5 segundos
  setTimeout(() => {
    const alert = wrapper.querySelector('.alert');
    if (alert) {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }
  }, 5000);
}

// Objeto global para expor as funções da API
window.api = {
    produtos: {
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar produtos: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar produtos. Verifique a conexão com o servidor.', 'danger');
                return [];
            }
        },
        getById: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar produto: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar detalhes do produto.', 'danger');
                return null;
            }
        },
        create: async (produto) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(produto)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao criar produto: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao cadastrar produto: ${error.message}`, 'danger');
                throw error;
            }
        },
        update: async (id, produto) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(produto)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao atualizar produto: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao atualizar produto: ${error.message}`, 'danger');
                throw error;
            }
        },
        delete: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao excluir produto: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao excluir produto: ${error.message}`, 'danger');
                throw error;
            }
        },
        getEstoqueBaixo: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/estoque-baixo`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar produtos com estoque baixo: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar produtos com estoque baixo.', 'danger');
                return [];
            }
        },
        getByCategoria: async (categoriaId) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/categoria/${categoriaId}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar produtos da categoria: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar produtos da categoria.', 'danger');
                return [];
            }
        },
        search: async (termo) => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/search?termo=${encodeURIComponent(termo)}`);
                if (!response.ok) {
                    throw new Error(`Erro na busca de produtos: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao buscar produtos.', 'danger');
                return [];
            }
        },
        getCategorias: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/produtos/categorias`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar categorias: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar categorias.', 'danger');
                return [];
            }
        }
    },
    fornecedores: {
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar fornecedores: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar fornecedores. Verifique a conexão com o servidor.', 'danger');
                return [];
            }
        },
        getById: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar fornecedor: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar detalhes do fornecedor.', 'danger');
                return null;
            }
        },
        create: async (fornecedor) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fornecedor)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao criar fornecedor: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao cadastrar fornecedor: ${error.message}`, 'danger');
                throw error;
            }
        },
        update: async (id, fornecedor) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fornecedor)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao atualizar fornecedor: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao atualizar fornecedor: ${error.message}`, 'danger');
                throw error;
            }
        },
        delete: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao excluir fornecedor: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao excluir fornecedor: ${error.message}`, 'danger');
                throw error;
            }
        },
        getByEstado: async (estado) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/estado/${estado}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar fornecedores do estado: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar fornecedores do estado.', 'danger');
                return [];
            }
        },
        search: async (termo) => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/search?termo=${encodeURIComponent(termo)}`);
                if (!response.ok) {
                    throw new Error(`Erro na busca de fornecedores: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao buscar fornecedores.', 'danger');
                return [];
            }
        },
        getEstados: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/fornecedores/estados`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar estados: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar estados.', 'danger');
                return [];
            }
        }
    },
    pedidos: {
        getAll: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/pedidos`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar pedidos: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar pedidos. Verifique a conexão com o servidor.', 'danger');
                return [];
            }
        },
        getById: async (id) => {
            try {
                const response = await fetch(`${API_BASE_URL}/pedidos/${id}`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar pedido: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar detalhes do pedido.', 'danger');
                return null;
            }
        },
        create: async (pedido) => {
            try {
                const response = await fetch(`${API_BASE_URL}/pedidos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(pedido)
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao criar pedido: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta(`Erro ao cadastrar pedido: ${error.message}`, 'danger');
                throw error;
            }
        },
        search: async (filtros) => {
            try {
                const response = await fetch(`${API_BASE_URL}/pedidos/search`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(filtros)
                });
                if (!response.ok) {
                    throw new Error(`Erro na busca de pedidos: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao buscar pedidos.', 'danger');
                return [];
            }
        },
        getEstatisticas: async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/pedidos/estatisticas`);
                if (!response.ok) {
                    throw new Error(`Erro ao buscar estatísticas: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('Erro na API:', error);
                mostrarAlerta('Erro ao carregar estatísticas de pedidos.', 'danger');
                return {
                    total_pedidos: 0,
                    valor_total: 0,
                    quantidade_total: 0,
                    pedidos_por_fornecedor: [],
                    produtos_mais_pedidos: []
                };
            }
        }
    }
};

