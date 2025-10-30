import axios from 'axios';

export interface X402PaymentInstructions {
  facilitator: string;
  network: string;
  token: string;
  amount: string;
  recipient: string;
  memo?: string;
}

export interface X402PaymentPayload {
  transactionHash: string;
  from: string;
  to: string;
  amount: string;
  network: string;
  token: string;
  timestamp: number;
}

export interface X402PaymentResponse {
  success: boolean;
  paymentId: string;
  verified: boolean;
  transactionHash: string;
}

/**
 * x402 Client for handling payment protocol interactions
 * Based on: https://docs.cdp.coinbase.com/x402/welcome
 */
export class X402Client {
  private facilitatorUrl: string;

  constructor(facilitatorUrl: string) {
    this.facilitatorUrl = facilitatorUrl;
  }

  /**
   * Generate payment instructions for a presale investment
   */
  async generatePaymentInstructions(
    presaleId: string,
    amount: number,
    recipientWallet: string,
    network: string = 'base',
    token: string = 'USDC'
  ): Promise<X402PaymentInstructions> {
    return {
      facilitator: this.facilitatorUrl,
      network,
      token,
      amount: amount.toString(),
      recipient: recipientWallet,
      memo: `presale:${presaleId}`,
    };
  }

  /**
   * Verify payment through x402 facilitator
   */
  async verifyPayment(payload: X402PaymentPayload): Promise<X402PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.facilitatorUrl}/verify`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    transactionHash?: string;
  }> {
    try {
      const response = await axios.get(
        `${this.facilitatorUrl}/payment/${paymentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to check payment status:', error);
      throw new Error('Failed to check payment status');
    }
  }

  /**
   * Request payment with 402 status code
   */
  static createPaymentRequiredResponse(instructions: X402PaymentInstructions) {
    return {
      status: 402,
      headers: {
        'X-Payment-Required': 'true',
        'X-Payment-Instructions': JSON.stringify(instructions),
      },
      body: {
        error: 'Payment Required',
        message: 'This resource requires payment',
        paymentInstructions: instructions,
      },
    };
  }
}

// Export singleton instance
export const x402Client = new X402Client(
  process.env.X402_FACILITATOR_URL || 'https://facilitator.payai.network'
);

