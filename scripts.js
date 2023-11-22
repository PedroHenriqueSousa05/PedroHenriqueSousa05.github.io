const pedidosPorPagina = 20;
const totalMaximoPedidos = 100;
let paginaAtual = 1;

function fetchDataAndDisplay(pagina) {
  fetch("http://localhost:3000/integracoes/pedidos/detalhes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao buscar dados");
      }
      return response.json();
    })
    .then((data) => {
      const dadosPedidoDiv = document.getElementById("dadosPedido");
      const paginationDiv = document.getElementById("pagination");

      dadosPedidoDiv.innerHTML = "";

      let registros = [];
      data.forEach((item) => {
        registros = [...registros, ...item.registros];
      });

      registros.sort((a, b) => {
        const dataA = new Date(a.ultima_atualizacao).getTime();
        const dataB = new Date(b.ultima_atualizacao).getTime();
        const horaAtual = Date.now();
        const diferencaA = Math.abs(horaAtual - dataA);
        const diferencaB = Math.abs(horaAtual - dataB);
        return diferencaA - diferencaB; // Ajustado para ordem decrescente
      });

      const paginas = Math.ceil(registros.length / pedidosPorPagina);

      const inicio = (pagina - 1) * pedidosPorPagina;
      const fim = pagina * pedidosPorPagina;
      const pedidosDaPagina = registros.slice(inicio, fim);

      pedidosDaPagina.forEach((pedido) => {
        const pedidoDiv = document.createElement("div");
        pedidoDiv.classList.add("pedido");

        const identificacaoDiv = createInfoSection(
          "Identificação",
          ["Pedido", "Plataforma", "Status", "Data"],
          ["pedido_id", "plataforma.nome", "status", "ultima_atualizacao"],
          pedido
        );

        const produtosDiv = document.createElement("div");
        produtosDiv.classList.add("produtos");

        pedido.produtos.forEach((produto, index) => {
          const produtoDiv = createInfoSection(
            `Produto ${index + 1}`,
            ["Descrição", "SKU", "Quantidade", "Valor Unitário"],
            ["descricao", "sku", "qtde", "valor_unitario"],
            produto
          );
          produtosDiv.appendChild(produtoDiv);
        });

        const valoresDiv = createInfoSection(
          "Valores",
          ["Valor Total Pedido", "Desconto", "Frete"],
          ["total_pedido", "total_desconto", "total_frete"],
          pedido
        );

        pedidoDiv.appendChild(identificacaoDiv);
        pedidoDiv.appendChild(produtosDiv);
        pedidoDiv.appendChild(valoresDiv);

        dadosPedidoDiv.appendChild(pedidoDiv);
      });
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
    });
}

function createInfoSection(title, labels, keys, data) {
  const sectionDiv = document.createElement("div");
  sectionDiv.classList.add("info-section");

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("section-title");
  titleDiv.textContent = title;

  sectionDiv.appendChild(titleDiv);

  labels.forEach((label, index) => {
    const detailDiv = document.createElement("div");
    detailDiv.classList.add("detail");

    const key = keys[index];
    const value = key.split(".").reduce((obj, property) => obj[property], data);

    detailDiv.innerHTML = `<span class="label">${label}:</span> <span class="value">${value}</span>`;
    sectionDiv.appendChild(detailDiv);
  });

  return sectionDiv;
}

function agendarRequisicao() {
  setInterval(async () => {
    await fetchDataAndDisplay(paginaAtual);
  }, 1 * 60 * 1000);
}

fetchDataAndDisplay(paginaAtual);
agendarRequisicao();
