const axios = require("axios");

module.exports = async (req, res) => {
  const giftCardId = req.query.giftCardId; // Ottieni l'ID della gift card dal parametro della query
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN; // Accedi al token tramite le variabili d'ambiente
  const SHOPIFY_SHOP_URL = "f3ba51-0b.myshopify.com"; // Inserisci il tuo dominio Shopify

  // La query GraphQL per ottenere i dettagli della gift card e le transazioni
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
    }
  `;

  const variables = {
    id: giftCardId,
    firstTransactions: 5, // Numero di transazioni da recuperare
  };

  try {
    // Fai la richiesta GraphQL a Shopify
    const response = await axios.post(
      `https://${SHOPIFY_SHOP_URL}/admin/api/2025-01/graphql.json`,
      { query, variables },
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
      // Rispondi con i dettagli della gift card e delle transazioni
      res.status(200).json({
        success: true,
        balance: giftCard.balance,
        transactions: giftCard.transactions.nodes,
        giftCardId: giftCard.id, // Aggiungi l'ID della gift card
      });
    } else {
      // Rispondi se la gift card non è stata trovata
      res.status(404).json({
        success: false,
        message: "Gift card not found",
        errors: response.data.errors || null, // Aggiungi errori se ci sono
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
      response: error.response ? error.response.data : null, // Restituisci l'intero oggetto di risposta in caso di errore
    });
  }
};
