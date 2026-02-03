/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		// Use backend service name in Docker, fallback to localhost for local dev
		const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
		return [
			{
				source: "/api/:path*",
				destination: `${backendUrl}/api/:path*`,
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "logo.clearbit.com",
				pathname: "/**",
			},
		],
	},
};

export default nextConfig;
