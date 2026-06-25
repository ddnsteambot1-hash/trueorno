import "../styles.css";

export const metadata = {
  title: "Правда или действие 18+",
};

export const viewport = {
  themeColor: "#12000f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
