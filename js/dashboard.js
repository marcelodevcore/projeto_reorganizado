// Script para a página de dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do dashboard
    carregarDadosDashboard();
    
    // Carregar produtos com estoque baixo
    carregarProdutosEstoqueBaixo();
    
    // Carregar pedidos recentes
    carregarPedidosRecentes();
    
    // Configurar gráficos
    configurarGraficos();
});

// Função para carregar dados do dashboard
async function carregarDadosDashboard() {
    try {
        // Carregar contadores
        const produtos = await window.api.produtos.getAll();
        const fornecedores = await window.api.fornecedores.getAll();
        const pedidos = await window.api.pedidos.getAll();
        
        // Atualizar contadores
        document.getElementById('total-produtos').textContent = produtos.length;
        document.getElementById('total-fornecedores').textContent = fornecedores.length;
        document.getElementById('total-pedidos').textContent = pedidos.length;
        
        // Calcular valor total dos pedidos
        let valorTotal = 0;
        pedidos.forEach(pedido => {
            valorTotal += pedido.valor_total || 0;
        });
        
        document.getElementById('valor-total-pedidos').textContent = formatarMoeda(valorTotal);
        
        // Buscar estatísticas para gráficos
        const estatisticas = await window.api.pedidos.getEstatisticas();
        
        // Atualizar gráficos com os dados
        atualizarGraficoPedidosPorFornecedor(estatisticas.pedidos_por_fornecedor);
        atualizarGraficoProdutosMaisPedidos(estatisticas.produtos_mais_pedidos);
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

// Função para carregar produtos com estoque baixo
async function carregarProdutosEstoqueBaixo() {
    try {
        const produtosEstoqueBaixo = await window.api.produtos.getEstoqueBaixo();
        const listaEl = document.getElementById('lista-estoque-baixo');
        
        if (!produtosEstoqueBaixo || produtosEstoqueBaixo.length === 0) {
            listaEl.innerHTML = '<li class="list-group-item text-center">Nenhum produto com estoque baixo</li>';
            document.getElementById('contador-estoque-baixo').textContent = '0';
            return;
        }
        
        let html = '';
        produtosEstoqueBaixo.forEach(produto => {
            const percentual = (produto.estoque / produto.estoque_minimo) * 100;
            let classeAlerta = 'bg-danger';
            if (percentual > 75) {
                classeAlerta = 'bg-warning';
            } else if (percentual > 50) {
                classeAlerta = 'bg-warning';
            }
            html += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${produto.nome}</strong>
                        <div class="text-muted small">Código: ${produto.codigo}</div>
                    </div>
                    <div class="text-end">
                        <span class="badge ${classeAlerta}">${produto.estoque}/${produto.estoque_minimo}</span>
                    </div>
                </li>
            `;
        });
        
        listaEl.innerHTML = html;
        document.getElementById('contador-estoque-baixo').textContent = produtosEstoqueBaixo.length;
    } catch (error) {
        console.error('Erro ao carregar produtos com estoque baixo:', error);
    }
}

// Função para carregar pedidos recentes
async function carregarPedidosRecentes() {
    try {
        const pedidos = await window.api.pedidos.getAll();
        
        // Ordenar por data (mais recentes primeiro)
        pedidos.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Limitar a 5 pedidos mais recentes
        const pedidosRecentes = pedidos.slice(0, 5);
        
        const tbody = document.getElementById('tabela-pedidos-recentes');
        
        if (!pedidosRecentes || pedidosRecentes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum pedido registrado</td></tr>';
            return;
        }
        
        let html = '';
        pedidosRecentes.forEach(pedido => {
            // Contar itens do pedido
            const quantidadeItens = pedido.itens ? pedido.itens.length : 0;
            
            html += `
                <tr>
                    <td>${formatarData(pedido.data)}</td>
                    <td>${quantidadeItens} item(s)</td>
                    <td>${pedido.fornecedor_nome}</td>
                    <td>${formatarMoeda(pedido.valor_total)}</td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
    } catch (error) {
        console.error('Erro ao carregar pedidos recentes:', error);
    }
}

// Função para configurar gráficos
function configurarGraficos() {
    // Configurar gráfico de pedidos por fornecedor
    const ctxFornecedores = document.getElementById('grafico-fornecedores');
    if (ctxFornecedores) {
        window.graficoFornecedores = new Chart(ctxFornecedores, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pedidos por Fornecedor',
                    data: [],
                    backgroundColor: 'rgba(58, 134, 255, 0.7)',
                    borderColor: 'rgba(58, 134, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            color: '#aaaaaa'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#aaaaaa'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Configurar gráfico de produtos mais pedidos
    const ctxProdutos = document.getElementById('grafico-produtos');
    if (ctxProdutos) {
        window.graficoProdutos = new Chart(ctxProdutos, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(58, 134, 255, 0.7)',
                        'rgba(131, 56, 236, 0.7)',
                        'rgba(255, 190, 11, 0.7)',
                        'rgba(56, 176, 0, 0.7)',
                        'rgba(255, 0, 110, 0.7)'
                    ],
                    borderColor: [
                        'rgba(58, 134, 255, 1)',
                        'rgba(131, 56, 236, 1)',
                        'rgba(255, 190, 11, 1)',
                        'rgba(56, 176, 0, 1)',
                        'rgba(255, 0, 110, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#aaaaaa'
                        }
                    }
                }
            }
        });
    }
}

// Função para atualizar gráfico de pedidos por fornecedor
function atualizarGraficoPedidosPorFornecedor(dados) {
    if (!window.graficoFornecedores || !dados || dados.length === 0) return;
    
    // Ordenar por total de pedidos (decrescente)
    dados.sort((a, b) => b.total_pedidos - a.total_pedidos);
    
    // Limitar a 5 fornecedores
    const dadosLimitados = dados.slice(0, 5);
    
    // Extrair labels e valores
    const labels = dadosLimitados.map(item => item.nome);
    const valores = dadosLimitados.map(item => item.total_pedidos);
    
    // Atualizar dados do gráfico
    window.graficoFornecedores.data.labels = labels;
    window.graficoFornecedores.data.datasets[0].data = valores;
    
    // Atualizar gráfico
    window.graficoFornecedores.update();
}

// Função para atualizar gráfico de produtos mais pedidos
function atualizarGraficoProdutosMaisPedidos(dados) {
    if (!window.graficoProdutos || !dados || dados.length === 0) return;
    
    // Ordenar por quantidade total (decrescente)
    dados.sort((a, b) => b.quantidade_total - a.quantidade_total);
    
    // Limitar a 5 produtos
    const dadosLimitados = dados.slice(0, 5);
    
    // Extrair labels e valores
    const labels = dadosLimitados.map(item => item.nome);
    const valores = dadosLimitados.map(item => item.quantidade_total);
    
    // Atualizar dados do gráfico
    window.graficoProdutos.data.labels = labels;
    window.graficoProdutos.data.datasets[0].data = valores;
    
    // Atualizar gráfico
    window.graficoProdutos.update();
}
