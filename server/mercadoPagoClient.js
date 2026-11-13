const API_URL = 'https://api.mercadopago.com';

function createMercadoPagoClient(accessToken, fetchRequest = fetch) {
  if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN is required');

  async function request(path, options = {}) {
    const response = await fetchRequest(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Mercado Pago returned ${response.status}`);
    return response.json();
  }

  return {
    createPreference: ({ tripId, fare, notificationUrl }) => request('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ id: tripId, title: 'Viaje de prueba', quantity: 1, currency_id: 'COP', unit_price: fare }],
        external_reference: tripId,
        notification_url: notificationUrl,
      }),
    }),
    getPayment: (paymentId) => request(`/v1/payments/${encodeURIComponent(paymentId)}`),
    getMerchantOrder: (orderId) => request(`/merchant_orders/${encodeURIComponent(orderId)}`),
  };
}

module.exports = { createMercadoPagoClient };
