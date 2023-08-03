const purchaseDate = document.querySelector(".date-of-purchase");
const investment = document.querySelector(".investment"); // Cambiado de 'quantity' a 'investment'
const result = document.querySelector(".result");
const currentPriceLabel = document.querySelector(".current-price");
const buyPriceLabel = document.querySelector(".price-on-date");
const submit = document.querySelector(".check");
const process = document.querySelector(".timeout");
const twitterButton = document.querySelector(".twitter-button");


const currentPriceURL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
const historicalPriceURL = "https://api.coingecko.com/api/v3/coins/bitcoin/history?date=";

const clickHandler = () => {
    if (purchaseDate.value && investment.value) {
        showProcess();
        fetchPrices();
    } else {
        updateResult("Inversión o fecha inválida", "grey");
    }
}

async function fetchPrices() {
    let boughtAt = 0;
    let currentPrice = 0;

    await fetch(currentPriceURL)
        .then(response => response.json())
        .then(data => currentPrice = data["bitcoin"]["usd"]);

    await fetch(historicalPriceURL + formatDate(purchaseDate.value))
        .then(response => response.json())
        .then(data => boughtAt = Math.round(data["market_data"]["current_price"]["usd"]));

    setTimeout(() => {
        hideProcess();
    }, 1000);

    buyPriceLabel.innerText = `Comprado a: $${boughtAt}`;
    currentPriceLabel.innerText = `Precio actual: $${currentPrice}`;

    const quantity = investment.value / boughtAt; // Convertir la inversión en Bitcoin en la fecha de compra
    calculateReturns(boughtAt, currentPrice, quantity)
}

const calculateReturns = (buy, current, quantity) => {
    const initialInvestment = buy * quantity;
    const currentValue = current * quantity;
    const date = purchaseDate.value;

    if (initialInvestment > currentValue) {
        const loss = initialInvestment - currentValue;
        const lossPercentage = ((loss / initialInvestment) * 100).toFixed(2);

        updateResult(`Oops! Estás en pérdidas un ${lossPercentage}% con una pérdida total de $${loss.toFixed(2)}`, "red", initialInvestment, date, -loss);
    } else {
        const profit = currentValue - initialInvestment;
        const profitPercentage = ((profit / initialInvestment) * 100).toFixed(2);

        updateResult(`Oh yeah! Estás en beneficios un ${profitPercentage}% con un beneficio total de $${profit.toFixed(2)}`, "green", initialInvestment, date, profit)
    }
}


const formatDate = date => date.split("-").reverse().join("-");

const updateResult = (message, message_color, investment, date, profitOrLoss) => {
    result.innerText = message;
    result.style.color = message_color;

    const totalInvestment = investment + profitOrLoss;

    //cambio formato fecha a dd-mm-yy
    const formattedDate = new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });

    // Crear el texto del tweet
    const tweetText = `Si hubiera invertido ${investment.toFixed(2)}$ en #Bitcoin el ${formattedDate} ahora tendría ${totalInvestment.toFixed(2)}$. Descubre cuanto tendrías tú en https://inversores.club/calculadora-btc/`;

    // Actualizar el enlace del botón de Twitter para incluir el texto del tweet
    twitterButton.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
}

twitterButton.addEventListener("click", (event) => {
    // Abrir el enlace en una nueva ventana
    event.preventDefault();
    window.open(event.target.href, "_blank");
});

const showProcess = () => {
    process.style.display = "block";
    result.style.display = "none";
    twitterButton.style.display = "none";
}

const hideProcess = () => {
    process.style.display = "none";
    result.style.display = "block";
    twitterButton.style.display = "inline-block";
}

submit.addEventListener("click", clickHandler);
