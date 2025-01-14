const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardCode = req.query.giftCardCode || req.body.giftCardCode; // Verifica entrambi i casi, query o body
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Accedi al token tramite le variabili d'ambiente
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Inserisci il tuo dominio Shopify

  console.log("Received gift card code:", giftCardCode);

  // Verifica che giftCardCode non sia null o vuoto
  if (!giftCardCode) {
    return res.status(400).json({
      success: false,
      message: "giftCardCode is required and cannot be empty",
    });
  }

  // Rimuovi spazi extra dal giftCardCode
  const giftCardId = giftCardCode.trim();

  console.log("Processed gift card ID:", giftCardId);

  // La query GraphQL per ottenere i dettagli della gift card
  const query = `
    query GiftCardQuery($id: ID!) {
      giftCard(id: $id) {
        balance {
          amount
          currencyCode
        }
      }
    }
  `;

  try {
    console.log("Executing GraphQL request...");

    // Fai la richiesta GraphQL a Shopify
    const response = await axios.post(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`,
      {
        query,
        variables: { id: giftCardId },
      },
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "GraphQL response received:",
      JSON.stringify(response.data, null, 2)
    );

    // Rispondi con i dati della gift card
    res.status(200).json({
      success: true,
      data: response.data,
      logs: [
        `Successfully queried gift card with ID: ${giftCardId}`,
        `Response: ${JSON.stringify(response.data)}`,
      ],
    });
  } catch (error) {
    console.error("Error during GraphQL request:", error);

    // Gestione degli errori nel caso in cui la richiesta fallisca
    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: error.response ? error.response.data : error.message,
      logs: [
        `Error occurred while querying gift card with ID: ${giftCardId}`,
        `Error details: ${JSON.stringify(
          error.response ? error.response.data : error.message
        )}`,
      ],
    });
  }
};
