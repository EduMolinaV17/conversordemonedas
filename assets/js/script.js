const input = document.querySelector("#input");
const resultado = document.querySelector("#resultado");
const select = document.querySelector("#moneda");
const urlDolar = "https://www.mindicador.cl/api/dolar";
const urlEuro = "https://www.mindicador.cl/api/euro";
const urlUf = "https://www.mindicador.cl/api/uf";
const urlUtm = "https://www.mindicador.cl/api/utm";
let datos = {};
let myChart;
const btnBuscar = document.querySelector("#btnBuscar");
const getApiDatos = async (url) => {
  try {
    const resValor = await fetch(url);
    if(!resValor.ok){
        throw new Error(alert(`HTTP error! El servidor no responde status: ${resValor.status}`))
    }
    return await resValor.json();
  } catch (error) {
    console.error(`Se ha producido un error con la Api ${error}`)
    alert(`Se ha producido un error con la Api ${error}`)
  } 
};
const agregarAlSelect = (datos) => {
  const data = [datos];
  select.innerHTML = data.map((dato) => `
    <option disabled selected>Seleccionar Divisa</option>
    <option value="${dato.dolar.codigo}">${dato.dolar.nombre.toUpperCase()}</option>
    <option value="${dato.euro.codigo}">${dato.euro.nombre.toUpperCase()}</option>
    <option value="${dato.uf.codigo}">${dato.uf.nombre.toUpperCase()}</option>
    <option value="${dato.utm.codigo}">${dato.utm.nombre.toUpperCase()}</option>`).join("");
};
const getDatos = async () => {
    try {
        datos.dolar = await getApiDatos(urlDolar);
        datos.euro = await getApiDatos(urlEuro);
        datos.uf = await getApiDatos(urlUf);
        datos.utm = await getApiDatos(urlUtm);
        datos.dolar.time = { tiempo: ["días"] };
        datos.euro.time = { tiempo: ["días"] };
        datos.uf.time = { tiempo: ["días"] };
        datos.utm.time = { tiempo: ["meses"] };
        agregarAlSelect(datos);
    } catch (error) {
        console.error(`Se ha producido un error con la Api ${error}`)
        alert(`Se ha producido un error con la Api ${error}`) 
    }
};
getDatos();
const conversor = () => {
  const montoCLP = Number(input.value);
  const selector = select.value;
  if (selector === "dolar") {
    const montoDolar = montoCLP / datos.dolar.serie[0].valor;
    resultado.innerHTML = `$ ${montoDolar.toLocaleString("USD")}`;
    const valor = getGrafica(datos.dolar);
    renderGrafica(valor);
  } else if (selector === "euro") {
    const montoEuro = montoCLP / datos.euro.serie[0].valor;
    resultado.innerHTML = `€ ${montoEuro.toLocaleString("EUR")}`;
    const valor = getGrafica(datos.euro);
    renderGrafica(valor);
  } else if (selector === "uf") {
    const montoUf = montoCLP / datos.uf.serie[0].valor;
    resultado.innerHTML = `${montoUf.toLocaleString("CLP").replace(",", ".")} UF`;
    const valor = getGrafica(datos.uf);
    renderGrafica(valor);
  } else if (selector === "utm") {
    const montoUtm = montoCLP / datos.utm.serie[0].valor;
    resultado.innerHTML = `${montoUtm.toLocaleString("CLP").replace(",", ".")} UTM`;
    const valor = getGrafica(datos.utm);
    renderGrafica(valor);
  }
  /* select.selectedIndex = 0   OPCION PARA RESETEAR EL SELECT*/
};
btnBuscar.addEventListener("click", conversor);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    conversor();
  }
});
const borrarInput = () => {
  if (input.placeholder !== "") {
    input.placeholder = "";
  }
};
input.addEventListener("click", borrarInput);
const getGrafica = (serie) => {
  const fechas = serie.serie.map((dias) => new Date(dias.fecha).toLocaleDateString());
  const valores = serie.serie.map((valores) => valores.valor);
  const labels = fechas.slice(0, 10).reverse();
  const data = valores.slice(0, 10).reverse();
  const datasets = [
    {
      label: `${serie.nombre}: Historial últimos 10 ${serie.time.tiempo}`,
      borderColor: "#a378ba",
      backgroundColor: "#1b8332",
      data,
    },
  ];
  return { labels, datasets };
};
const renderGrafica = (data) => {
  const config = {
    type: "line",
    data,
  };
  const miChart = document.querySelector("#myChart");
  miChart.style.backgroundColor = "white";
  if (myChart) {
    myChart.destroy();
  }
  myChart = new Chart(miChart, config);
};
