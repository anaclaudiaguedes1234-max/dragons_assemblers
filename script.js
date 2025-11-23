document.addEventListener("DOMContentLoaded", () => {

    const cardContainer = document.querySelector(".cards-container");
    const searchInput = document.querySelector("#search");
    const searchButton = document.querySelector("#botaoBusca");

    // Modal elementos
    const modal = document.querySelector("#modal");
    const modalNome = document.querySelector("#modalNome");
    const modalPeriodo = document.querySelector("#modalPeriodo");
    const modalBio = document.querySelector("#modalBio");
    const fecharModal = document.querySelector("#fecharModal");

    let dados = [];

    async function inicializar() {
        const resp = await fetch("./data.json");
        dados = await resp.json();
        renderizarCards(dados);

        searchButton.addEventListener("click", realizarBusca);
        searchInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") realizarBusca();
        });
    }

    function realizarBusca() {
        const termo = searchInput.value.toLowerCase();
        const filtrados = dados.filter(item => {
            const nomeMatch = item.nome && item.nome.toLowerCase().includes(termo);
            const caracMatch = item.caracteristicas && item.caracteristicas.toLowerCase().includes(termo);
            const montadorMatch = Array.isArray(item.montadores) && item.montadores.some(m => m.nome && m.nome.toLowerCase().includes(termo));
            return nomeMatch || caracMatch || montadorMatch;
        });

        renderizarCards(filtrados);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderizarCards(lista) {
        cardContainer.innerHTML = "";

        lista.forEach(item => {
            const card = document.createElement("article");
            card.className = "card";

            card.innerHTML = `
                <h2>${item.nome}</h2>
                <p>${item.caracteristicas}</p>
                <p><strong>Montadores:</strong></p>
                <ul>
                    ${Array.isArray(item.montadores) ? item.montadores.map(m => `
                        <li><span class="link-montador" data-nome="${(m.nome || 'Desconhecido').replace(/"/g, '&quot;')}">${m.nome || 'Desconhecido'}</span></li>
                    `).join("") : '<li>Sem montadores registrados</li>'}
                </ul>
            `;

            cardContainer.append(card);
        });

        document.querySelectorAll(".link-montador").forEach(link => {
            link.addEventListener("click", () => abrirModal(link.dataset.nome));
        });
    }

    function abrirModal(nome) {
        const montadoresList = dados.flatMap(d => Array.isArray(d.montadores) ? d.montadores : []);
        const montador = montadoresList.find(m => m.nome === nome);

        const modalImg = document.querySelector('#modalImg');

        if (!montador) {
            // Se não encontrar o montador, exibe mensagem amigável em vez de quebrar
            modalNome.textContent = nome || 'Montador não encontrado';
            modalPeriodo.textContent = 'Período: N/D';
            // não mostrar biografia quando não houver informação
            if (modalBio) modalBio.style.display = 'none';
            if (modalImg) modalImg.style.display = 'none';
            modal.style.display = 'flex';
            return;
        }

        modalNome.textContent = montador.nome || 'Nome não disponível';
        modalPeriodo.textContent = montador.periodo || 'Período: N/D';
        if (modalBio) {
            if (montador.bio) {
                modalBio.textContent = montador.bio;
                modalBio.style.display = 'block';
            } else {
                modalBio.style.display = 'none';
            }
        }

        if (modalImg) {
            if (montador.imagemMontador) {
                modalImg.src = montador.imagemMontador;
                modalImg.style.display = 'block';
            } else {
                modalImg.style.display = 'none';
            }
        }

        modal.style.display = "flex";
    }

    fecharModal.addEventListener("click", () => modal.style.display = "none");
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.style.display = "none";
    });

    inicializar();
});
