import { useState } from "react";
import type {
  StandardPaymentRequest,
  PaymentResult,
  PaymentAdapter,
  MpesaConfig,
  FlutterwaveConfig,
} from "@/types";

// Base adapter for all African payment systems
export abstract class AfricanPaymentAdapter implements PaymentAdapter {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly country: string;
  abstract readonly currencies: string[];

  // Standardized interface
  abstract processPayment(
    request: StandardPaymentRequest,
  ): Promise<PaymentResult>;
  abstract validateReference(reference: string): Promise<boolean>;
  abstract getTransactionStatus(reference: string): Promise<any>;
}

// M-Pesa Kenya Implementation
export class MpesaKenyaAdapter extends AfricanPaymentAdapter {
  readonly id = "mpesa-kenya";
  readonly name = "M-Pesa Kenya";
  readonly country = "KE";
  readonly currencies = ["KES"];

  constructor(private config: MpesaConfig) {
    super();
  }

  async processPayment(
    request: StandardPaymentRequest,
  ): Promise<PaymentResult> {
    try {
      // M-Pesa STK Push implementation
      const response = await fetch(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: this.config.shortCode,
            Password: this.config.password,
            Timestamp: this.getTimestamp(),
            TransactionType: "CustomerPayBillOnline",
            Amount: request.amount,
            PartyA: request.phoneNumber,
            AccountReference: request.reference,
            CallBackURL: this.config.callbackUrl,
            TransactionDesc: request.metadata?.notes || "Payment",
          }),
        },
      );

      const result = await response.json();

      return {
        success: result.ResponseCode === "0",
        transactionId: result.MerchantRequestID,
        reference: result.CheckoutRequestID,
        amount: request.amount,
        status: result.ResponseCode === "0" ? "completed" : "failed",
        error:
          result.ResponseCode !== "0" ? result.ResponseDescription : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async validateReference(reference: string): Promise<boolean> {
    // Basic validation for M-Pesa reference format
    return /^[A-Z0-9]{10,15}$/.test(reference);
  }

  async getTransactionStatus(reference: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query?checkoutRequestID=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        },
      );

      const result = await response.json();
      return {
        success: result.ResponseCode === "0",
        status: result.ResultCode,
        amount: result.TransactionAmount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private getAccessToken(): string {
    // Generate access token for M-Pesa API
    return Buffer.from(
      `${this.config.shortCode}:${this.config.password}:${this.getTimestamp()}`,
    ).toString("base64");
  }

  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}

// Flutterwave Nigeria Implementation
export class FlutterwaveNigeriaAdapter extends AfricanPaymentAdapter {
  readonly id = "flutterwave-nigeria";
  readonly name = "Flutterwave Nigeria";
  readonly country = "NG";
  readonly currencies = ["NGN"];

  constructor(private config: FlutterwaveConfig) {
    super();
  }

  async processPayment(
    request: StandardPaymentRequest,
  ): Promise<PaymentResult> {
    try {
      // Flutterwave implementation
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `FLWSECK-SECRET:${this.config.secretKey}`,
        },
        body: JSON.stringify({
          tx_ref: request.reference,
          amount: request.amount,
          currency: request.currency,
          payment_options: "card, mobilemoney",
          customer: {
            email: request.metadata?.customerEmail,
            phonenumber: request.phoneNumber,
          },
          customizations: {
            title: request.metadata?.notes || "Payment",
            description: request.metadata?.customerName || "Customer Payment",
          },
        }),
      });

      const result = await response.json();

      return {
        success: result.status === "successful",
        transactionId: result.id,
        reference: result.tx_ref,
        amount: result.amount,
        status: result.status,
        error: result.status === "successful" ? undefined : result.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async validateReference(reference: string): Promise<boolean> {
    // Basic validation for Flutterwave reference format
    return /^FLW[a-zA-Z0-9]{10,25}$/.test(reference);
  }

  async getTransactionStatus(reference: string): Promise<any> {
    try {
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/${reference}/verify`,
        {
          headers: {
            Authorization: `FLWSECK-SECRET:${this.config.secretKey}`,
          },
        },
      );

      const result = await response.json();
      return {
        success: result.status === "successful",
        status: result.status,
        amount: result.amount,
        currency: result.currency,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Integration Manager for handling multiple adapters
export class AfricanIntegrationManager {
  private adapters = new Map<string, AfricanPaymentAdapter>();

  registerAdapter(adapter: AfricanPaymentAdapter) {
    this.adapters.set(`${adapter.country}:${adapter.id}`, adapter);
  }

  getAdapter(
    country: string,
    adapterId: string,
  ): AfricanPaymentAdapter | undefined {
    return this.adapters.get(`${country}:${adapterId}`);
  }

  getAllAdapters(): AfricanPaymentAdapter[] {
    return Array.from(this.adapters.values());
  }

  async processPayment(
    tenantId: string,
    request: StandardPaymentRequest,
    preferredCountry?: string,
  ): Promise<PaymentResult> {
    // Auto-detect country from phone number if not specified
    const country =
      preferredCountry || this.detectCountryFromPhone(request.phoneNumber);

    // Try all adapters for this country
    const adapters = Array.from(this.adapters.entries())
      .filter(([key]) => key.startsWith(`${country}:`))
      .map(([, adapter]) => adapter);

    // Try each adapter until one succeeds
    for (const adapter of adapters) {
      try {
        const result = await adapter.processPayment(request);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`Adapter ${adapter.name} failed, trying next...`);
        continue;
      }
    }

    return {
      success: false,
      error: `No payment adapters available for country ${country}`,
    };
  }

  private detectCountryFromPhone(phone: string): string {
    // Simple phone number to country mapping
    if (phone.startsWith("+254")) return "KE"; // Kenya
    if (phone.startsWith("+234")) return "NG"; // Nigeria
    if (phone.startsWith("+233")) return "GH"; // Ghana
    if (phone.startsWith("+225")) return "CI"; // Côte d'Ivoire
    if (phone.startsWith("+221")) return "SN"; // Senegal

    // Default to Kenya for unknown numbers
    return "KE";
  }
}

// Pre-configured adapters for African markets
export const defaultAfricanAdapters = [
  new MpesaKenyaAdapter({
    shortCode: "174379",
    password: "YOUR_PASSWORD",
    consumerKey: "YOUR_CONSUMER_KEY",
    consumerSecret: "YOUR_CONSUMER_SECRET",
    passKey: "YOUR_PASS_KEY",
    callbackUrl: "https://your-domain.com/callback",
  }),

  new FlutterwaveNigeriaAdapter({
    publicKey: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
    secretKey: "YOUR_FLUTTERWAVE_SECRET_KEY",
    encryptionKey: "YOUR_FLUTTERWAVE_ENCRYPTION_KEY",
    webhookUrl: "https://your-domain.com/webhook",
  }),
];
