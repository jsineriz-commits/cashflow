'use client';
import { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateNPV, calculateIRR, calculatePayback } from '@/lib/financialMath';
import { Briefcase, Activity } from 'lucide-react';
import styles from './FinancialEngine.module.css';

export default function FinancialEngine() {
  const [modelType, setModelType] = useState('masivo');
  const [horizon, setHorizon] = useState(5); // en años
  
  // Inputs lógicos globales
  const [inputs, setInputs] = useState({
    ventasIniciales: 50000, // Por periodo (Mes o Año 1 base)
    crecimientoAnualVentas: 15,
    margenBrutoOriginal: 40, // %
    costosEstructuraMes: 10000,
    inversionInicial: 200000,
    tasaDescuento: 12,
    inflacion: 0
  });

  // State para el Spreadsheet (Celdas editadas manualmente)
  // Formato: { "Ventas_14": 9999, "CostosEstructura_5": 12000 } (La key es Campo_Periodo)
  const [overrides, setOverrides] = useState({});

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setOverrides({}); // Reset overrides if base architecture changes
  };

  const applyPreset = (type) => {
    setModelType(type);
    setOverrides({});
    if (type === 'masivo') {
      setInputs(i => ({...i, margenBrutoOriginal: 30, ventasIniciales: 100000, costosEstructuraMes: 15000}));
    } else if (type === 'boutique') {
      setInputs(i => ({...i, margenBrutoOriginal: 70, ventasIniciales: 20000, costosEstructuraMes: 5000}));
    } else if (type === 'servicios') {
      setInputs(i => ({...i, margenBrutoOriginal: 90, ventasIniciales: 40000, costosEstructuraMes: 20000}));
    }
  };

  // Logica de partición: <=5 años = Mensual / >5 años = Anual (por legibilidad UX)
  const isMonthly = horizon <= 5;
  const numPeriods = isMonthly ? (horizon * 12) : horizon;
  const periodLabel = isMonthly ? 'Mes' : 'Año';

  // Helper para leer un valor de celda. Si el usuario lo sobreescribió, lo devuelve, si no, ejecuta el Default.
  const getValue = (field, periodIndex, defaultMathValue) => {
    const key = `${field}_${periodIndex}`;
    return overrides[key] !== undefined ? overrides[key] : defaultMathValue;
  };

  const handleCellEdit = (field, periodIndex, valStr) => {
    const val = parseFloat(valStr);
    const key = `${field}_${periodIndex}`;
    setOverrides(prev => {
      const next = { ...prev };
      if (isNaN(val)) delete next[key]; // Si vacía vuelve a la formula matemática
      else next[key] = val;
      return next;
    });
  };

  // Motor Generador del Spreadsheet Data
  const projData = useMemo(() => {
    const data = [];
    const { ventasIniciales, crecimientoAnualVentas, margenBrutoOriginal, costosEstructuraMes, inflacion, inversionInicial } = inputs;
    
    // Tasas de crecimiento (Adaptadas a Mensual vs Anual)
    const gAnnual = 1 + (crecimientoAnualVentas / 100);
    const infAnnual = 1 + (inflacion / 100);
    const gPeriod = isMonthly ? Math.pow(gAnnual, 1/12) : gAnnual;
    const infPeriod = isMonthly ? Math.pow(infAnnual, 1/12) : infAnnual;

    // AÑO/MES 0 (Setup M0)
    let capexM0 = overrides[`Capex_0`] !== undefined ? overrides[`Capex_0`] : inversionInicial;
    data.push({
      periodoNumber: 0,
      label: `M-0`,
      Ingresos: 0,
      CostosDirectos: 0,
      MargenBruto: 0,
      CostosEstructura: 0,
      Capex: capexM0,
      FlujoCajaLibre: -capexM0
    });

    // P1 Base
    let baseVentas = isMonthly ? ventasIniciales : (ventasIniciales * 12);
    let baseEstruct = isMonthly ? costosEstructuraMes : (costosEstructuraMes * 12);

    for (let t = 1; t <= numPeriods; t++) {
      // 1. Matemáticas Default (Predicciones)
      const mathIngresos = baseVentas * Math.pow(gPeriod, t - 1) * Math.pow(infPeriod, t - 1);
      const mathCostosDirectos = mathIngresos * (1 - (margenBrutoOriginal / 100));
      const mathCostosEstruc = baseEstruct * Math.pow(infPeriod, t - 1);
      const mathCapex = 0;

      // 2. Aplicar Sobrescrituras (Overrides)
      const Ingresos = getValue('Ingresos', t, mathIngresos);
      const CostosDirectos = getValue('CostosDirectos', t, mathCostosDirectos);
      const CostosEstructura = getValue('CostosEstructura', t, mathCostosEstruc);
      const Capex = getValue('Capex', t, mathCapex);

      // 3. Cascada (Fórmulas no editables)
      const MargenBruto = Ingresos - CostosDirectos;
      const FlujoCajaLibre = MargenBruto - CostosEstructura - Capex;
      
      data.push({
        periodoNumber: t,
        label: `${periodLabel} ${t}`,
        Ingresos,
        CostosDirectos,
        MargenBruto,
        CostosEstructura,
        Capex,
        FlujoCajaLibre
      });
    }
    return data;
  }, [inputs, horizon, overrides, isMonthly, numPeriods, periodLabel]);

  // Finanzas: VAN, TIR, Payback
  const eMetrics = useMemo(() => {
    const cashFlows = projData.map(d => d.FlujoCajaLibre);
    
    // El VAN/TIR asumen flujos periodicos. 
    // Si la data es mensual, la tasa ingresada es Anual, hay que transformarla a tasa mensual.
    const rateAnnualDecimal = inputs.tasaDescuento / 100;
    const ratePeriod = isMonthly ? (Math.pow(1 + rateAnnualDecimal, 1/12) - 1) : rateAnnualDecimal;
    
    // Inversion T0 ya es el FCL[0]
    const initialInv = -cashFlows[0]; 
    const futureFlows = cashFlows.slice(1);
    
    const van = calculateNPV(ratePeriod, initialInv, futureFlows);
    let tir = calculateIRR(initialInv, futureFlows);
    // Si la data es mensual, la TIR hallada es mensual, la anualizo:
    if (tir !== null && isMonthly) {
      tir = Math.pow(1 + tir, 12) - 1;
    }
    
    let payback = calculatePayback(initialInv, futureFlows);
    if (payback && isMonthly) payback = payback / 12; // Payback siempre lo mostramos en Años

    return { van, tir: tir ? tir * 100 : null, payback };
  }, [projData, inputs.tasaDescuento, isMonthly]);

  // Helper para rendering celda editable
  const EditableCell = ({ field, d }) => {
    const t = d.periodoNumber;
    const key = `${field}_${t}`;
    const isOverride = overrides[key] !== undefined;
    const value = isOverride ? overrides[key] : d[field];

    return (
      <input 
        type="number"
        className={`${styles.cellInput} ${isOverride ? styles.overridden : ''}`}
        value={Math.round(value)}
        onChange={(e) => handleCellEdit(field, t, e.target.value)}
        title={isOverride ? "Dato editado a mano. Borrar para volver a la matemática predictiva." : ""}
      />
    );
  };

  const fCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Modelado Financiero FP&A (Spreadsheet)</h2>
          <p style={{ color: 'var(--secondary-foreground)' }}>Puedes escribir directamente sobre la cuadrícula (ej. modificar capex o costos locales de un mes específico).</p>
        </div>
      </div>

      <div className={styles.panels}>
        <div className={styles.sidebar}>
          <div className={styles.sectionTitle}><Briefcase size={16} /> Arquitectura Base</div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Modelo Predictivo</label>
            <select className={styles.select} value={modelType} onChange={e => applyPreset(e.target.value)}>
              <option value="masivo">Consumo Masivo</option>
              <option value="boutique">Boutique / Premium</option>
              <option value="servicios">Servicios (SaaS/Horas)</option>
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
            <label className={styles.label}>Tasa de Descuento (WACC)</label>
            <div className={styles.numberWithSuffix}>
              <input type="number" value={inputs.tasaDescuento} onChange={e => handleInputChange('tasaDescuento', e.target.value)} />
              <span className={styles.suffix}>%</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Horizonte Años</label>
            <select className={styles.select} value={horizon} onChange={e => setHorizon(parseInt(e.target.value))}>
              <option value={1}>1 Año (Vista 12 Meses)</option>
              <option value={3}>3 Años (Vista 36 Meses)</option>
              <option value={5}>5 Años (Vista 60 Meses)</option>
              <option value={10}>10 Años (Agrupado Anual)</option>
              <option value={20}>20 Años (Agrupado Anual)</option>
            </select>
            <span style={{fontSize:'0.7rem', color:'var(--success)', marginTop:'3px'}}>* {isMonthly ? 'Desglose Mensual' : 'Desglose Anual automático'}</span>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <span className={styles.kpiTitle}>VAN (Net Present Value)</span>
              <span className={`${styles.kpiValue} ${eMetrics.van >= 0 ? styles.positive : styles.negative}`}>
                {fCurrency(eMetrics.van)}
              </span>
            </div>
            <div className={styles.kpiCard}>
              <span className={styles.kpiTitle}>TIR Anualizada (IRR)</span>
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

          {/* Master Chart */}
          <div className={styles.chartCard} style={{ height: '300px' }}>
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={projData.slice(1)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                 <XAxis dataKey="label" stroke="var(--secondary-foreground)" fontSize={12} />
                 <YAxis stroke="var(--secondary-foreground)" tickFormatter={(v) => `$${v/1000}k`} fontSize={12} width={60} />
                 <Tooltip formatter={fCurrency} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }} />
                 <Legend />
                 <Bar dataKey="FlujoCajaLibre" fill="var(--primary)" name="Flujo Libre Re-Cálculo" radius={[2, 2, 0, 0]} />
                 <Line type="monotone" dataKey="CostosEstructura" stroke="#ef4444" name="Costos Fijos" strokeWidth={2} dot={false} />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
          
          {/* Scrollable Editable Data Grid */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Concepto Modificable</th>
                  {projData.map(d => <th key={d.periodoNumber}>{d.label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>(+) Ventas / Ingresos Brutos</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="Ingresos" d={d} />}</td>)}
                </tr>
                <tr>
                  <td>(-) Costos Operativos (COGS)</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="CostosDirectos" d={d} />}</td>)}
                </tr>
                <tr className={styles.rowNet}>
                  <td>(=) MARGEN BRUTO (Auto)</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : fCurrency(d.MargenBruto)}</td>)}
                </tr>
                <tr>
                  <td>(-) Egresos Estructura Fija</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="CostosEstructura" d={d} />}</td>)}
                </tr>
                <tr>
                  <td>(-) Inversiones / CapEx</td>
                  {projData.map(d => <td key={d.periodoNumber}><EditableCell field="Capex" d={d} /></td>)}
                </tr>
                <tr className={styles.rowNet} style={{ background: 'var(--primary)', color: 'white' }}>
                  <td style={{ background: 'var(--primary)', color: 'white' }}>FLUJO DE CAJA LIBRE</td>
                  {projData.map(d => <td key={d.periodoNumber} style={{ textAlign: 'right' }}>{fCurrency(d.FlujoCajaLibre)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
