# Danbury Wheel Chair Service — PWA

Dispatcher & Driver console (bilingual), ready for GitHub Pages.

## Features requested
- Firebase Auth (email/password). Role-based access: dispatcher sees full console; driver sees only own jobs.
- Dispatcher assigns a driver and saves the job to **Firestore → jobs**. Driver receives it in-app.
- Message includes company info and a Google Maps route link. Map opens in the same window.
- Buttons WhatsApp/SMS/Email to **client** only (in a modal: “Client data”). No more sending to drivers externally.
- KPIs: “Jobs today” opens list; “Scheduled” shows upcoming jobs.
- Driver dashboard: bubbles “Trips done” and “Scheduled”, plus Today/Upcoming lists.
- Bilingual (auto ES/EN; manual switcher). Company info shown by default.
- PWA install bubble; iPhone/iPad instructions dialog. Responsive (desktop-first).

## Firebase
Use the provided project. Required collections:
- `drivers` (optional): docs with `{ id|uid|email, name, phone, vehicle, plate, whatsapp }`.
- `jobs`: created by the app when dispatcher clicks **Generate summary**.

### Minimal Security Rules (example)
Adjust as needed.
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobs/{job} {
      allow read, write: if request.auth != null;
    }
    match /drivers/{driver} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Publish
1. Push these files to the repo root.
2. Settings → Pages → Deploy from branch → `main` (root).
3. Open the URL. On Android you’ll see the install prompt. On iPhone, open in Safari and use **Share → Add to Home Screen**.

© 2025 Danbury Wheel Chair Service — “On time, every time!”
