require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

const WebSocket = require("ws");

const ws = new WebSocket(process.env.STREAM_URL + "btcusdt@markPrice@1s");
let isOpened = false;

ws.onmessage = (event) => {
  const obj = JSON.parse(event.data);
  console.log("Symbol: ", obj.s);
  console.log("Price: ", obj.p);

  const price = parseFloat(obj.p);

  if (price < 19100 && !isOpened) {
    newOrder("BTCUSDT", "0.001", "SELL");
    console.log("VENDER", isOpened);
    console.log("Symbol: ", obj.s);
    console.log("Price: ", obj.p);
    isOpened = true;
  } else if (price <= 19400 && isOpened) {
    newOrder("BTCUSDT", "0.001", "SELL");
    console.log("COMPRAR", isOpened);
    console.log("Symbol: ", obj.s);
    console.log("Price: ", obj.a);
    isOpened = false;
    newOrder("BTCUSDT", "0.001", "BUY");
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
    url: process.env.API_URL + "/v1/order?" + new URLSearchParams(data),
    headers: { "X-MBX-APIKEY": process.env.API_KEY },
  });

  console.log(result.data);
}
