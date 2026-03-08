import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TestDbPage() {
    try {
        const tenantCount = await prisma.tenant.count();
        const firstTenant = await prisma.tenant.findFirst({
            select: { name: true, slug: true }
        });

        return (
            <div style={{ padding: '20px', fontFamily: 'monospace' }}>
                <h1 style={{ color: 'green' }}>✅ Database Connection Success</h1>
                <p>Tenant Count: {tenantCount}</p>
                <p>First Tenant: {firstTenant?.name} ({firstTenant?.slug})</p>
                <hr />
                <p>Environment: {process.env.NODE_ENV}</p>
            </div>
        );
    } catch (error: any) {
        const url = process.env.DATABASE_URL || "";
        const urlPrefix = url.substring(0, 20);
        const charCodes = Array.from(urlPrefix).map(c => c.charCodeAt(0)).join(', ');
        return (
            <div style={{ padding: '20px', fontFamily: 'monospace', color: '#333' }}>
                <h1 style={{ color: 'red' }}>❌ Database Connection Failed</h1>
                <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <p><strong>URL Analysis:</strong></p>
                    <p>First 20 chars: <code>"{urlPrefix}"</code></p>
                    <p>Char Codes: <code>[{charCodes}]</code></p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                        (112 = p, 111 = o, 115 = s, 116 = t, 103 = g...)<br />
                        *If first char is NOT 112 (p), there is a hidden character or space*
                    </p>
                </div>
                <pre style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>{JSON.stringify({
                    message: error.message,
                    code: error.code,
                    clientVersion: error.clientVersion,
                    meta: error.meta
                }, null, 2)}</pre>
            </div>
        );
    }
}
