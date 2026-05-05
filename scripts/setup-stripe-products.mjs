import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY.");
}

const stripe = new Stripe(secretKey);

const product = await findOrCreateProduct();
const monthlyPrice = await findOrCreatePrice({
  productId: product.id,
  lookupKey: "moneylens_pro_monthly",
  unitAmount: 1500,
  interval: "month"
});
const yearlyPrice = await findOrCreatePrice({
  productId: product.id,
  lookupKey: "moneylens_pro_yearly",
  unitAmount: 9000,
  interval: "year"
});

console.log(
  JSON.stringify(
    {
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id
    },
    null,
    2
  )
);

async function findOrCreateProduct() {
  const products = await stripe.products.list({
    active: true,
    limit: 100
  });

  const existing = products.data.find((product) => product.metadata.app === "moneylens");
  if (existing) return existing;

  return stripe.products.create({
    name: "MoneyLens Pro",
    description: "AI-powered financial insights, coach, and unlimited uploads.",
    metadata: { app: "moneylens" }
  });
}

async function findOrCreatePrice({ productId, lookupKey, unitAmount, interval }) {
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100
  });

  const existing = prices.data.find(
    (price) =>
      price.lookup_key === lookupKey &&
      price.unit_amount === unitAmount &&
      price.recurring?.interval === interval
  );

  if (existing) return existing;

  return stripe.prices.create({
    product: productId,
    currency: "usd",
    unit_amount: unitAmount,
    recurring: { interval },
    lookup_key: lookupKey,
    metadata: { app: "moneylens" }
  });
}
