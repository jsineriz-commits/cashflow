'use client';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import styles from './Topbar.module.css';

const routeNames = {
  '/dashboard': 'Dashboard Principal',
  '/productos': 'Catálogo y Precios',
  '/costos': 'Costos y Egresos',
  '/simulador': 'Simulador de Ventas',
  '/proyecciones': 'Proyecciones y Escenarios',
};

export default function Topbar() {
  const pathname = usePathname();
  const title = routeNames[pathname] || 'Cashflow App';

  return (
    <header className={styles.topbar}>
      <h1 className={styles.title}>{title}</h1>
      
      <div className={styles.actions}>
        <div className={styles.tooltip} data-tip="Búsqueda — Próximamente">
          <button className={styles.iconButton} aria-label="Buscar" disabled>
            <Search size={20} />
          </button>
        </div>
        <div className={styles.tooltip} data-tip="Notificaciones — Próximamente">
          <button className={styles.iconButton} aria-label="Notificaciones" disabled>
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
