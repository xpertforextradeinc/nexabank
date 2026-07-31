/**
 * Frontend client service for interacting with the Increase API (https://api.increase.com).
 * All requests are routed through our secure Vercel Serverless proxy (/api/increase-proxy).
 */

export async function createIncreaseEntity(payload: {
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
}) {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'entities',
      method: 'POST',
      payload: {
        structure: 'individual',
        individual: {
          name: `${payload.firstName} ${payload.lastName}`,
          date_of_birth: payload.dateOfBirth,
          address: payload.address,
        }
      }
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create Increase entity via proxy');
  return response.json();
}

export async function createIncreaseAccount(entityId: string, programId: string) {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'accounts',
      method: 'POST',
      payload: { entity_id: entityId, program_id: programId }
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create Increase account via proxy');
  return response.json();
}

export async function createIncreaseTransfer(payload: {
  accountId: string;
  amount: number;
  accountNumber: string;
  routingNumber: string;
  memo: string;
}) {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'ach_transfers',
      method: 'POST',
      payload: {
        account_id: payload.accountId,
        amount: payload.amount,
        statement_descriptor: payload.memo,
        account_number: payload.accountNumber,
        routing_number: payload.routingNumber
      }
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to initiate transfer via proxy');
  return response.json();
}

export async function createIncreaseCard(accountId: string) {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'cards',
      method: 'POST',
      payload: { account_id: accountId }
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to create Increase card');
  return response.json();
}

export async function listIncreaseCards(accountId: string) {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: `cards?account_id=${accountId}`,
      method: 'GET'
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to list Increase cards');
  return response.json();
}

export async function updateIncreaseCard(cardId: string, status: 'active' | 'disabled' | 'canceled') {
  const response = await fetch('/api/increase-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: `cards/${cardId}`,
      method: 'POST',
      payload: { status }
    })
  });
  if (!response.ok) throw new Error((await response.json()).detail || 'Failed to update Increase card');
  return response.json();
}
