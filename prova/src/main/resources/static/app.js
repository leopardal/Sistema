// script.js (unificado)
// Responsável por: abas, modal de confirmação, criar pedido via API, listar e avançar status

document.addEventListener('DOMContentLoaded', () => {
    // Elementos
    const btnFinalizar = document.querySelector('#pedido button') || document.querySelector('.container button');
    const saborInputs = document.querySelectorAll('input[name="sabor"]');
    const tamanhoInputs = document.querySelectorAll('input[name="tamanho"]');

    // Cria modal (apenas uma vez)
    const modal = createConfirmationModal();
    document.body.appendChild(modal.overlay);

    // Evento do botão Finalizar (abre modal e envia para backend se confirmado)
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', async (e) => {
            e.preventDefault();

            const sabor = getCheckedValue(saborInputs) || 'Não selecionado';
            const tamanho = getCheckedValue(tamanhoInputs) || 'Não selecionado';

            // Preenche modal
            modal.title.textContent = 'Confirmar Pedido';
            modal.body.textContent = `Sabor: ${sabor}\nTamanho: ${tamanho}`;
            modal.confirmBtn.disabled = false;
            modal.cancelBtn.style.display = 'inline-block';
            modal.confirmBtn.textContent = 'Confirmar';

            openModal(modal);

            const confirmed = await waitForModalConfirmation(modal);
            if (!confirmed) return;

            try {
                setLoadingState(modal, true);

                const response = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sabor, tamanho })
                });

                if (!response.ok) {
                    throw new Error('Erro no servidor: ' + response.status);
                }

                const result = await response.json();

                setLoadingState(modal, false);
                modal.body.textContent = `Pedido salvo! ID: ${result.id}\nSabor: ${result.sabor} • Tamanho: ${result.tamanho}`;
                modal.confirmBtn.textContent = 'Fechar';
                modal.cancelBtn.style.display = 'none';
                modal.confirmBtn.focus();

                // Atualiza lista e abre aba Pedidos
                setTimeout(() => {
                    closeModal(modal);
                    const btnPedidos = document.querySelector("button[onclick*=\"mostrarAba('pedidos'\"]");
                    if (btnPedidos) btnPedidos.click();
                    else carregarPedidos();
                }, 900);
            } catch (err) {
                setLoadingState(modal, false);
                modal.body.textContent = 'Erro ao enviar pedido. ' + (err.message || '');
                modal.confirmBtn.textContent = 'Fechar';
                modal.cancelBtn.style.display = 'inline-block';
            }
        });
    }

    // Ao clicar na aba Pedidos, carrega pedidos
    const btnAbrirPedidos = document.querySelector("button[onclick*=\"mostrarAba('pedidos'\"]");
    if (btnAbrirPedidos) {
        btnAbrirPedidos.addEventListener('click', carregarPedidos);
    }
});

/* ---------------------------
   Funções de abas e navegação
   --------------------------- */
function mostrarAba(id, botao) {
    document.querySelectorAll(".aba").forEach(aba => aba.classList.remove("ativa"));
    document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
    document.getElementById(id).classList.add("ativa");
    if (botao) botao.classList.add("active");

    if (id === "pedidos") carregarPedidos();
}

/* ---------------------------
   Criar / Listar / Avançar
   --------------------------- */
async function criarPedido() {
    // Esta função permanece para compatibilidade caso o HTML chame diretamente criarPedido()
    // Ela apenas delega para o fluxo que abre o modal (o listener principal já faz isso).
    const btn = document.querySelector('#pedido button') || document.querySelector('.container button');
    if (btn) btn.click();
}

async function carregarPedidos() {
    try {
        const res = await fetch('/api/pedidos');
        if (!res.ok) return;
        const pedidos = await res.json();
        const lista = document.getElementById("listaPedidos");
        if (!lista) return;
        lista.innerHTML = "";

        // Exibir do mais recente para o mais antigo
        pedidos.slice().reverse().forEach(p => {
            const card = document.createElement("div");
            card.className = "cardPedido";
            card.innerHTML = `
            <h3>Pedido #${p.id}</h3>
                
            <p>
                <strong>Sabor:</strong>
                ${p.sabor}
            </p>
                
            <p>
                <strong>Tamanho:</strong>
                ${p.tamanho}
            </p>
                
            <p>
                <strong>Status:</strong>
                <span class="status ${classeStatus(p.status)}">
                    ${textoStatus(p.status)}
                </span>
            </p>
                
            <button
                class="btnStatus"
                data-id="${p.id}"
                ${p.status === 'ENTREGUE' ? 'disabled' : ''}>
                ${p.status === 'ENTREGUE'
                    ? 'Pedido Finalizado'
                    : 'Próximo Status'}
            </button>
        `;
            lista.prepend(card);

            const btn = card.querySelector(".btnStatus");
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;
                const r = await fetch(`/api/pedidos/${id}/avancar`, { method: 'POST' });
                if (r.ok) carregarPedidos();
            });
        });
    } catch (err) {
        console.error('Erro ao carregar pedidos', err);
    }
}

