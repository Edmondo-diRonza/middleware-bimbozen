const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardCode = req.query.giftCardCode; // Ottieni il giftCardCode dal parametro della query
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Accedi al token tramite le variabili d'ambiente
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Inserisci il tuo dominio Shopify

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
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.currency,
      });
    } else {
      // Rispondi se la gift card non è stata trovata
      res.status(404).json({ success: false, message: "Gift card not found" });
    }
  } catch (error) {
    console.error("Error retrieving gift card data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving gift card data" });
  }
};