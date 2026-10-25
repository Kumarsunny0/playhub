# ComedyFlix (frontend only)

## Windows me chalane ka tareeka
1. Node.js LTS install karo (https://nodejs.org). `node -v` se check karo.
2. VS Code me ye folder kholo, terminal (Ctrl + `) me:
   ```
   npm install
   npm run dev
   ```
3. Browser me http://localhost:5173 kholo.

## Kya badalna hai
- **UPI ID:** `src/config.js` me `UPI_ID` aur `PAYEE_NAME`.
- **Videos:** `src/videos.js` me apni video ka link (`url`), thumbnail (`thumb`), title, category daalo. YouTube/Vimeo embed link ho to `embed: true` likho.
- **Price / din:** `src/config.js`.
- **Contact buttons:** `src/config.js` me `FACEBOOK`.

## Zaruri baat
Isme server nahi hai, isliye subscription sirf us browser ke `localStorage` me save hota hai. Screenshot ki jaanch sirf itni hai ki image upload hui hai. Koi bhi technical user browser se subscription free me on kar sakta hai, aur video ka link bhi browser me dikh sakta hai. Ye demo/test ke liye theek hai, asli paise bachane ke liye nahi. Asli suraksha ke liye backend (ya Razorpay jaisa gateway) chahiye.
