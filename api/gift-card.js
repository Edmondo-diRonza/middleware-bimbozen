const axios = require("axios");

module.exports = async (req, res) => {
  // Ottieni il giftCardCode dal parametro della query
  const giftCardCode = req.query.giftCardCode;
  console.log("Received gift card code:", giftCardCode);

  // Assicurati che il giftCardCode sia presente
  if (!giftCardCode) {
    console.error("Gift card code is missing in the request.");
    return res.status(400).json({
      success: false,
      message: "Gift card code is required",
    });
  }

  // Rimuovi gli spazi dal codice della gift card, se presenti
  const cleanedGiftCardCode = giftCardCode.replace(/\s+/g, "");
  console.log("Cleaned gift card code:", cleanedGiftCardCode);

  // Imposta le credenziali Shopify
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Inserisci il tuo dominio Shopify
  console.log("Using Shopify shop URL:", SHOPIFY_SHOP_URL);

  // La query GraphQL per ottenere i dettagli della gift card
  const query = `
    {
      giftCard(code: "${cleanedGiftCardCode}") {
        balance
        currency
        code
      }
    }
  `;
  console.log("GraphQL query to send to Shopify:", query);

  try {
    // Fai la richiesta GraphQL a Shopify
    console.log("Sending request to Shopify...");
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

    console.log("Response received from Shopify:", response.data);

    // Estrai i dati dalla risposta GraphQL
    const giftCard = response.data.data.giftCard;
    if (giftCard) {
      // Rispondi con i dettagli della gift card
      console.log("Gift card found:", giftCard);
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.currency,
        giftCardCode: giftCard.code, // Aggiunto giftCardCode per completezza
      });
    } else {
      // Rispondi se la gift card non è stata trovata
      console.error("Gift card not found in the response.");
      res.status(404).json({
        success: false,
        message: "Gift card not found",
        error: response.data.errors || null, // Aggiungi errori se ci sono
        response: response.data, // Restituisci l'intero oggetto di risposta
      });
    }
  } catch (error) {
    console.error("Error retrieving gift card data:", error);

    // Rispondi con il corpo dell'errore completo se disponibile
    const errorMessage = error.response ? error.response.data : error.message;
    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: errorMessage, // Aggiungi il messaggio di errore completo
      response: error.response ? error.response.data : null, // Restituisci l'intero oggetto di risposta se disponibile
    });
  }
};
