import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

export interface AsaasCustomerData {
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
  externalReference?: string;
}

export interface AsaasPixQrCodeResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasPaymentResponse {
  id: string;
  customer: string;
  value: number;
  netValue?: number;
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED';
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  externalReference?: string;
  pixQrCode?: AsaasPixQrCodeResponse;
}

export class AsaasService {
  private client: AxiosInstance | null = null;
  private isSandbox = true;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.ASAAS_API_KEY || null;
    this.isSandbox = process.env.ASAAS_ENV !== 'production';

    if (this.apiKey) {
      const baseURL = this.isSandbox
        ? 'https://sandbox.asaas.com/v3'
        : 'https://api.asaas.com/v3';

      this.client = axios.create({
        baseURL,
        headers: {
          access_token: this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      console.log(`💳 Asaas Gateway inicializado (${this.isSandbox ? 'Sandbox' : 'Produção'})`);
    } else {
      console.log('💳 Asaas API Key não configurada. Operando com Simulador Sandbox Integrado.');
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Cria ou busca cliente no Asaas
   */
  public async createOrUpdateCustomer(data: AsaasCustomerData): Promise<string> {
    if (!this.client) {
      // Mock Customer ID
      return `cus_mock_${uuidv4().substring(0, 8)}`;
    }

    try {
      // Busca cliente por email ou cpfCnpj se já existir
      const searchRes = await this.client.get('/customers', {
        params: { email: data.email }
      });

      if (searchRes.data?.data && searchRes.data.data.length > 0) {
        return searchRes.data.data[0].id;
      }

      // Cria novo cliente
      const createRes = await this.client.post('/customers', {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj?.replace(/\D/g, ''),
        mobilePhone: data.mobilePhone || data.phone,
        externalReference: data.externalReference
      });

      return createRes.data.id;
    } catch (err: any) {
      console.error('Erro ao criar cliente no Asaas:', err.response?.data || err.message);
      throw new Error(err.response?.data?.errors?.[0]?.description || 'Erro ao registrar cliente no gateway Asaas');
    }
  }

  /**
   * Cria cobrança PIX imediata
   */
  public async createPixPayment(params: {
    customerId: string;
    value: number;
    dueDate: string;
    description: string;
    externalReference: string;
  }): Promise<AsaasPaymentResponse> {
    if (!this.client) {
      // Mock PIX Response
      const paymentId = `pay_mock_${uuidv4().substring(0, 10)}`;
      const mockQrCodePayload = `00020126580014br.gov.bcb.pix0136${uuidv4()}520400005303986540${params.value.toFixed(2)}5802BR5915GESTOR DE OBRAS6009SAO PAULO62070503***6304`;
      
      // 1x1 pixel transparente ou mock base64
      const mockQrCodeBase64 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230ea5e9"/><text x="50" y="55" font-family="Arial" font-size="10" fill="white" text-anchor="middle" font-weight="bold">PIX SIMULADO</text></svg>`;

      return {
        id: paymentId,
        customer: params.customerId,
        value: params.value,
        billingType: 'PIX',
        status: 'PENDING',
        dueDate: params.dueDate,
        externalReference: params.externalReference,
        pixQrCode: {
          encodedImage: mockQrCodeBase64,
          payload: mockQrCodePayload,
          expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      };
    }

    try {
      const res = await this.client.post('/payments', {
        customer: params.customerId,
        billingType: 'PIX',
        value: params.value,
        dueDate: params.dueDate,
        description: params.description,
        externalReference: params.externalReference
      });

      const payment = res.data;

      // Busca QR Code do PIX
      const qrCodeRes = await this.client.get(`/payments/${payment.id}/pixQrCode`);

      return {
        id: payment.id,
        customer: payment.customer,
        value: payment.value,
        billingType: 'PIX',
        status: payment.status,
        dueDate: payment.dueDate,
        invoiceUrl: payment.invoiceUrl,
        externalReference: payment.externalReference,
        pixQrCode: qrCodeRes.data
      };
    } catch (err: any) {
      console.error('Erro ao criar cobrança PIX no Asaas:', err.response?.data || err.message);
      throw new Error(err.response?.data?.errors?.[0]?.description || 'Erro ao gerar PIX no Asaas');
    }
  }

  /**
   * Processa pagamento via Cartão de Crédito
   */
  public async createCreditCardPayment(params: {
    customerId: string;
    value: number;
    dueDate: string;
    description: string;
    externalReference: string;
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo?: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode?: string;
      addressNumber?: string;
      phone?: string;
    };
  }): Promise<AsaasPaymentResponse> {
    if (!this.client) {
      // Mock Approved Card Payment
      const paymentId = `pay_card_mock_${uuidv4().substring(0, 10)}`;
      return {
        id: paymentId,
        customer: params.customerId,
        value: params.value,
        billingType: 'CREDIT_CARD',
        status: 'CONFIRMED',
        dueDate: params.dueDate,
        externalReference: params.externalReference
      };
    }

    try {
      const res = await this.client.post('/payments', {
        customer: params.customerId,
        billingType: 'CREDIT_CARD',
        value: params.value,
        dueDate: params.dueDate,
        description: params.description,
        externalReference: params.externalReference,
        creditCard: params.creditCard,
        creditCardHolderInfo: params.creditCardHolderInfo
      });

      return {
        id: res.data.id,
        customer: res.data.customer,
        value: res.data.value,
        billingType: 'CREDIT_CARD',
        status: res.data.status,
        dueDate: res.data.dueDate,
        invoiceUrl: res.data.invoiceUrl,
        externalReference: res.data.externalReference
      };
    } catch (err: any) {
      console.error('Erro ao processar Cartão no Asaas:', err.response?.data || err.message);
      throw new Error(err.response?.data?.errors?.[0]?.description || 'Erro ao processar cartão de crédito no gateway');
    }
  }
}

export const asaasService = new AsaasService();
