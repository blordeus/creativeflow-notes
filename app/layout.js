import './globals.css';

export const metadata = {
  title: 'CreativeFlow Notes',
  description: 'Your creative workspace — notes, ideas, and projects beautifully organized.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
