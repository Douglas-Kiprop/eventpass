import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; 
import Header from "../components/Header"; 

// Remove OnchainKit styles import
// import '@coinbase/onchainkit/styles.css'; // Remove this line

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "EventPass DApp",
  description: "Discover and purchase tickets for upcoming events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Providers>
          <Header />
          <main className="pt-5 pb-12 min-h-[calc(100vh-160px)]"> {/* Adjusted padding */}
            {children}
          </main>
          {/* The footer block that was here is now correctly removed */}
        </Providers>
      </body>
    </html>
  );
}

/* Ensure any stray footer code below this line is also deleted */
