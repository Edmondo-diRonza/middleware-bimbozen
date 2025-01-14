const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardCode = req.query.giftCardCode; // Ottieni il giftCardCode dal parametro della query
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Accedi al token tramite le variabili d'ambiente
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Inserisci il tuo dominio Shopify

  if (!giftCardCode) {
    return res.status(400).json({
      success: false,
      message: "Gift card code is required",
    });
  }

  console.log(`Received gift card code: ${giftCardCode}`);

  try {
    // 1. Fase: Chiamata alla REST API per ottenere la gift card tramite codice
    console.log(
      "Inizio chiamata REST API per cercare la gift card tramite il codice..."
    );

    const restResponse = await axios.get(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/gift_cards.json`,
      {
        headers: {
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        params: {
          code: giftCardCode, // Codice alfanumerico della gift card
        },
      }
    );

    console.log("REST API response received:");
    console.log(JSON.stringify(restResponse.data, null, 2)); // Log completo della risposta

    // Verifica se sono stati trovati dei risultati
    if (
      restResponse.data.gift_cards &&
      restResponse.data.gift_cards.length > 0
    ) {
      const giftCardId = restResponse.data.gift_cards[0].id;
      console.log(`ID della gift card trovato: ${giftCardId}`);

      // 2. Fase: Chiamata a GraphQL per ottenere il saldo della gift card
      const query = `
        {
          giftCard(id: "${giftCardId}") {
            id
            balance {
              amount
              currencyCode
            }
          }
        }
      `;

      console.log(
        "Inizio chiamata GraphQL per ottenere il saldo della gift card..."
      );

      const graphqlResponse = await axios.post(
        `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`,
        { query },
        {
          headers: {
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GraphQL response received:");
      console.log(JSON.stringify(graphqlResponse.data, null, 2)); // Log completo della risposta

      const giftCardData = graphqlResponse.data.data.giftCard;
      if (giftCardData) {
        console.log("Saldo della gift card:");
        console.log(`Amount: ${giftCardData.balance.amount}`);
        console.log(`Currency: ${giftCardData.balance.currencyCode}`);

        res.status(200).json({
          success: true,
          balance: giftCardData.balance.amount,
          currency: giftCardData.balance.currencyCode,
        });
      } else {
        console.log("Gift card non trovata o saldo non disponibile");
        res.status(404).json({
          success: false,
          message: "Gift card not found or invalid ID",
        });
      }
    } else {
      console.log("Gift card non trovata con il codice fornito");
      res.status(404).json({
        success: false,
        message: "Gift card not found with the given code",
      });
    }
  } catch (error) {
    console.error(
      "Errore durante il recupero dei dati della gift card:",
      error
    );
    console.error(
      "Errore completo:",
      error.response ? error.response.data : error.message
    );

    res.status(500).json({
      success: false,
      message: "Error retrieving gift card data",
      error: error.message,
      logs: [
        `Received gift card code: ${giftCardCode}`,
        `Error during API call: ${error.message}`,
        error.response
          ? `Response: ${JSON.stringify(error.response.data, null, 2)}`
          : "",
      ],
    });
  }
};
