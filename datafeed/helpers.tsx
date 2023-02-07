// Make requests to CryptoCompare API
export async function makeApiRequest(path: string) {
	try {
		const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
		return response.json();
	} catch (error: any) {
		throw new Error(`trading view datafeed request error: ${error.status}`);
	}
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(exchange: string, fromSymbol: string, toSymbol: string) {
	const short = `${fromSymbol}/${toSymbol}`;
	return {
		short,
		full: `${exchange}:${short}`,
	};
}

export function parseFullSymbol(fullSymbol: string) {
	const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
	if (!match) {
		return null;
	}

	return {
		exchange: match[1],
		fromSymbol: match[2],
		toSymbol: match[3],
	};
}
export function parseResolution(resolution: any) {
  return  /^\d+$/.test(resolution) ? `${resolution}m` : resolution;
}