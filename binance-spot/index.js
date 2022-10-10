require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

const WebSocket = require("ws");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@bookTicker");
let isOpened = false;

ws.onmessage = (event) => {
  const obj = JSON.parse(event.data);
  console.log("Price: ", obj.a);

  const price = parseFloat(obj.a);

  if (price < 19200 && !isOpened) {
    console.log("COMPRAR", isOpened);
    console.log("Symbol: ", obj.s);
    console.log("Price: ", obj.a);
    isOpened = true;
    newOrder("BTCUSDT", "0.001", "BUY");
  } else if (price > 19600 && isOpened) {
    newOrder("BTCUSDT", "0.001", "SELL");
    console.log("VENDER", isOpened);
    console.log("Symbol: ", obj.s);
    console.log("Price: ", obj.a);
    isOpened = false;
  }
};

async function newOrder(symbol, quantity, side) {
  const data = {
    symbol,
    quantity,
    side,
  };
  data.type = "MARKET";
  data.timestamp = Date.now();

  const signature = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(new URLSearchParams(data).toString())
    .digest("hex");

  data.signature = signature;

  const result = await axios({
    method: "POST",
    url: process.env.API_URL + "/v3/order?" + new URLSearchParams(data),
    headers: { "X-MBX-APIKEY": process.env.API_KEY },
  });

  console.log(result.data);
}
