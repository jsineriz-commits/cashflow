import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { CashflowProvider } from '@/context/CashflowContext';

export const metadata = {
  title: 'Premium Cashflow PYMES',
  description: 'Simulador y proyecciones de flujo de caja para pequeñas y medianas empresas',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <CashflowProvider>
          <div className="app-container">
            <Sidebar />
            <div className="main-wrapper">
              <Topbar />
              <main className="main-content">
                {children}
              </main>
            </div>
          </div>
        </CashflowProvider>
      </body>
    </html>
  );
}
