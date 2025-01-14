const express = require("express");
const axios = require("axios");
const app = express();
const PORT = process.env.PORT || 3000;

// Configura le credenziali API di Shopify
const SHOPIFY_ACCESS_TOKEN = "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"; // Utilizza il tuo access token di accesso
const SHOPIFY_SHOP_URL = "https://f3ba51-0b.myshopify.com"; // Sostituisci con il tuo dominio Shopify

// Middleware per ottenere il saldo della gift card tramite GraphQL
app.get("/api/gift-card/:giftCardCode", async (req, res) => {
  const giftCardCode = req.params.giftCardCode;

  // La query GraphQL per ottenere i dettagli della gift card
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
    // Fai la richiesta GraphQL a Shopify
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

    // Estrai i dati dalla risposta GraphQL
    const giftCard = response.data.data.giftCard;

    if (giftCard) {
      // Rispondi con i dettagli della gift card
      res.json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.currency,
      });
    } else {
      // Rispondi se la gift card non è stata trovata
      res.json({ success: false, message: "Gift card not found" });
    }
  } catch (error) {
    console.error("Error retrieving gift card data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving gift card data" });
  }
});

// Avvia il server Express
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
