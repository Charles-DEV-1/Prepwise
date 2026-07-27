import crypto from "node:crypto";

const FLUTTERWAVE_API_BASE = "https://api.flutterwave.com/v3";
const FLUTTERWAVE_TIMEOUT_MS = 12000;

type FlutterwaveCustomer = {
  email: string;
  name?: string;
  phonenumber?: string;
};

export type CreateFlutterwavePaymentInput = {
  txRef: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  customer: FlutterwaveCustomer;
  customizations: {
    title: string;
    description: string;
    logo?: string;
  };
  meta?: Record<string, string | number | boolean | null>;
};

export type FlutterwavePaymentLinkResponse = {
  status: string;
  message: string;
  data?: {
    link: string;
  };
};

export type FlutterwaveVerificationData = {
  id: number;
  tx_ref: string;
  flw_ref?: string;
  amount: number;
  charged_amount?: number;
  currency: string;
  status: string;
  customer?: {
    email?: string;
    name?: string;
  };
};

export type FlutterwaveVerificationResponse = {
  status: string;
  message: string;
  data?: FlutterwaveVerificationData;
};

function getFlutterwaveSecretKey() {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Missing FLUTTERWAVE_SECRET_KEY.");
  return key;
}

async function flutterwaveFetch<T>(
  path: string,
  init: RequestInit,
  retries = 2,
): Promise<T> {
  let lastError: unknown;
  const method = init.method?.toUpperCase() ?? "GET";
  const maxRetries = method === "POST" ? 0 : retries;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      FLUTTERWAVE_TIMEOUT_MS,
    );

    try {
      const response = await fetch(`${FLUTTERWAVE_API_BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
          ...init.headers,
        },
        cache: "no-store",
        signal: controller.signal,
      });

      const json = (await response.json().catch(() => null)) as T | null;
      if (!response.ok) {
        const shouldRetry = response.status === 429 || response.status >= 500;
        const message = `Flutterwave request failed with ${response.status}`;
        if (!shouldRetry || attempt === maxRetries) throw new Error(message);
        lastError = new Error(message);
        continue;
      }

      if (!json) throw new Error("Flutterwave returned an invalid response.");
      return json;
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
    } finally {
      clearTimeout(timeout);
    }

    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 250 * 2 ** attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Flutterwave error.");
}

export function createTxRef(userId: string) {
  return `prepcore_${userId.slice(0, 8)}_${Date.now()}_${crypto
    .randomBytes(8)
    .toString("hex")}`;
}

export async function createFlutterwaveCheckout(
  input: CreateFlutterwavePaymentInput,
) {
  return flutterwaveFetch<FlutterwavePaymentLinkResponse>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      customer: input.customer,
      customizations: input.customizations,
      meta: input.meta,
    }),
  });
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
  return flutterwaveFetch<FlutterwaveVerificationResponse>(
    `/transactions/${encodeURIComponent(transactionId)}/verify`,
    { method: "GET" },
  );
}

export function verifyFlutterwaveWebhookSignature(
  rawBody: string,
  headers: Headers,
) {
  function safeEqual(left: string, right: string) {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return (
      leftBuffer.length === rightBuffer.length &&
      crypto.timingSafeEqual(leftBuffer, rightBuffer)
    );
  }

  const hmacSecret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const signature = headers.get("flutterwave-signature");

  if (hmacSecret && signature) {
    const expected = crypto
      .createHmac("sha256", hmacSecret)
      .update(rawBody)
      .digest("base64");

    return safeEqual(signature, expected);
  }

  // Flutterwave's dashboard calls this value "Secret Hash" and sends it in
  // the legacy `verif-hash` header. Reuse the existing webhook-secret env
  // variable so deployments do not need a second copy of the same secret.
  const legacySecretHash =
    process.env.FLUTTERWAVE_SECRET_HASH ??
    process.env.FLUTTERWAVE_WEBHOOK_SECRET;
  const legacyHeader = headers.get("verif-hash");
  if (legacySecretHash && legacyHeader) {
    return safeEqual(legacyHeader, legacySecretHash);
  }

  return false;
}
