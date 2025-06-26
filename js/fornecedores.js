// Script para a página de fornecedores
document.addEventListener("DOMContentLoaded", function() {
    // Carregar lista de fornecedores
    carregarFornecedores();
    
    // Configurar eventos
    const btnSalvarFornecedor = document.getElementById("btn-salvar-fornecedor");
    if (btnSalvarFornecedor) {
        btnSalvarFornecedor.addEventListener("click", salvarFornecedor);
    } else {
        console.error("Botão 'btn-salvar-fornecedor' não encontrado.");
    }

    const btnAtualizarFornecedor = document.getElementById("btn-atualizar-fornecedor");
    if (btnAtualizarFornecedor) {
        btnAtualizarFornecedor.addEventListener("click", atualizarFornecedor);
    } else {
        console.error("Botão 'btn-atualizar-fornecedor' não encontrado.");
    }

    const btnLimparFiltro = document.getElementById("btn-limpar-filtro");
    if (btnLimparFiltro) {
        btnLimparFiltro.addEventListener("click", limparFiltros);
    }

    const buscaFornecedor = document.getElementById("busca-fornecedor");
    if (buscaFornecedor) {
        buscaFornecedor.addEventListener("input", filtrarFornecedores);
    }

    const filtroEstado = document.getElementById("filtro-estado");
    if (filtroEstado) {
        filtroEstado.addEventListener("change", filtrarFornecedores);
    }
    
    // Configurar máscaras para CNPJ e telefone
    // Máscara para CNPJ (cadastro) - Permite digitação completa e formata no blur
    const cnpjInput = document.getElementById("cnpj");
    if (cnpjInput) {
        cnpjInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
            if (value.length > 14) {
                value = value.substring(0, 14);
            }
            e.target.value = value; // Apenas permite digitar, sem formatação imediata
        });
        cnpjInput.addEventListener("blur", function(e) { // Formata quando o campo perde o foco
            e.target.value = formatarCNPJInput(e.target.value);
        });
    }

    const telefoneInput = document.getElementById("telefone");
    if (telefoneInput) {
        telefoneInput.addEventListener("input", function(e) {
            e.target.value = formatarTelefoneRealTime(e.target.value);
        });
    }

    
    // Configurar máscaras para campos de edição
    // Máscara para CNPJ (edição) - Permite digitação completa e formata no blur
    const editCnpjInput = document.getElementById("edit-cnpj");
    if (editCnpjInput) {
        editCnpjInput.addEventListener("input", function(e) {
            let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
            if (value.length > 14) {
                value = value.substring(0, 14);
            }
            e.target.value = value; // Apenas permite digitar, sem formatação imediata
        });
        editCnpjInput.addEventListener("blur", function(e) { // Formata quando o campo perde o foco
            e.target.value = formatarCNPJInput(e.target.value);
        });
    }
    
    const editTelefoneInput = document.getElementById("edit-telefone");
    if (editTelefoneInput) {
        editTelefoneInput.addEventListener("input", function(e) {
            e.target.value = formatarTelefoneRealTime(e.target.value);
        });
    }
});

// Função para carregar fornecedores
async function carregarFornecedores() {
    try {
        const fornecedores = await window.api.fornecedores.getAll();
        renderizarFornecedores(fornecedores);
    } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        mostrarAlerta("Erro ao carregar fornecedores. Tente novamente mais tarde.", "danger");
    }
}

