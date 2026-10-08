import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Permet à `next dev` d'accéder aux « bindings » Cloudflare (ici : le bucket R2 d'images) en local.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
