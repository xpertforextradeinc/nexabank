import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Setup Supabase Client with Service Role Key for backend access
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Webhook Signature Validation
  const webhookSecret = process.env.INCREASE_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers['increase-webhook-signature'] || req.headers['x-webhook-signature'];
    
    // Validate signature using standard HMAC-SHA256 evaluation
    const payloadString = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    let isValid = false;
    if (typeof signature === 'string') {
      try {
        const sigBuffer = Buffer.from(signature, 'utf8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        // Constant-time comparison
        if (sigBuffer.length === expectedBuffer.length) {
          isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
        }
      } catch (e) {
        // Ignored
      }
    }
    
    // In production with Increase, the signature is normally "t=TIMESTAMP,v1=SIGNATURE".
    // We accommodate strict security constraints required for Nexa Bank ledger processing.
    if (!isValid && signature) {
      // For actual Increase format, we'd parse the 'v1' value. For now, strict basic HMAC.
      return res.status(401).json({ error: 'Invalid webhook signature' });
    } else if (!signature) {
       return res.status(401).json({ error: 'Missing webhook signature' });
    }
  }

  const event = req.body;

  try {
    // 1. Audit / Log the incoming Webhook from Increase
    console.log('Received Increase Webhook:', event.category, event.type);

    // 2. Process based on event type
    switch (event.category) {
      case 'account':
        if (event.type === 'account.created' || event.type === 'account.updated') {
          // Handle account creation/update
          const accountId = event.associated_object_id;
          console.log(`Account event for: ${accountId}`);
          // E.g., sync status into Supabase if needed
        }
        break;

      case 'transaction':
        if (event.type === 'transaction.created') {
          const transactionId = event.associated_object_id;
          console.log(`Transaction created: ${transactionId}`);
          
          // Append transaction log to Supabase with type explicitly set to 'credit'
          await supabase.from('transactions').insert({
            reference: transactionId,
            description: `Increase ACH Transaction (${transactionId})`,
            amount: event.amount ? Math.abs(event.amount) / 100 : 0,
            type: 'credit',
            status: 'completed',
            category: 'ach'
          });
        }
        break;
        
      case 'ach_transfer':
        if (event.type === 'ach_transfer.updated') {
          // E.g. status goes from pending -> submitted -> settled
          console.log(`ACH Transfer updated: ${event.associated_object_id}`);
        }
        break;

      default:
        console.log(`Unhandled Increase Webhook category: ${event.category}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
