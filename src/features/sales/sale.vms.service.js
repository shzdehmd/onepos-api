const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const { decrypt } = require('../../core/utils/crypto');

const VMS_API_URL = process.env.VMS_API_URL;

/**
 * Maps internal payment types to VMS-compatible payment types.
 * @param {string} internalPaymentType - The payment type from our Sale model.
 * @returns {string} The corresponding VMS payment type.
 */
const mapPaymentType = (internalPaymentType) => {
    switch (internalPaymentType?.toLowerCase()) {
        case 'cash':
            return 'Cash';
        case 'card':
            return 'Card';
        case 'bank':
            return 'WireTransfer';
        case 'mobile':
        case 'wallet':
            return 'MobileMoney';
        case 'credit':
            return 'Account';
        default:
            return 'Other';
    }
};

/**
 * Signs a normal sale invoice with the external VMS API.
 * @param {object} shop - The fully populated shop document, including frcsSettings.
 * @param {object} sale - The fully populated sale document, including items and their products.
 * @returns {Promise<object>} The response data from the VMS API.
 */
const signNormalSaleInvoice = async (shop, sale) => {
    if (!shop?.isVMSEnabled || !shop.frcsSettings) {
        throw new Error('VMS is not enabled or configured for this shop.');
    }

    const { p12_chain_file, encryptedPassword, encryptedPac, invoiceType } = shop.frcsSettings;

    if (!p12_chain_file || !encryptedPassword) {
        throw new Error('Shop is missing required VMS certificate or password.');
    }

    // 1. Decrypt Credentials
    const password = decrypt(encryptedPassword);
    const pac = encryptedPac ? decrypt(encryptedPac) : null;

    // 2. Construct Payment Payload
    const paymentPayload = [
        {
            amount: sale.amountPaid,
            paymentType: mapPaymentType(sale.paymentType),
        },
    ];

    // 3. Construct Full Payload
    const payload = {
        dateAndTimeOfIssue: sale.createdAt.toISOString(),
        cashier: sale.processedBy.toString(), // Assumes processedBy is the cashier ID
        invoiceType: invoiceType,
        transactionType: 'Sale',
        payment: paymentPayload,
        invoiceNumber: sale.receiptNo,
        items: sale.items.map((item) => {
            // For now, we assume no tax. This will be updated when the Tax feature is built.
            const taxLabel = 'N';

            return {
                name: item.product.name,
                quantity: item.quantity,
                // The VMS API requires the final, tax-inclusive price.
                // We assume item.unitPrice is this final price.
                unitPrice: item.unitPrice,
                labels: [taxLabel],
                totalAmount: item.total, // Using the virtual property from the SaleItem model
            };
        }),
    };

    console.log('VMS Payload:', JSON.stringify(payload, null, 2));

    // 4. Configure HTTPS Agent for mTLS
    const httpsAgent = new https.Agent({
        pfx: p12_chain_file,
        passphrase: password,
        rejectUnauthorized: false, // Often required for sandbox environments
    });

    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        RequestId: crypto.randomBytes(16).toString('hex'),
        PAC: pac,
    };

    // 5. Make API Call
    try {
        console.log('Sending invoice to VMS for signing...');
        const response = await axios.post(VMS_API_URL, payload, {
            headers,
            httpsAgent,
        });
        console.log('VMS signing successful.');
        return response.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.messages?.[0] ||
            error.response?.data?.Message ||
            'Failed to communicate with VMS API.';
        console.error('VMS API Error:', JSON.stringify(error.response?.data || error.message));
        throw new Error(errorMessage);
    }
};

module.exports = { signNormalSaleInvoice };
