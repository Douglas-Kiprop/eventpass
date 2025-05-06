import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // Import the Providers component
import Header from "../components/Header"; // Import the Header component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EventPass",
  description: "Your gateway to exclusive events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900`}> {/* Added default dark background */}
        <Providers> {/* Wrap the children with Providers */}
          <Header /> {/* Add the Header here */}
          <main className="pt-4"> {/* Add some padding below header */}
             {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
