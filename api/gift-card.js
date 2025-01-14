const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardCode = req.query.giftCardCode; // Ottieni il codice della gift card dalla query
  const verbose = req.query.verbose === "true"; // Verifica se verbose è true nella query
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Il tuo token di accesso Shopify
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Il dominio del tuo negozio Shopify

  // Log per monitorare l'input
  const logs = verbose ? ["Received gift card code: " + giftCardCode] : [];

  // Controlla se il codice gift card è presente
  if (!giftCardCode) {
    return res.status(400).json({
      success: false,
      message: "Gift card code is required",
      logs,
    });
  }

  try {
    // Effettua la richiesta REST per ottenere i dettagli della gift card tramite il codice
    if (verbose) logs.push("Making API request to Shopify...");
    const response = await axios.get(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/gift_cards.json?code=${giftCardCode}`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    // Log della risposta
    if (verbose)
      logs.push(
        "Gift card response received:",
        JSON.stringify(response.data, null, 2)
      );

    if (response.data.gift_cards && response.data.gift_cards.length > 0) {
      // Se la gift card esiste, restituisci i dettagli, l'ID e il saldo
      const giftCard = response.data.gift_cards[0];
      if (verbose) logs.push("Gift card found. Returning details...");
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        currency: giftCard.currency,
        giftCardCode: giftCard.code,
        giftCardId: giftCard.id, // Aggiungi l'ID della gift card
        createdAt: giftCard.created_at, // Data di creazione
        expiresOn: giftCard.expires_on, // Data di scadenza
        initialValue: giftCard.initial_value, // Valore iniziale
        disabledAt: giftCard.disabled_at, // Data di disabilitazione
        logs,
      });
    } else {
      // Se la gift card non esiste, restituisci un errore
      if (verbose) logs.push("Gift card not found.");
      res.status(404).json({
        success: false,
        message: "Gift card not found",
        logs,
      });
    }
  } catch (error) {
    // Log dell'errore
    if (verbose) logs.push("Error during API call:", error.message);

    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: error.message,
      logs,
    });
  }
};
