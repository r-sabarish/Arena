## About Arena
Arena is a gaming platform that makes it easy and fun for office teams to play games together online.

Combining robust backend services with engaging gameplay, Arena delivers a smooth, interactive experience directly in your browser.
- Website & Authentication: Built with Next.js, featuring secure sign-in powered by NextAuth and Azure AD (via Azure Entra OpenID).
- Player Progress & Leaderboards: Managed through PlayFab, tracking stats, achievements, leaderboards, and virtual currencies.
- Game Experience: Developed in Unity WebGL, supporting both single-player and multiplayer game modes.
- Real-Time Multiplayer: Enabled by Photon Fusion 2 for seamless multiplayer interactions.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, setup the database:

```bash
npx tsx lib/init-db.ts
```

Second, setup environmnet variables
- change the .env.template to local
- update the values in .env.local


Third, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Arena, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Azure](https://learn.microsoft.com/en-us/entra/identity/) - learn about Azure authentication.
- [PlayFab Documentation](https://learn.microsoft.com/en-us/gaming/playfab/) - learn about playfab and playfab API.
- [Unity Documentation](https://docs.unity3d.com/Manual/index.html) - learn about unity.
- [Fusion 2 Documentation](https://doc.photonengine.com/fusion/current/fusion-intro) - learn about Fusion2 Multiplayer SDK for Unity.
- [React Unity WebGL Documentation](https://react-unity-webgl.dev/docs/getting-started/installation/) - learn about unity and web integration.
- [Three Js Documentation](https://threejs.org/manual/#en/creating-a-scene) - learn about three js.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Screenshots

<img width="1358" height="608" alt="image" src="https://github.com/user-attachments/assets/7160618d-daba-45de-b81c-827db4936ca4" />
<img width="1353" height="604" alt="image" src="https://github.com/user-attachments/assets/210aff68-1345-4e4c-bfcd-9177b68302ff" />
![image](https://github.com/user-attachments/assets/a7202786-5262-4267-a1ed-8b2f2778980d)
![image](https://github.com/user-attachments/assets/7c77d995-3960-45d0-ac10-fe2a784e57ba)
![image](https://github.com/user-attachments/assets/cc9b159a-ead4-44c4-bef4-520078eb4514)
![image](https://github.com/user-attachments/assets/5fdc2fa0-70c0-4d63-bafa-9b850a598cf1)
![image](https://github.com/user-attachments/assets/087292dd-c786-49ad-b164-157e2d1ace73)
![image](https://github.com/user-attachments/assets/8e731e1e-e22a-4b4a-9ef3-fd0858d72b62)
<img width="1358" height="607" alt="image" src="https://github.com/user-attachments/assets/7737c024-4e62-4ef8-80b7-b4cc6f42d8b6" />



