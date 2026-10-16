// src/app/(dashboard)/mikrotik/[id]/page.js
import MikroTikClientPage from "./MikroTikClientPage"; // Kita buat di bawah

export default async function MikroTikPage({ params }) {
  // Await parameter id sesuai dengan spesifikasi Next.js App Router terbaru
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <MikroTikClientPage id={id} />;
}
