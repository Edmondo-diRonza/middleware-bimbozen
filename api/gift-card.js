const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardCode = req.query.giftCardCode; // Ottieni il codice della gift card dalla query
  if (!giftCardCode) {
    return res
      .status(400)
      .json({ success: false, message: "Gift card code is required" });
  }

  // Rimuovi gli spazi dal codice della gift card
  const cleanedGiftCardCode = giftCardCode.replace(/\s+/g, ""); // Rimuove gli spazi

  // Configura le credenziali API di Shopify
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Il tuo token di accesso
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Il dominio del tuo negozio Shopify

  // La query GraphQL per ottenere i dettagli della gift card
  const query = `
    {
      giftCard(code: "${cleanedGiftCardCode}") {
        id
        balance {
          amount
          currencyCode
        }
        code
        transactions(first: 10) {
          nodes {
            amount {
              amount
              currencyCode
            }
          }
        }
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

    // Estrai i dati dalla risposta
    const giftCard = response.data.data.giftCard;

    if (giftCard) {
      // Rispondi con i dettagli della gift card
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.balance.currencyCode,
        giftCardCode: giftCard.code,
        transactions: giftCard.transactions.nodes,
      });
    } else {
      // Se la gift card non è stata trovata
      res.status(404).json({
        success: false,
        message: "Gift card not found",
        error: response.data.errors || null,
        response: response.data,
      });
    }
  } catch (error) {
    console.error("Error retrieving gift card data:", error);

    // Rispondere con un errore completo
    const errorMessage = error.response ? error.response.data : error.message;
    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: errorMessage,
      response: error.response ? error.response.data : null,
    });
  }
};
