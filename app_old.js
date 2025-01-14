// const express = require("express");
// const axios = require("axios");
// const app = express();
// const PORT = process.env.PORT || 3000;

// // Assicurati che SHOPIFY_ACCESS_TOKEN sia settato correttamente
// const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
// const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Non includere https://

// // Middleware per il parsing dei JSON
// app.use(express.json());

// // Middleware per ottenere il saldo della gift card tramite GraphQL
// app.get("/api/gift-card/:giftCardCode", async (req, res) => {
//   const giftCardCode = req.params.giftCardCode;

//   // Qui non dobbiamo includere https:// SHOPIFY_SHOP_URL è già completo
//   const endpoint = `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`;

//   console.log(`Chiamata a: ${endpoint}`);

//   const query = `
//     {
//       giftCard(code: "${giftCardCode}") {
//         balance
//         currency
//         code
//       }
//     }
//   `;

//   try {
//     const response = await axios.post(
//       endpoint,
//       { query },
//       {
//         headers: {
//           "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const giftCard = response.data.data.giftCard;

//     if (giftCard) {
//       res.json({
//         success: true,
//         balance: giftCard.balance,
//         currency: giftCard.currency,
//       });
//     } else {
//       res.json({ success: false, message: "Gift card not found" });
//     }
//   } catch (error) {
//     console.error("Error retrieving gift card data:", error.response || error);
//     res.status(500).json({
//       success: false,
//       message: "Error retrieving gift card data",
//       error: error.response ? error.response.data : error.message,
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
// api/gift-card.js
const axios = require("axios");

module.exports = async (req, res) => {
  const { giftCardCode } = req.query; // usa `req.query` o `req.body` per ottenere i dati

  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // dominio Shopify

  const query = `
    {
      giftCard(code: "${giftCardCode}") {
        balance
        currency
        code
      }
    }
  `;

  try {
    const response = await axios.post(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`,
      { query },
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    const giftCard = response.data.data.giftCard;

    if (giftCard) {
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.currency,
      });
    } else {
      res.status(404).json({ success: false, message: "Gift card not found" });
    }
  } catch (error) {
    console.error("Error retrieving gift card data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving gift card data" });
  }
};
