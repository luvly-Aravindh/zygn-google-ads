# Zygn audit landing page

The form posts each answer straight to Getnos Desk (`https://deskbackend.getnos.io/v1/lead`). There is no lead API on this site.

Email subject for every lead: `New audit lead - zygn`.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm start
```
