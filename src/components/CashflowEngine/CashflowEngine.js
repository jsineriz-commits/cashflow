'use client';
import { useState, useMemo } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import styles from './CashflowEngine.module.css';

const scenarios = [
  { id: 'base', label: 'Escenario Base', multiplier: 1 },
  { id: 'optimist', label: 'Optimista (+20%)', multiplier: 1.2 },
  { id: 'pessimist', label: 'Pesimista (-20%)', multiplier: 0.8 }
];

export default function CashflowEngine() {
  const { products, costs, simulations } = useCashflow();
  const [activeScenario, setActiveScenario] = useState('base');

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(val);

  // Core Engine Logic
  const data = useMemo(() => {
    const scn = scenarios.find(s => s.id === activeScenario);
    const multiplier = scn ? scn.multiplier : 1;

    // Get all unique months from simulations
    let monthsSet = new Set(simulations.map(s => s.month));
    
    // If no simulations, create a few empty months forward to show structure
    if (monthsSet.size === 0) {
      const now = new Date();
      for(let i=0; i<6; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
        monthsSet.add(m.toISOString().slice(0, 7));
      }
    }
    
    const sortedMonths = Array.from(monthsSet).sort();
    
    // Calculate Monthly Fixed Costs based on frequency
    let totalMonthlyFixed = 0;
    costs.forEach(c => {
      if (c.type === 'fixed') {
        if (c.frequency === 'monthly') totalMonthlyFixed += c.amount;
        else if (c.frequency === 'annual') totalMonthlyFixed += c.amount / 12;
      }
    });

    let cumulativeCash = 0; // Starting balance assumed 0 (or could be an input)

    const projectedData = sortedMonths.map(month => {
      // Find simulations for this month
      const monthSims = simulations.filter(s => s.month === month);
      
      let revenue = 0;
      let variableCosts = 0;

      monthSims.forEach(sim => {
        const prod = products.find(p => p.id === sim.productId);
        if (prod) {
          // Adjust volume by scenario multiplier
          const adjustedVolume = sim.volume * multiplier;
          revenue += adjustedVolume * prod.price;
          variableCosts += adjustedVolume * (prod.cost || 0);
        }
      });

      const totalCosts = totalMonthlyFixed + variableCosts;
      const netCashflow = revenue - totalCosts;
      cumulativeCash += netCashflow;

      return {
        month,
        Ingresos: revenue,
        Egresos: -totalCosts, // negative for visual bar stacking in chart
        'Flujo de Caja': netCashflow,
        'Caja Acumulada': cumulativeCash
      };
    });

    return projectedData;
  }, [products, costs, simulations, activeScenario]);

  // Aggregate Metrics over the period
  const totalPeriodRevenue = data.reduce((acc, curr) => acc + curr.Ingresos, 0);
  const totalPeriodCosts = data.reduce((acc, curr) => acc + Math.abs(curr.Egresos), 0);
  const finalBalance = data.length > 0 ? data[data.length - 1]['Caja Acumulada'] : 0;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Proyecciones y Flujo de Caja</h2>
          <p className={styles.description}>
            Análisis consolidado del impacto financiero basado en tu catálogo, gastos y previsión de ventas.
          </p>
        </div>
        <div className={styles.scenarios}>
          {scenarios.map(s => (
            <button
              key={s.id}
              className={`${styles.scenarioButton} ${activeScenario === s.id ? styles.active : ''}`}
              onClick={() => setActiveScenario(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <TrendingUp size={16} /> Ingresos Proyectados (Total)
          </div>
          <div className={`${styles.metricValue} ${styles.positive}`}>
            {formatCurrency(totalPeriodRevenue)}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <TrendingDown size={16} /> Egresos Proyectados (Total)
          </div>
          <div className={`${styles.metricValue} ${styles.negative}`}>
            {formatCurrency(totalPeriodCosts)}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>
            <DollarSign size={16} /> Status de Caja Final
          </div>
          <div className={`${styles.metricValue} ${finalBalance >= 0 ? styles.positive : styles.negative}`}>
            {formatCurrency(finalBalance)}
          </div>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.title} style={{ fontSize: '1.25rem' }}>Evolución del Cashflow (Hacia adelante y hacia atrás)</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--secondary-foreground)" fontSize={12} />
              <YAxis 
                stroke="var(--secondary-foreground)" 
                fontSize={12}
                tickFormatter={(value) => `$${value/1000}k`}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              
              <Bar dataKey="Ingresos" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Egresos" stackId="a" fill="var(--danger)" radius={[0, 0, 4, 4]} />
              
              <Line 
                type="monotone" 
                dataKey="Caja Acumulada" 
                stroke="var(--primary)" 
                strokeWidth={3} 
                dot={{ r: 4, fill: 'var(--primary)' }}
                activeDot={{ r: 6 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
