import { Inter} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./prism.css";
import { AppContextProvider } from "../context/AppContext";
import {Toaster} from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata = {
  title: "DeepSeek - Appani",
  description: "Full Stack Project",
};    

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <body
            className={`${inter.className} antialiased`}
          >
            <Toaster toastOptions={
              {
                success: {style: {background: "black", color: "white"}},
                error: {style: {background: "black", color: "white"}}
              }
            }/>
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}

// This is the root layout of the DeepSeek application, which includes ClerkProvider for authentication and sets global styles.