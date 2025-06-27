#!/usr/bin/env node
const readline = require('node:readline');

async function convert(amount) {
  const url = 'https://open.er-api.com/v6/latest/USD';
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API responded with ${res.status}`);
  }
  const data = await res.json();
  return {
    INR: data.rates.INR,
    GBP: data.rates.GBP
  };
}

async function run() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter amount in USD: ', async (answer) => {
    const amount = parseFloat(answer);
    if (isNaN(amount)) {
      console.log('Invalid number.');
      rl.close();
      return;
    }

    try {
      const rates = await convert(amount);
      console.log(`You entered: $${amount}`);
      console.log(`Converted to INR: \u20B9${(amount * rates.INR).toFixed(2)}`);
      console.log(`Converted to GBP: \u00A3${(amount * rates.GBP).toFixed(2)}`);
    } catch (err) {
      console.error('Could not retrieve exchange rates.\n', err.message);
    } finally {
      rl.close();
    }
  });
}

run();
