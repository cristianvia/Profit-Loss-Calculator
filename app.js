const purchaseDate = document.querySelector(".date-of-purchase");
const investment = document.querySelector(".investment"); // Cambiado de 'quantity' a 'investment'
const result = document.querySelector(".result");
const currentPriceLabel = document.querySelector(".current-price");
const buyPriceLabel = document.querySelector(".price-on-date");
const submit = document.querySelector(".check");
const process = document.querySelector(".timeout");

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

    if (initialInvestment > currentValue) {
        const loss = initialInvestment - currentValue;
        const lossPercentage = Math.round((loss / initialInvestment) * 100);

        updateResult(`Oops! Estarías en pérdidas un ${lossPercentage}% con una pérdida de $${loss.toFixed(2)}`, "red");
    } else {
        const profit = currentValue - initialInvestment;
        const profitPercentage = Math.round((profit / initialInvestment) * 100);

        updateResult(`Oh yeah! Estarías en beneficios un ${profitPercentage}% con un beneficio de $${profit.toFixed(2)}`, "green")
    }
}


const formatDate = date => date.split("-").reverse().join("-");

const updateResult = (message, message_color) => {
    result.innerText = message;
    result.style.color = message_color;
}

const showProcess = () => {
    process.style.display = "block";
    result.style.display = "none";
}

const hideProcess = () => {
    process.style.display = "none";
    result.style.display = "block";
}

submit.addEventListener("click", clickHandler);
