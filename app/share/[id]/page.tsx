import { prisma } from "@/lib/prisma";

export default async function SharePage({ params }: { params: { id: string } }) {
  const item = await prisma.output.findUnique({ where: { id: params.id } });
  if (!item) return <div className="container"><h1>Not found</h1></div>;

  // Render inside an iframe to isolate styling/scripts
  return (
    <section>
      <h1>Shared Output: {item.title}</h1>
      <p><small>ID: {item.id} • {new Date(item.createdAt).toLocaleString()}</small></p>
      <iframe
        title={item.title}
        style={{ width: "100%", height: "70vh", border: "1px solid var(--border)", borderRadius: 12 }}
        srcDoc={item.html}
      />
    </section>
  );
}
