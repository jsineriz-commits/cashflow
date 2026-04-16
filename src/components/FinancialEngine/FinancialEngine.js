'use client';
import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateNPV, calculateIRR, calculatePayback } from '@/lib/financialMath';
import { Settings, Briefcase, Activity, DollarSign } from 'lucide-react';
import styles from './FinancialEngine.module.css';

export default function FinancialEngine() {
  const [modelType, setModelType] = useState('masivo');
  const [horizon, setHorizon] = useState(5); // en años
  
  // Inputs del modelo de negocio
  const [inputs, setInputs] = useState({
    ventasIniciales: 50000,
    crecimientoAnualVentas: 15,
    margenBrutoOriginal: 40, // %
    costosEstructuraMensual: 10000,
    inversionInicial: 200000,
    tasaDescuento: 12, // WACC %
    tipoCambioBase: 1, // Si es USD=1, si es otra divisa > 1
    inflacion: 0 // Si se proyecta en divisa dura, 0.
  });

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  // Preset de modelos
  const applyPreset = (type) => {
    setModelType(type);
    if (type === 'masivo') {
      setInputs(i => ({...i, margenBrutoOriginal: 30, ventasIniciales: 100000, costosEstructuraMensual: 15000}));
    } else if (type === 'boutique') {
      setInputs(i => ({...i, margenBrutoOriginal: 70, ventasIniciales: 20000, costosEstructuraMensual: 5000}));
    } else if (type === 'servicios') {
      setInputs(i => ({...i, margenBrutoOriginal: 90, ventasIniciales: 40000, costosEstructuraMensual: 20000}));
    }
  };

  // Motor Principal (Calcula mes a mes y consolida anual si horizonte > 2)
  const projData = useMemo(() => {
    const data = [];
    const { ventasIniciales, crecimientoAnualVentas, margenBrutoOriginal, costosEstructuraMensual, inflacion, inversionInicial } = inputs;
    
    // Año 0 (Setup)
    data.push({
      año: 0,
      Ingresos: 0,
      CostosDirectos: 0,
      MargenBruto: 0,
      CostosEstructura: 0,
      Capex: -inversionInicial,
      FlujoCajaLibre: -inversionInicial
    });

    let ventasP12M = ventasIniciales * 12; 
    let estructuraP12M = costosEstructuraMensual * 12;
    
    // Convert growth and inflation to decimals
    const g = 1 + (crecimientoAnualVentas / 100);
    const inf = 1 + (inflacion / 100);
    
    for (let yr = 1; yr <= horizon; yr++) {
      // Aplicar crecimiento y luego inflación
      const ingresos = ventasP12M * Math.pow(g, yr - 1) * Math.pow(inf, yr - 1);
      const costosDirectos = ingresos * (1 - (margenBrutoOriginal / 100)); // El margen (%) se mantiene
      const margenBruto = ingresos - costosDirectos;
      
      const costosEstruc = estructuraP12M * Math.pow(inf, yr - 1);
      const fcl = margenBruto - costosEstruc; 
      
      data.push({
        año: yr,
        Ingresos: ingresos,
        CostosDirectos: -costosDirectos, // Negativo para tabla
        MargenBruto: margenBruto,
        CostosEstructura: -costosEstruc, // Negativo para tabla
        Capex: 0,
        FlujoCajaLibre: fcl
      });
    }

    return data;
  }, [inputs, horizon]);

  // Cálculos de Evaluación Financiera (sobre FCL)
  const eMetrics = useMemo(() => {
    // Array simple del FCL para las fórnulas: [ -Inversion, Año1, Año2 ... ]
    const cashFlows = projData.map(d => d.FlujoCajaLibre);
    const initialInv = -cashFlows[0]; // CapEx del año 0 (positivo para la formula)
    const futureFlows = cashFlows.slice(1);
    
    const rateDecimal = inputs.tasaDescuento / 100;
    
    const van = calculateNPV(rateDecimal, initialInv, futureFlows);
    const tir = calculateIRR(initialInv, futureFlows);
    const payback = calculatePayback(initialInv, futureFlows);

    return { van, tir: tir ? tir * 100 : null, payback };
  }, [projData, inputs.tasaDescuento]);

  const fCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Modelado Financiero FP&A</h2>
          <p style={{ color: 'var(--secondary-foreground)' }}>Evalúa la viabilidad y rentabilidad (VAN, TIR) de tu proyecto empresarial a largo plazo.</p>
        </div>
      </div>

      <div className={styles.panels}>
        {/* SIDEBAR CON INPUTS */}
        <div className={styles.sidebar}>
          <div className={styles.sectionTitle}><Briefcase size={16} /> Arquitectura del Negocio</div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tesis/Modelo Base</label>
            <select className={styles.select} value={modelType} onChange={e => applyPreset(e.target.value)}>
              <option value="masivo">Consumo Masivo (Rotación)</option>
              <option value="boutique">Servicios/Boutique (Alto Margen)</option>
              <option value="servicios">SaaS / Venta de Horas (Sin COGS)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ventas Mensuales Iniciales</label>
            <div className={styles.numberWithSuffix}>
              <span className={styles.suffix}>$</span>
              <input type="number" value={inputs.ventasIniciales} onChange={e => handleInputChange('ventasIniciales', e.target.value)} />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Margen Bruto (%)</label>
            <div className={styles.numberWithSuffix}>
              <input type="number" value={inputs.margenBrutoOriginal} onChange={e => handleInputChange('margenBrutoOriginal', e.target.value)} />
              <span className={styles.suffix}>%</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Costos de Estructura Fijos (Mensuales)</label>
            <div className={styles.numberWithSuffix}>
              <span className={styles.suffix}>$</span>
              <input type="number" value={inputs.costosEstructuraMensual} onChange={e => handleInputChange('costosEstructuraMensual', e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionTitle} style={{marginTop:'1rem'}}><Activity size={16} /> Escenario Macro & Inversión</div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Inversión / CapEx Inicial (Año 0)</label>
            <div className={styles.numberWithSuffix}>
              <span className={styles.suffix}>$</span>
              <input type="number" value={inputs.inversionInicial} onChange={e => handleInputChange('inversionInicial', e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Crecimiento Anual Esperado de Ventas</label>
            <div className={styles.numberWithSuffix}>
              <input type="number" value={inputs.crecimientoAnualVentas} onChange={e => handleInputChange('crecimientoAnualVentas', e.target.value)} />
              <span className={styles.suffix}>%</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tasa de Descuento (WACC)</label>
            <div className={styles.numberWithSuffix}>
              <input type="number" value={inputs.tasaDescuento} onChange={e => handleInputChange('tasaDescuento', e.target.value)} />
              <span className={styles.suffix}>%</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Horizonte Años</label>
            <select className={styles.select} value={horizon} onChange={e => setHorizon(parseInt(e.target.value))}>
              <option value={3}>3 Años</option>
              <option value={5}>5 Años</option>
              <option value={10}>10 Años</option>
              <option value={20}>20 Años</option>
            </select>
          </div>

        </div>

        {/* MAIN METRICS & CHARTS */}
        <div className={styles.mainContent}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiTitle}>VAN (Net Present Value)</span>
              <span className={`${styles.kpiValue} ${eMetrics.van >= 0 ? styles.positive : styles.negative}`}>
                {fCurrency(eMetrics.van)}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiTitle}>TIR (Internal Rate of Return)</span>
              <span className={`${styles.kpiValue} ${eMetrics.tir >= inputs.tasaDescuento ? styles.positive : styles.negative}`}>
                {eMetrics.tir ? eMetrics.tir.toFixed(2) : '-'} %
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiTitle}>Payback (Repago)</span>
              <span className={styles.kpiValue} style={{ color: 'var(--foreground)' }}>
                {eMetrics.payback ? eMetrics.payback.toFixed(1) + ' Años' : 'No repaga'}
              </span>
            </div>
          </div>

          {/* Gráfico */}
          <div className={styles.chartCard} style={{ height: '350px' }}>
             <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Evolución del Flujo de Caja Libre</h3>
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={projData.slice(1)} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                 <XAxis dataKey="año" tickFormatter={v => `Año ${v}`} stroke="var(--secondary-foreground)" />
                 <YAxis stroke="var(--secondary-foreground)" tickFormatter={(v) => `$${v/1000}k`} />
                 <Tooltip formatter={fCurrency} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />
                 <Legend />
                 <Bar dataKey="FlujoCajaLibre" fill="var(--primary)" name="Flujo Libre (FCF)" radius={[4, 4, 0, 0]} />
               </ComposedChart>
             </ResponsiveContainer>
          </div>

          {/* Cascading P&L Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Concepto P&L</th>
                  {projData.map(d => <th key={d.año}>Año {d.año}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>(+) Ventas / Ingresos</td>
                  {projData.map(d => <td key={d.año}>{d.año === 0 ? '-' : fCurrency(d.Ingresos)}</td>)}
                </tr>
                <tr>
                  <td>(-) Costos Directos (COGS)</td>
                  {projData.map(d => <td key={d.año} style={{ color: 'var(--danger)' }}>{d.año === 0 ? '-' : fCurrency(d.CostosDirectos)}</td>)}
                </tr>
                <tr className={styles.rowNet}>
                  <td>(=) MARGEN BRUTO</td>
                  {projData.map(d => <td key={d.año}>{d.año === 0 ? '-' : fCurrency(d.MargenBruto)}</td>)}
                </tr>
                <tr>
                  <td>(-) Costos de Estructura Fija</td>
                  {projData.map(d => <td key={d.año} style={{ color: 'var(--danger)' }}>{d.año === 0 ? '-' : fCurrency(d.CostosEstructura)}</td>)}
                </tr>
                <tr>
                  <td>(-) Inversión (CapEx)</td>
                  {projData.map(d => <td key={d.año} style={{ color: 'var(--danger)' }}>{d.Capex !== 0 ? fCurrency(d.Capex) : '-'}</td>)}
                </tr>
                <tr className={styles.rowNet} style={{ background: 'var(--primary)', color: 'white' }}>
                  <td style={{ background: 'var(--primary)', color: 'white' }}>FLUJO DE CAJA LIBRE</td>
                  {projData.map(d => <td key={d.año}>{fCurrency(d.FlujoCajaLibre)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
