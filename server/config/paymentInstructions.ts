// Payment Instructions Configuration
// This file can be safely edited by sales/admin team without affecting PDF rendering logic

export const PAYMENT_INSTRUCTIONS = {
  title: "Payment Instructions",
  mainText: "All payments should be made to 4S GRAPHICS, INC. only.",
  methods: [
    {
      type: "ACH Payments",
      details: "Account# 0126734133 | Routing# 063104668 | SWIFT: UPNBUS44 / ABA: 062005690"
    },
    {
      type: "Credit Cards",
      details: "Visa, MasterCard, and AmEx (4.5% processing fee applies)"
    },
    {
      type: "Zelle",
      details: "260-580-0526"
    },
    {
      type: "PayPal",
      details: "info@4sgraphics.com (4.5% fee applies)"
    }
  ],
  shippingNote: "Shipping Costs: At Actuals — Discuss with Sales Rep"
};

export function generatePaymentInstructionsHTML(): string {
  return `
    <div class="footer">
      <p><strong>${PAYMENT_INSTRUCTIONS.title}</strong></p>
      <p>${PAYMENT_INSTRUCTIONS.mainText}</p>
      ${PAYMENT_INSTRUCTIONS.methods.map(method => 
        `<p>${method.type}: ${method.details}</p>`
      ).join('')}
      <p>${PAYMENT_INSTRUCTIONS.shippingNote}</p>
    </div>
  `;
}