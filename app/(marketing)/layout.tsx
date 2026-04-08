import Navbar from "@/components/marketing/navbar";
import Footer from "@/components/marketing/footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        {children}
      </div>
      <Footer />
    </div>
  );
}
