import SidebarMenu from "@/components/Sidebar";
import SeverityToast from "@/components/SeverityToast";
function Main({ children }) {
  return (
    <>
      <SeverityToast />
      <main className="">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </>
  );
}
export default function DashboardLayout({ children }) {
  return (
    <SidebarMenu>
      <Main>{children}</Main>
    </SidebarMenu>
  );
}
