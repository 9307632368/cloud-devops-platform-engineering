# Parcel quote service

This is a deliberately stateless API: any pod can calculate a quote from the same ConfigMap. I did not store orders in memory because each Kubernetes replica would end up with different data.

The calculation is: base price + number of **whole charged kilograms** × per-kg price. 1,001 grams is billed as 2 kg.

### Try it locally

```powershell
node --version
npm test
npm start
Invoke-RestMethod 'http://localhost:3000/api/quote?zone=remote&weight_grams=1200'
```

Environment variables: `PORT`, `APP_ENV`, `APP_REGION`, `POD_NAME`, `PRICING_JSON` (JSON object with local, national and remote tariff entries).

Example output (pod and region differ in a cluster):

```json
{"zone":"remote","weightGrams":1200,"billedKg":2,"amountPaise":24500,"currency":"INR","stage":"local","region":"lab","pod":"local-process"}
```

This is fake pricing data for practice; no shipping carrier integration. HTTP `/metrics` counts requests handled by one process, not across the whole Deployment. Tests use Node's built-in test runner, so no `npm install` is needed.
