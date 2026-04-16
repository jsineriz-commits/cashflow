'use client';
import { useState, useMemo } from 'react';
import { useCashflow } from '@/context/CashflowContext';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Settings } from 'lucide-react';
import styles from './CashflowEngine.module.css';

const scenarios = [
  { id: 'base', label: 'Escenario Base', multiplier: 1 },
  { id: 'optimist', label: 'Optimista (+20%)', multiplier: 1.2 },
  { id: 'pessimist', label: 'Pesimista (-20%)', multiplier: 0.8 }
];

export default function CashflowEngine() {
  const { products, costs, simulations, historicalSales, macroVariables, setMacroVariables } = useCashflow();
  const [activeScenario, setActiveScenario] = useState('base');
  const [viewMode, setViewMode] = useState('longterm'); // 'shortterm' or 'longterm'

  const formatCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);

  // LONG-TERM PROJECTION LOGIC (Years)
  const longTermData = useMemo(() => {
    const scn = scenarios.find(s => s.id === activeScenario);
    const multiplier = scn ? scn.multiplier : 1;
    const growthDecimal = 1 + (macroVariables.growthRate / 100);

    // 1. Calculate Base (T-0) Annual Revenue & Variable Costs from historical
    let baseAnnualRevenue = 0;
    let baseAnnualVariableCost = 0;
    
    historicalSales.forEach(hist => {
      const prod = products.find(p => p.id === hist.productId);
      if (prod) {
        // hist.volume is monthly, so multiply by 12 for annual
        const annualVol = hist.volume * 12;
        baseAnnualRevenue += annualVol * prod.price;
        baseAnnualVariableCost += annualVol * (prod.cost || 0);
      }
    });

    // 2. Calculate Base Fixed Costs
    let annualFixedCosts = 0;
    costs.forEach(c => {
      if (c.type === 'fixed') {
        if (c.frequency === 'monthly') annualFixedCosts += c.amount * 12;
        else if (c.frequency === 'annual') annualFixedCosts += c.amount;
      }
    });

    // Generate years array
    let cumulativeCash = 0; // Starts at 0
    const projectedData = [];
    
    // T-0 (Year 0 / Actual)
    const y0Net = baseAnnualRevenue - (baseAnnualVariableCost + annualFixedCosts);
    cumulativeCash += y0Net;
    projectedData.push({
      period: 'Año Base (Hoy)',
      Ingresos: baseAnnualRevenue * multiplier,
      Egresos: -(baseAnnualVariableCost * multiplier + annualFixedCosts), // Negative for visual stacking
      'Caja Acumulada': cumulativeCash
    });

    // Loop through horizon
    let currentRevenue = baseAnnualRevenue * multiplier;
    let currentVarCost = baseAnnualVariableCost * multiplier;
    
    for (let i = 1; i <= macroVariables.horizon; i++) {
       // Apply growth to revenue and variable costs (assuming margin holds)
       currentRevenue = currentRevenue * growthDecimal;
       currentVarCost = currentVarCost * growthDecimal;
       
       const totalCosts = currentVarCost + annualFixedCosts;
       const net = currentRevenue - totalCosts;
       cumulativeCash += net;

       projectedData.push({
         period: `Año ${i}`,
         Ingresos: currentRevenue,
         Egresos: -totalCosts,
         'Caja Acumulada': cumulativeCash
       });
    }

    return projectedData;
  }, [historicalSales, products, costs, macroVariables, activeScenario]);


  // SHORT-TERM PROJECTION LOGIC (Months via Simulator)
  const shortTermData = useMemo(() => {
    const scn = scenarios.find(s => s.id === activeScenario);
    const multiplier = scn ? scn.multiplier : 1;

    let monthsSet = new Set(simulations.map(s => s.month));
    if (monthsSet.size === 0) {
      const now = new Date();
      for(let i=0; i<6; i++) {
        const m = new Date(now.getFullYear(), now.getMonth() + i, 1);
        monthsSet.add(m.toISOString().slice(0, 7));
      }
    }
    const sortedMonths = Array.from(monthsSet).sort();
    
    let totalMonthlyFixed = 0;
    costs.forEach(c => {
      if (c.type === 'fixed') {
        if (c.frequency === 'monthly') totalMonthlyFixed += c.amount;
        else if (c.frequency === 'annual') totalMonthlyFixed += c.amount / 12;
      }
    });

    let cumulativeCash = 0; 
    const data = sortedMonths.map(month => {
      const monthSims = simulations.filter(s => s.month === month);
      let revenue = 0;
      let variableCosts = 0;
      monthSims.forEach(sim => {
        const prod = products.find(p => p.id === sim.productId);
        if (prod) {
          const adjustedVolume = sim.volume * multiplier;
          revenue += adjustedVolume * prod.price;
          variableCosts += adjustedVolume * (prod.cost || 0);
        }
      });
      const totalCosts = totalMonthlyFixed + variableCosts;
      const netCashflow = revenue - totalCosts;
      cumulativeCash += netCashflow;
      return {
        period: month,
        Ingresos: revenue,
        Egresos: -totalCosts, 
        'Caja Acumulada': cumulativeCash
      };
    });
    return data;
  }, [products, costs, simulations, activeScenario]);

  // Active dataset
  const activeData = viewMode === 'longterm' ? longTermData : shortTermData;

  const totalPeriodRevenue = activeData.reduce((acc, curr) => acc + curr.Ingresos, 0);
  const totalPeriodCosts = activeData.reduce((acc, curr) => acc + Math.abs(curr.Egresos), 0);
  const finalBalance = activeData.length > 0 ? activeData[activeData.length - 1]['Caja Acumulada'] : 0;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Proyecciones Estratégicas</h2>
          <p className={styles.description}>
            Evalúa el destino de la empresa modelando crecimiento e inflación.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className={styles.scenarioButton} 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{ fontWeight: 'bold' }}
          >
            <option value="longterm">Largo Plazo (Años - Basado en Histórico)</option>
            <option value="shortterm">Corto Plazo (Mes a Mes - Basado en Simulador)</option>
          </select>

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
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Tweak Panel */}
        {viewMode === 'longterm' && (
          <div className={styles.metricCard} style={{ flex: '0 0 300px', alignSelf: 'flex-start' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Settings size={18} /> Panel de Ajustes
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Crecimiento de Ventas (% Anual)</label>
                <input 
                  type="range" 
                  min="-20" max="100" step="1"
                  value={macroVariables.growthRate}
                  onChange={(e) => setMacroVariables({...macroVariables, growthRate: parseInt(e.target.value)})}
                  style={{ width: '100%', marginTop: '0.5rem' }} 
                />
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem' }}>{macroVariables.growthRate}%</div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--secondary-foreground)' }}>Horizonte de Proyección</label>
                <select 
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}
                  value={macroVariables.horizon}
                  onChange={(e) => setMacroVariables({...macroVariables, horizon: parseInt(e.target.value)})}
                >
                  <option value={1}>1 Año</option>
                  <option value={3}>3 Años</option>
                  <option value={5}>5 Años</option>
                  <option value={10}>10 Años</option>
                </select>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--secondary-foreground)' }}>
                * Modo "Valores Reales": No calculamos inflación para la UI para mantener el gráfico legible a 10 años, asumiendo ajustes por precios iguales a la inflación. Todo se muestra en moneda dura.
              </p>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricTitle}>Ingresos Período</div>
              <div className={`${styles.metricValue} ${styles.positive}`}>{formatCurrency(totalPeriodRevenue)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricTitle}>Egresos Período</div>
              <div className={`${styles.metricValue} ${styles.negative}`}>{formatCurrency(totalPeriodCosts)}</div>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricTitle}>Posición Caja Final</div>
              <div className={`${styles.metricValue} ${finalBalance >= 0 ? styles.positive : styles.negative}`}>{formatCurrency(finalBalance)}</div>
            </div>
          </div>

          <div className={styles.chartCard} style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Evolución del Flujo Descontado</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="period" stroke="var(--secondary-foreground)" fontSize={12} />
                  <YAxis stroke="var(--secondary-foreground)" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="Ingresos" stackId="a" fill="rgba(16, 185, 129, 0.8)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Egresos" stackId="a" fill="rgba(239, 68, 68, 0.8)" radius={[0, 0, 4, 4]} />
                  <Line type="monotone" dataKey="Caja Acumulada" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