// Função para renderizar fornecedores na tabela
function renderizarFornecedores(fornecedores) {
    const tbody = document.getElementById("lista-fornecedores");
    
    if (!tbody) {
        console.error("Elemento 'lista-fornecedores' não encontrado no HTML.");
        return;
    }

    if (!fornecedores || fornecedores.length === 0) {
        tbody.innerHTML = "<tr><td colspan=\"6\" class=\"text-center\">Nenhum fornecedor cadastrado</td></tr>";
        return;
    }
    
    let html = "";
    fornecedores.forEach(fornecedor => {
        html += `
            <tr>
                <td>${fornecedor.nome}</td>
                <td>${formatarCNPJ(fornecedor.cnpj)}</td>
                <td>${fornecedor.cidade}</td>
                <td>${fornecedor.estado || "N/A"}</td>
                <td>${formatarTelefone(fornecedor.telefone) || "N/A"}</td>
                <td>
                    <div class="btn-group" role="group" style="gap: 0.8rem;">
                        <button type="button" class="btn btn-outline-primary btn-md px-2 py-1" onclick="editarFornecedor(${fornecedor.id})" data-bs-toggle="tooltip" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button type="button" class="btn btn-outline-danger btn-md px-2 py-1" onclick="confirmarExclusao(${fornecedor.id})" data-bs-toggle="tooltip" title="Excluir">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Reinicializar tooltips
    const tooltips = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
    tooltips.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
            customClass: "custom-tooltip"
        });
    });
}

// Função para salvar novo fornecedor ou atualizar existente
async function salvarFornecedor() {
    console.log("Tentando salvar fornecedor...");
    // Obter dados do formulário
    const nomeInput = document.getElementById("nome");
    console.log("Elemento 'nome':", nomeInput);
    if (!nomeInput) { console.error("Elemento 'nome' não encontrado."); return; }
    const nome = nomeInput.value.trim();

    const cnpjInput = document.getElementById("cnpj");
    console.log("Elemento 'cnpj':", cnpjInput);
    if (!cnpjInput) { console.error("Elemento 'cnpj' não encontrado."); return; }
    const cnpj = cnpjInput.value.trim().replace(/\D/g, "");

    const cidadeInput = document.getElementById("cidade");
    console.log("Elemento 'cidade':", cidadeInput);
    if (!cidadeInput) { console.error("Elemento 'cidade' não encontrado."); return; }
    const cidade = cidadeInput.value.trim();

    const estadoInput = document.getElementById("estado");
    console.log("Elemento 'estado':", estadoInput);
    if (!estadoInput) { console.error("Elemento 'estado' não encontrado."); return; }
    const estado = estadoInput.value;

    const telefoneInput = document.getElementById("telefone");
    console.log("Elemento 'telefone':", telefoneInput);
    if (!telefoneInput) { console.error("Elemento 'telefone' não encontrado."); return; }
    const telefone = telefoneInput.value.trim().replace(/\D/g, "");

    const emailInput = document.getElementById("email");
    console.log("Elemento 'email':", emailInput);
    if (!emailInput) { console.error("Elemento 'email' não encontrado."); return; }
    const email = emailInput.value.trim();

    const contatoInput = document.getElementById("contato");
    console.log("Elemento 'contato':", contatoInput);
    if (!contatoInput) { console.error("Elemento 'contato' não encontrado."); return; }
    const contato = contatoInput.value.trim();

    const observacoesInput = document.getElementById("observacoes");
    console.log("Elemento 'observacoes':", observacoesInput);
    if (!observacoesInput) { console.error("Elemento 'observacoes' não encontrado."); return; }
    const observacoes = observacoesInput.value.trim();
    
    // Validar campos obrigatórios
    if (!nome || !cnpj || !cidade || !estado) {
        mostrarAlerta("Preencha todos os campos obrigatórios", "warning");
        return;
    }
    
    // Validar CNPJ
    if (cnpj.length !== 14 || !validarCNPJ(cnpj)) {
        mostrarAlerta("CNPJ inválido", "warning");
        return;
    }

    const fornecedor = {
        nome,
        cnpj,
        cidade,
        estado,
        telefone,
        email,
        contato,
        observacoes
    };

    try {
        // Verificar se é edição ou novo cadastro
        const fornecedorIdInput = document.getElementById("fornecedorId");
        let fornecedorId = null;
        if (fornecedorIdInput) {
            fornecedorId = fornecedorIdInput.value;
        }

        if (fornecedorId) {
            await window.api.fornecedores.update(fornecedorId, fornecedor);
            mostrarAlerta("Fornecedor atualizado com sucesso!", "success");
        } else {
            await window.api.fornecedores.create(fornecedor);
            mostrarAlerta("Fornecedor cadastrado com sucesso!", "success");
        }
        
        // Fechar modal
        const modalEl = document.getElementById("modalNovoFornecedor");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Limpar formulário
        document.getElementById("form-fornecedor").reset();
        
        // Recarregar lista de fornecedores
        carregarFornecedores();
    } catch (error) {
        console.error("Erro ao salvar fornecedor:", error);
        mostrarAlerta(`Erro ao salvar fornecedor: ${error.message}`, "danger");
    }
}

// Função para editar fornecedor
async function editarFornecedor(id) {
    console.log("Tentando editar fornecedor com ID:", id);
    try {
        // Buscar fornecedor pelo ID
        const fornecedor = await window.api.fornecedores.getById(id);
        console.log("Fornecedor encontrado para edição:", fornecedor);
        
        // Preencher formulário de edição
        const editIdInput = document.getElementById("edit-id");
        console.log("Elemento 'edit-id':", editIdInput);
        if (!editIdInput) { console.error("Elemento 'edit-id' não encontrado."); return; }
        editIdInput.value = fornecedor.id;

        const editNomeInput = document.getElementById("edit-nome");
        console.log("Elemento 'edit-nome':", editNomeInput);
        if (!editNomeInput) { console.error("Elemento 'edit-nome' não encontrado."); return; }
        editNomeInput.value = fornecedor.nome;

        const editCnpjInput = document.getElementById("edit-cnpj");
        console.log("Elemento 'edit-cnpj':", editCnpjInput);
        if (!editCnpjInput) { console.error("Elemento 'edit-cnpj' não encontrado."); return; }
        editCnpjInput.value = formatarCNPJInput(fornecedor.cnpj); // Usa formatarCNPJInput para exibir formatado

        const editCidadeInput = document.getElementById("edit-cidade");
        console.log("Elemento 'edit-cidade':", editCidadeInput);
        if (!editCidadeInput) { console.error("Elemento 'edit-cidade' não encontrado."); return; }
        editCidadeInput.value = fornecedor.cidade;

        const editEstadoInput = document.getElementById("edit-estado");
        console.log("Elemento 'edit-estado':", editEstadoInput);
        if (!editEstadoInput) { console.error("Elemento 'edit-estado' não encontrado."); return; }
        editEstadoInput.value = fornecedor.estado || "";

        const editTelefoneInput = document.getElementById("edit-telefone");
        console.log("Elemento 'edit-telefone':", editTelefoneInput);
        if (!editTelefoneInput) { console.error("Elemento 'edit-telefone' não encontrado."); return; }
        editTelefoneInput.value = formatarTelefone(fornecedor.telefone) || "";

        const editEmailInput = document.getElementById("edit-email");
        console.log("Elemento 'edit-email':", editEmailInput);
        if (!editEmailInput) { console.error("Elemento 'edit-email' não encontrado."); return; }
        editEmailInput.value = fornecedor.email || "";

        const editContatoInput = document.getElementById("edit-contato");
        console.log("Elemento 'edit-contato':", editContatoInput);
        if (!editContatoInput) { console.error("Elemento 'edit-contato' não encontrado."); return; }
        editContatoInput.value = fornecedor.contato || "";

        const editObservacoesInput = document.getElementById("edit-observacoes");
        console.log("Elemento 'edit-observacoes':", editObservacoesInput);
        if (!editObservacoesInput) { console.error("Elemento 'edit-observacoes' não encontrado."); return; }
        editObservacoesInput.value = fornecedor.observacoes || "";
        
        // Abrir modal de edição
        const modalEl = document.getElementById("modalEditarFornecedor");
        if (!modalEl) { console.error("Modal 'modalEditarFornecedor' não encontrado."); return; }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } catch (error) {
        console.error("Erro ao carregar fornecedor para edição:", error);
        mostrarAlerta("Erro ao carregar dados do fornecedor", "danger");
    }
}

// Função para atualizar fornecedor
async function atualizarFornecedor() {
    console.log("Tentando atualizar fornecedor...");
    // Obter ID do fornecedor
    const idInput = document.getElementById("edit-id");
    console.log("Elemento 'edit-id' para atualização:", idInput);
    if (!idInput) { console.error("Elemento 'edit-id' não encontrado para atualização."); return; }
    const id = idInput.value;
    
    // Obter dados do formulário
    const nomeInput = document.getElementById("edit-nome");
    console.log("Elemento 'edit-nome' para atualização:", nomeInput);
    if (!nomeInput) { console.error("Elemento 'edit-nome' não encontrado para atualização."); return; }
    const nome = nomeInput.value.trim();

    const cnpjInput = document.getElementById("edit-cnpj");
    console.log("Elemento 'edit-cnpj' para atualização:", cnpjInput);
    if (!cnpjInput) { console.error("Elemento 'edit-cnpj' não encontrado para atualização."); return; }
    const cnpj = cnpjInput.value.trim().replace(/\D/g, "");

    const cidadeInput = document.getElementById("edit-cidade");
    console.log("Elemento 'edit-cidade' para atualização:", cidadeInput);
    if (!cidadeInput) { console.error("Elemento 'edit-cidade' não encontrado para atualização."); return; }
    const cidade = cidadeInput.value.trim();

    const estadoInput = document.getElementById("edit-estado");
    console.log("Elemento 'edit-estado' para atualização:", estadoInput);
    if (!estadoInput) { console.error("Elemento 'edit-estado' não encontrado para atualização."); return; }
    const estado = estadoInput.value;

    const telefoneInput = document.getElementById("edit-telefone");
    console.log("Elemento 'edit-telefone':", telefoneInput);
    if (!telefoneInput) { console.error("Elemento 'edit-telefone' não encontrado para atualização."); return; }
    const telefone = telefoneInput.value.trim().replace(/\D/g, "");

    const emailInput = document.getElementById("edit-email");
    console.log("Elemento 'edit-email':", emailInput);
    if (!emailInput) { console.error("Elemento 'edit-email' não encontrado para atualização."); return; }
    const email = emailInput.value.trim();

    const contatoInput = document.getElementById("edit-contato");
    console.log("Elemento 'edit-contato':", contatoInput);
    if (!contatoInput) { console.error("Elemento 'edit-contato' não encontrado para atualização."); return; }
    const contato = contatoInput.value.trim();

    const observacoesInput = document.getElementById("edit-observacoes");
    console.log("Elemento 'observacoes' para atualização:", observacoesInput);
    if (!observacoesInput) { console.error("Elemento 'observacoes' não encontrado para atualização."); return; }
    const observacoes = observacoesInput.value.trim();
    
    // Validar campos obrigatórios
    if (!nome || !cnpj || !cidade || !estado) {
        mostrarAlerta("Preencha todos os campos obrigatórios", "warning");
        return;
    }
    
    // Validar CNPJ
    if (cnpj.length !== 14 || !validarCNPJ(cnpj)) {
        mostrarAlerta("CNPJ inválido", "warning");
        return;
    }
    
    // Criar objeto do fornecedor
    const fornecedor = {
        nome,
        cnpj,
        cidade,
        estado,
        telefone,
        email,
        contato,
        observacoes
    };
    
    try {
        // Atualizar fornecedor
        await window.api.fornecedores.update(id, fornecedor);
        
        // Fechar modal
        const modalEl = document.getElementById("modalEditarFornecedor");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Recarregar lista de fornecedores
        carregarFornecedores();
        
        // Mostrar mensagem de sucesso
        mostrarAlerta("Fornecedor atualizado com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        mostrarAlerta("Erro ao atualizar fornecedor. Tente novamente.", "danger");
    }
}

// Função para confirmar exclusão
function confirmarExclusao(id) {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
        excluirFornecedor(id);
    }
}

// Função para excluir fornecedor
async function excluirFornecedor(id) {
    try {
        // Verificar se há pedidos associados a este fornecedor
        const pedidos = await window.api.pedidos.getAll();
        const temPedidos = pedidos.some(pedido => pedido.fornecedor_id == id);
        
        if (temPedidos) {
            mostrarAlerta("Não é possível excluir este fornecedor pois existem pedidos associados a ele.", "warning");
            return;
        }
        
        // Excluir fornecedor
        await window.api.fornecedores.delete(id);
        
        // Recarregar lista de fornecedores
        carregarFornecedores();
        
        // Mostrar mensagem de sucesso
        mostrarAlerta("Fornecedor excluído com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
        mostrarAlerta("Erro ao excluir fornecedor. Tente novamente.", "danger");
    }
}

// Função para filtrar fornecedores
function filtrarFornecedores() {
    const busca = document.getElementById("busca-fornecedor").value.toLowerCase();
    const estado = document.getElementById("filtro-estado").value;
    
    // Carregar fornecedores do servidor e aplicar filtros
    carregarFornecedoresFiltrados(busca, estado);
}

// Função para carregar fornecedores filtrados
async function carregarFornecedoresFiltrados(busca = '', estado = '') {
    try {
        let fornecedores;
        
        if (estado && estado !== '') {
            // Filtrar por estado específico
            console.log('Filtrando por estado:', estado);
            fornecedores = await window.api.fornecedores.getByEstado(estado);
            console.log('Fornecedores encontrados para o estado:', fornecedores);
        } else {
            // Carregar todos os fornecedores
            fornecedores = await window.api.fornecedores.getAll();
        }
        
        // Aplicar filtro de busca se necessário
        if (busca) {
            fornecedores = fornecedores.filter(fornecedor => 
                fornecedor.nome.toLowerCase().includes(busca.toLowerCase()) || 
                fornecedor.cnpj.includes(busca) ||
                fornecedor.cidade.toLowerCase().includes(busca.toLowerCase())
            );
        }
        
        console.log('Fornecedores filtrados finais:', fornecedores);
        renderizarFornecedores(fornecedores);
    } catch (error) {
        console.error('Erro ao filtrar fornecedores:', error);
        mostrarAlerta('Erro ao filtrar fornecedores. Tente novamente.', 'danger');
    }
}

// Função para limpar filtros
function limparFiltros() {
    document.getElementById("busca-fornecedor").value = "";
    document.getElementById("filtro-estado").value = "";
    carregarFornecedores();
}

// Funções auxiliares de formatação e validação (se não estiverem em main.js)
function formatarCNPJ(cnpj) {
    if (!cnpj) return "";
    cnpj = cnpj.replace(/\D/g, "");
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatarTelefone(telefone) {
    if (!telefone) return "";
    telefone = telefone.replace(/\D/g, "");
    if (telefone.length === 11) {
        return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (telefone.length === 10) {
        return telefone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }
    return telefone;
}

function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj == "") return false;
    if (cnpj.length != 14) return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" || 
        cnpj == "11111111111111" || 
        cnpj == "22222222222222" || 
        cnpj == "33333333333333" || 
        cnpj == "44444444444444" || 
        cnpj == "55555555555555" || 
        cnpj == "66666666666666" || 
        cnpj == "77777777777777" || 
        cnpj == "88888888888888" || 
        cnpj == "99999999999999")
        return false;
         
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0,tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
         
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
          return false;
           
    return true;
}

// Nova função auxiliar para formatar CNPJ para exibição no input
// Esta função apenas formata, não limita a entrada
function formatarCNPJInput(value) {
    value = value.replace(/\D/g, ""); // Garante que só tem dígitos
    
    if (value.length > 12) {
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, "$1.$2.$3/$4-$5");
    } else if (value.length > 8) {
        return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
        return value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, "$1.$2.$3");
    } else if (value.length > 2) {
        return value.replace(/^(\d{2})(\d{0,3}).*/, "$1.$2");
    }
    return value;
}
function formatarTelefoneRealTime(value) {
    let cleanedValue = value.replace(/\D/g, ""); // Remove tudo que não é dígito
    
    // Limita a 11 dígitos numéricos
    if (cleanedValue.length > 11) {
        cleanedValue = cleanedValue.substring(0, 11);
    }

    let formattedValue = "";

    if (cleanedValue.length > 0) {
        formattedValue += "(" + cleanedValue.substring(0, 2);
    }
    if (cleanedValue.length > 2) {
        formattedValue += ") " + cleanedValue.substring(2, 7);
    }
    if (cleanedValue.length > 7) {
        formattedValue += "-" + cleanedValue.substring(7, 11);
    }
    
    return formattedValue;
}
