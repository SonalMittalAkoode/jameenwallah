# Schema

Primary output object:

```json
{
  "project_name": "",
  "builder_name": "",
  "project_slug": "",
  "project_type": "",
  "category": "residential",
  "rera_number": "",
  "project_description": "",
  "country": "India",
  "state": "",
  "city": "",
  "locality": "",
  "sector": "",
  "address": "",
  "pincode": "",
  "coordinates": {
    "lat": null,
    "lng": null
  },
  "price": {
    "starting": null,
    "ending": null,
    "minimum_price": null,
    "maximum_price": null,
    "price_per_sqft": null,
    "crores": null,
    "lakhs": null,
    "payment_plans": []
  },
  "configurations": [],
  "amenities": [],
  "gallery_images": [],
  "floor_plans": [],
  "master_plan_images": [],
  "logo_images": [],
  "videos": [],
  "brochures": [],
  "virtual_tours": [],
  "nearby_places": [],
  "builder_details": {},
  "project_url": "",
  "source_name": "",
  "canonical_key": ""
}
```

## Canonical Key

The default key is generated from:

`builder_name + project_name + sector + city`

In production, override it with a stronger identity strategy:

- RERA number when available
- Builder canonical name
- Exact project name
- Verified coordinates or address
- Source URL as a fallback only

## Price Normalization

All prices are stored as numeric INR wherever possible.

- `1 Cr` becomes `10000000`
- `75 Lakh` becomes `7500000`
- `₹12,500 / sq.ft` becomes `price_per_sqft = 12500`

## Area Normalization

All areas should resolve into sq.ft fields.

- `1 acre` becomes `43560`
- `4.5 acre` becomes `196020`
- `2500 sq.ft` remains `2500`

## Media Objects

```json
{
  "url": "",
  "asset_type": "gallery",
  "local_path": "",
  "sha256": "",
  "width": null,
  "height": null,
  "alt": "",
  "caption": "",
  "source_url": "",
  "mime_type": "",
  "is_duplicate": false
}
```

Use `sha256` for duplicate removal across domains and repeated CDN URLs.