function classeStatus(status) {
    switch (status) {
        case 'RECEBIDO': return 'recebido';
        case 'PREPARANDO': return 'preparando';
        case 'CAMINHO': return 'caminho';
        case 'ENTREGUE': return 'entregue';
        default: return '';
    }
}
function textoStatus(status) {
    switch (status) {
        case 'RECEBIDO':
            return '📥 Recebido';

        case 'PREPARANDO':
            return '👨‍🍳 Preparando';

        case 'CAMINHO':
            return '🛵 A Caminho';

        case 'ENTREGUE':
            return '✅ Entregue';

        default:
            return status;
    }
}

/* ---------------------------
   Helpers do formulário
   --------------------------- */
function getCheckedValue(nodeList) {
    for (const el of nodeList) {
        if (el.checked) return document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim() || el.id;
    }
    return null;
}

/* ---------------------------
   Modal de confirmação reutilizável
   --------------------------- */
function createConfirmationModal() {
    // overlay
    const overlay = document.createElement('div');
    overlay.className = 'js-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = `
    position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.45);z-index:9999;visibility:hidden;opacity:0;transition:opacity .18s;
  `;

    // box
    const box = document.createElement('div');
    box.style.cssText = `
    width:320px;background:#fff;padding:18px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.25);
    font-family:inherit;color:#222;white-space:pre-line;
  `;

    const title = document.createElement('h3');
    title.style.margin = '0 0 8px 0';
    title.style.fontSize = '18px';
    title.style.color = '#960018';

    const body = document.createElement('p');
    body.style.margin = '0 0 14px 0';
    body.style.lineHeight = '1.4';

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;align-items:center';

    const loading = document.createElement('span');
    loading.textContent = 'Enviando...';
    loading.style.cssText = 'font-size:13px;color:#666;display:none;margin-right:auto';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.style.cssText = `
    padding:8px 12px;border-radius:10px;border:none;background:#f2f2f2;color:#333;cursor:pointer;
  `;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Confirmar';
    confirmBtn.style.cssText = `
    padding:8px 12px;border-radius:10px;border:none;background:#009246;color:#fff;cursor:pointer;font-weight:700;
  `;

    // Eventos
    cancelBtn.addEventListener('click', () => closeModal({ overlay, confirmBtn, cancelBtn, loading }));
    overlay.addEventListener('click', (ev) => {
        if (ev.target === overlay) closeModal({ overlay, confirmBtn, cancelBtn, loading });
    });

    // keyboard: Esc fecha
    overlay.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') closeModal({ overlay, confirmBtn, cancelBtn, loading });
    });

    footer.appendChild(loading);
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    box.appendChild(title);
    box.appendChild(body);
    box.appendChild(footer);
    overlay.appendChild(box);

    return { overlay, title, body, footer, confirmBtn, cancelBtn, loading };
}

function openModal(modalObj) {
    const overlay = modalObj.overlay;
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    // focus no botão confirmar para acessibilidade
    setTimeout(() => modalObj.confirmBtn.focus(), 80);
}

function closeModal(modalObj) {
    const overlay = modalObj.overlay;
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    // reset modal text/buttons to defaults for next use
    if (modalObj.confirmBtn) {
        modalObj.confirmBtn.textContent = 'Confirmar';
        modalObj.cancelBtn.style.display = 'inline-block';
        modalObj.loading.style.display = 'none';
        modalObj.confirmBtn.disabled = false;
        modalObj.cancelBtn.disabled = false;
    }
}

function setLoadingState(modalObj, isLoading) {
    modalObj.confirmBtn.disabled = isLoading;
    modalObj.cancelBtn.disabled = isLoading;
    modalObj.loading.style.display = isLoading ? 'inline-block' : 'none';
}

// Retorna uma Promise que resolve true/false conforme escolha do usuário
function waitForModalConfirmation(modalObj) {
    return new Promise((resolve) => {
        const onConfirm = () => {
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            cleanup();
            resolve(false);
        };
        function cleanup() {
            modalObj.confirmBtn.removeEventListener('click', onConfirm);
            modalObj.cancelBtn.removeEventListener('click', onCancel);
        }
        modalObj.confirmBtn.addEventListener('click', onConfirm);
        modalObj.cancelBtn.addEventListener('click', onCancel);
    });
}
window.mostrarAba = mostrarAba;
window.criarPedido = criarPedido;
window.carregarPedidos = carregarPedidos;
