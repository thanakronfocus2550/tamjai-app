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
        return (
            <div style={{ padding: '20px', fontFamily: 'monospace' }}>
                <h1 style={{ color: 'red' }}>❌ Database Connection Failed</h1>
                <pre>{JSON.stringify({
                    message: error.message,
                    code: error.code,
                    clientVersion: error.clientVersion,
                    meta: error.meta
                }, null, 2)}</pre>
            </div>
        );
    }
}
