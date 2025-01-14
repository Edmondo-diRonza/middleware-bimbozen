const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardId = req.query.giftCardId; // Usa l'ID della gift card (non il codice alfanumerico)
  const logs = []; // Array per raccogliere i log

  logs.push(`Received gift card ID: ${giftCardId}`); // Log dell'ID ricevuto

  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Token di accesso
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Dominio Shopify

  // Query GraphQL
  const query = `
    query GiftCardTransactionList($id: ID!, $firstTransactions: Int) {
      giftCard(id: $id) {
        id
        balance {
          amount
          currencyCode
        }
        transactions(first: $firstTransactions) {
          nodes {
            amount {
              amount
              currencyCode
            }
          }
        }
      }
    }`;

  logs.push("Executing GraphQL request..."); // Log prima della richiesta

  try {
    // Fai la richiesta GraphQL a Shopify
    const response = await axios.post(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`,
      {
        query,
        variables: { id: giftCardId, firstTransactions: 5 }, // Passa l'ID della gift card e il numero di transazioni
      },
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    logs.push("GraphQL response received:"); // Log della risposta
    logs.push(JSON.stringify(response.data, null, 2)); // Log dell'intera risposta

    const giftCard = response.data.data.giftCard;

    if (giftCard) {
      logs.push("Gift card found: " + JSON.stringify(giftCard, null, 2)); // Log se la gift card è trovata
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.balance.currencyCode,
        giftCardId: giftCard.id,
        logs, // Aggiungi i log alla risposta
      });
    } else {
      logs.push("Gift card not found"); // Log se la gift card non è trovata
      res.status(404).json({
        success: false,
        message: "Gift card not found",
        error: response.data.errors || null,
        response: response.data,
        logs, // Aggiungi i log alla risposta
      });
    }
  } catch (error) {
    logs.push("Error during GraphQL request: " + error.message); // Log dell'errore

    // Rispondi con il corpo dell'errore completo
    const errorMessage = error.response ? error.response.data : error.message;
    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: errorMessage,
      response: error.response ? error.response.data : null,
      logs, // Aggiungi i log alla risposta
    });
  }
};
