import "./globals.css";

export const metadata = {
  title: "Real-time Chat App",
  description: "A minimal real-time chat application with ClickSpark animations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
