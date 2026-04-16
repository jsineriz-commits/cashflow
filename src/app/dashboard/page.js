'use client';
import { useCashflow } from '@/context/CashflowContext';
import { Package, Receipt, TrendingUp, LineChart, History, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import EconomicIndicators from '@/components/EconomicIndicators/EconomicIndicators';

export default function DashboardPage() {
  const { products, costs, simulations } = useCashflow();

  // Basic Metrics
  const activeProducts = products.length;
  const totalMonthlyCosts = costs.filter(c => c.type === 'fixed' && c.frequency === 'monthly').reduce((acc, curr) => acc + curr.amount, 0);
  const totalSimulations = simulations.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>Bienvenido, Mi PYME S.A.</h2>
        <p style={{ color: 'var(--secondary-foreground)', marginTop: '0.25rem', marginBottom: '2rem' }}>
          Este es tu panel de control principal para gestionar la liquidez de tu negocio.
        </p>
      </div>

      <EconomicIndicators />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
            <Package size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Catálogo</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{activeProducts}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Productos y servicios activos</p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
            <Receipt size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Burn Rate Mensual</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
            ${(totalMonthlyCosts/1000).toFixed(1)}k
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Gastos fijos requeridos por mes</p>
        </div>

        <div className="glass" style={{
          padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '1rem',
          backgroundColor: 'var(--card-bg)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }}>
            <TrendingUp size={24} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Previsiones</h3>
          </div>
          <p style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{totalSimulations}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Puntos de datos simulados</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Accesos Rápidos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

          <Link href="/productos" style={{
            padding: '1.25rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', flexShrink: 0 }}>
              <Package size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Catálogo y Precios</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>Define tus productos y costos unitarios</p>
            </div>
          </Link>

          <Link href="/costos" style={{
            padding: '1.25rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: 'var(--danger)', color: 'white', borderRadius: '50%', flexShrink: 0 }}>
              <Receipt size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Costos y Egresos</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>Registrá gastos fijos y variables</p>
            </div>
          </Link>

          <Link href="/historico" style={{
            padding: '1.25rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: 'var(--success)', color: 'white', borderRadius: '50%', flexShrink: 0 }}>
              <History size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Datos Históricos</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>Cargá ventas pasadas como base de proyección</p>
            </div>
          </Link>

          <Link href="/simulador" style={{
            padding: '1.25rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '50%', flexShrink: 0 }}>
              <BarChart2 size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Simulador (Corto Plazo)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>Simulá ventas mes a mes</p>
            </div>
          </Link>

          <Link href="/proyecciones" style={{
            padding: '1.25rem', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius-md)',
            transition: 'background-color 0.2s', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{ padding: '0.65rem', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '50%', flexShrink: 0 }}>
              <LineChart size={18} />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>Proyecciones (Largo Plazo)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-foreground)' }}>Analizá escenarios a 1, 3, 5 y 10 años</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}
