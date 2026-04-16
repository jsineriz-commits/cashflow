'use client';
import { useState, useMemo } from 'react';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateNPV, calculateIRR, calculatePayback } from '@/lib/financialMath';
import { Briefcase, Settings } from 'lucide-react';
import styles from './FinancialEngine.module.css';

export default function FinancialEngine() {
  const [modelType, setModelType] = useState('saas');
  const [horizon, setHorizon] = useState(5); 
  
  // -- INPUTS POR INDUSTRIA --
  // 1. SaaS / Venta de Servicios B2B
  const [saasInput, setSaasInput] = useState({
    nuevosClientesMes: 20,
    crecimientoAdquisicion: 5, // %
    ticketMensualMRR: 150,
    churnRate: 2, // % que se da de baja
    marketingCacMensual: 5000,
    costoServidoresCliente: 5, // AWS x user
    staffFijoMensual: 12000,
    inversionDesarrollo: 50000,
  });

  // 2. FMCG / Consumo Masivo / Industrial
  const [fmcgInput, setFmcgInput] = useState({
    volumenUnidadesMes: 15000,
    crecimientoVolumen: 10,
    precioUnidadFabricada: 80,
    costoVariableUnidad: 35, // Materia prima + empaque
    logisticaFleteUnidad: 5, // Costo variable extra
    costoFijoPlanta: 250000,
    maquinariaCapex: 2000000
  });

  // 3. Boutique / Retail E-Commerce
  const [boutiqueInput, setBoutiqueInput] = useState({
    traficoMensual: 50000, // visitantes
    crecimientoTrafico: 15,
    tasaConversion: 1.5, // %
    ticketPromedioAOV: 12000, // $
    multiplicadorMarkup: 3, // Regla Retail: compro a 1, vendo a 3 (margen 66%)
    alquilerYPersonal: 800000,
    setupLocalFranquicia: 15000000
  });

  // Variables Macro comunes
  const [macroInput, setMacroInput] = useState({ tasaDescuento: 12 });
  const [overrides, setOverrides] = useState({});

  const handleInputChange = (setter, field, value) => {
    setter(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setOverrides({});
  };

  const isMonthly = horizon <= 5;
  const numPeriods = isMonthly ? (horizon * 12) : horizon;
  const periodLabel = isMonthly ? 'Mes' : 'Año';

  const getValue = (field, periodIndex, defaultMathValue) => {
    const key = `${field}_${periodIndex}`;
    return overrides[key] !== undefined ? overrides[key] : defaultMathValue;
  };

  const handleCellEdit = (field, periodIndex, valStr) => {
    const val = parseFloat(valStr);
    const key = `${field}_${periodIndex}`;
    setOverrides(prev => {
      const next = { ...prev };
      if (isNaN(val)) delete next[key]; 
      else next[key] = val;
      return next;
    });
  };

  // Motor Core (Generación Multimodelo)
  const projData = useMemo(() => {
    const data = [];
    const gAnnual = macroInput.tasaDescuento / 100; // Just for ref, discount is used in NPV

    // AÑO 0 Dinámico
    let capexM0 = 0;
    if (modelType === 'saas') capexM0 = saasInput.inversionDesarrollo;
    if (modelType === 'fmcg') capexM0 = fmcgInput.maquinariaCapex;
    if (modelType === 'boutique') capexM0 = boutiqueInput.setupLocalFranquicia;
    capexM0 = getValue('Capex', 0, capexM0);

    data.push({
      periodoNumber: 0,
      label: `M-0`,
      Ingresos: 0, CostosDirectos: 0, MargenBruto: 0,
      CostosEstructura: 0, Capex: capexM0, FlujoCajaLibre: -capexM0,
      // Metadata extra util para reportes
      ClientesActivos: 0, Volumen: 0, Visitas: 0
    });

    // Tracking acumulativo
    let clientesAcumulados = 0;

    for (let t = 1; t <= numPeriods; t++) {
      // Modificadores de crecimiento adaptados a Mes o Año
      const gPeriodCustom = (growthAnual) => isMonthly ? Math.pow(1+(growthAnual/100), 1/12) : (1+(growthAnual/100));
      
      let mathIngresos = 0, mathCostosDirectos = 0, mathCostosEstruc = 0, meta1 = 0;

      // ---- BRANCH: SAAS ----
      if (modelType === 'saas') {
        const factorAdquisicion = Math.pow(gPeriodCustom(saasInput.crecimientoAdquisicion), t-1);
        const altasNuevas = isMonthly ? (saasInput.nuevosClientesMes * factorAdquisicion) : (saasInput.nuevosClientesMes * 12 * factorAdquisicion);
        
        // Churn calculation
        const churnDec = saasInput.churnRate / 100;
        const bajas = clientesAcumulados * (isMonthly ? churnDec : (churnDec*12)); 
        clientesAcumulados = Math.max(0, clientesAcumulados + altasNuevas - bajas);

        mathIngresos = clientesAcumulados * saasInput.ticketMensualMRR * (isMonthly ? 1 : 12);
        
        const marketing = isMonthly ? saasInput.marketingCacMensual : saasInput.marketingCacMensual*12;
        const hosting = clientesAcumulados * saasInput.costoServidoresCliente * (isMonthly ? 1 : 12);
        mathCostosDirectos = marketing + hosting;
        
        mathCostosEstruc = isMonthly ? saasInput.staffFijoMensual : saasInput.staffFijoMensual*12;
        meta1 = clientesAcumulados; // Activos
      }
      // ---- BRANCH: FMCG ----
      else if (modelType === 'fmcg') {
        const factorCrecimiento = Math.pow(gPeriodCustom(fmcgInput.crecimientoVolumen), t-1);
        const volumen = (isMonthly ? fmcgInput.volumenUnidadesMes : fmcgInput.volumenUnidadesMes*12) * factorCrecimiento;
        
        mathIngresos = volumen * fmcgInput.precioUnidadFabricada;
        mathCostosDirectos = volumen * (fmcgInput.costoVariableUnidad + fmcgInput.logisticaFleteUnidad);
        mathCostosEstruc = isMonthly ? fmcgInput.costoFijoPlanta : fmcgInput.costoFijoPlanta*12;
        meta1 = volumen;
      }
      // ---- BRANCH: BOUTIQUE ----
      else if (modelType === 'boutique') {
        const factorTrafico = Math.pow(gPeriodCustom(boutiqueInput.crecimientoTrafico), t-1);
        const trafico = (isMonthly ? boutiqueInput.traficoMensual : boutiqueInput.traficoMensual*12) * factorTrafico;
        const ventas = trafico * (boutiqueInput.tasaConversion / 100);
        
        mathIngresos = ventas * boutiqueInput.ticketPromedioAOV;
        // Costo = Ingreso / Markup Multiplier
        mathCostosDirectos = mathIngresos / boutiqueInput.multiplicadorMarkup; 
        mathCostosEstruc = isMonthly ? boutiqueInput.alquilerYPersonal : boutiqueInput.alquilerYPersonal*12;
        meta1 = ventas; // Operaciones
      }

      // Aplicar overrides
      const Ingresos = getValue('Ingresos', t, mathIngresos);
      const CostosDirectos = getValue('CostosDirectos', t, mathCostosDirectos);
      const CostosEstructura = getValue('CostosEstructura', t, mathCostosEstruc);
      const Capex = getValue('Capex', t, 0);

      const MargenBruto = Ingresos - CostosDirectos;
      const FlujoCajaLibre = MargenBruto - CostosEstructura - Capex;
      
      data.push({
        periodoNumber: t,
        label: `${periodLabel} ${t}`,
        Ingresos, CostosDirectos, MargenBruto, CostosEstructura, Capex, FlujoCajaLibre, Meta1: meta1
      });
    }
    return data;
  }, [modelType, saasInput, fmcgInput, boutiqueInput, macroInput, horizon, overrides, isMonthly, numPeriods, periodLabel]);

  // Cálculos Financieros
  const eMetrics = useMemo(() => {
    const cashFlows = projData.map(d => d.FlujoCajaLibre);
    const rateAnnualDecimal = macroInput.tasaDescuento / 100;
    const ratePeriod = isMonthly ? (Math.pow(1 + rateAnnualDecimal, 1/12) - 1) : rateAnnualDecimal;
    
    const initialInv = -cashFlows[0]; 
    const futureFlows = cashFlows.slice(1);
    
    const van = calculateNPV(ratePeriod, initialInv, futureFlows);
    let tir = calculateIRR(initialInv, futureFlows);
    if (tir !== null && isMonthly) tir = Math.pow(1 + tir, 12) - 1;
    
    let payback = calculatePayback(initialInv, futureFlows);
    if (payback && isMonthly) payback = payback / 12;

    return { van, tir: tir ? tir * 100 : null, payback };
  }, [projData, macroInput, isMonthly]);

  const fCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  const EditableCell = ({ field, d }) => {
    const t = d.periodoNumber;
    const key = `${field}_${t}`;
    const value = overrides[key] !== undefined ? overrides[key] : d[field];
    return <input type="number" className={`${styles.cellInput} ${overrides[key] !== undefined ? styles.overridden : ''}`} value={Math.round(value)} onChange={(e) => handleCellEdit(field, t, e.target.value)} />;
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>FP&A Avanzado: {modelType.toUpperCase()}</h2>
          <p style={{ color: 'var(--secondary-foreground)' }}>Modelo adaptativo según unidad de negocio (SaaS, FMCG o Retail).</p>
        </div>
      </div>

      <div className={styles.panels}>
        {/* COLLAPSIBLE SIDEBAR: Hover to expand */}
        <div className={styles.sidebarWrapper}>
          <div className={styles.sidebarHandle}>
            <Settings size={20} />
            <span>AJUSTES</span>
          </div>
          <div className={styles.sidebarContent}>
            <div className={styles.sectionTitle}><Briefcase size={16} /> Arquitectura Tesis</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nicho Específico</label>
              <select className={styles.select} value={modelType} onChange={e => {setModelType(e.target.value); setOverrides({});}}>
                <option value="saas">SaaS / Suscripción</option>
                <option value="fmcg">Fábrica (FMCG)</option>
                <option value="boutique">Boutique Retail</option>
              </select>
            </div>

            {/* CONDITIONAL INPUTS */}
            {modelType === 'saas' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Nuevos Clientes (Mensual)</label><input className={styles.input} type="number" value={saasInput.nuevosClientesMes} onChange={e=>handleInputChange(setSaasInput, 'nuevosClientesMes', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>MRR por Cliente ($)</label><input className={styles.input} type="number" value={saasInput.ticketMensualMRR} onChange={e=>handleInputChange(setSaasInput, 'ticketMensualMRR', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Churn Mensual (%)</label><input className={styles.input} type="number" value={saasInput.churnRate} onChange={e=>handleInputChange(setSaasInput, 'churnRate', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Inversión Inicial Dev ($)</label><input className={styles.input} type="number" value={saasInput.inversionDesarrollo} onChange={e=>handleInputChange(setSaasInput, 'inversionDesarrollo', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Marketing Performance ($/mes)</label><input className={styles.input} type="number" value={saasInput.marketingCacMensual} onChange={e=>handleInputChange(setSaasInput, 'marketingCacMensual', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Costos de Staff ($/mes)</label><input className={styles.input} type="number" value={saasInput.staffFijoMensual} onChange={e=>handleInputChange(setSaasInput, 'staffFijoMensual', e.target.value)}/></div>
              </>
            )}

            {modelType === 'fmcg' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Volumen (Unidades/Mes)</label><input className={styles.input} type="number" value={fmcgInput.volumenUnidadesMes} onChange={e=>handleInputChange(setFmcgInput, 'volumenUnidadesMes', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Crecimiento Anual Demanda (%)</label><input className={styles.input} type="number" value={fmcgInput.crecimientoVolumen} onChange={e=>handleInputChange(setFmcgInput, 'crecimientoVolumen', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Precio Lista Venta ($)</label><input className={styles.input} type="number" value={fmcgInput.precioUnidadFabricada} onChange={e=>handleInputChange(setFmcgInput, 'precioUnidadFabricada', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Costo Unitario Fabricación ($)</label><input className={styles.input} type="number" value={fmcgInput.costoVariableUnidad} onChange={e=>handleInputChange(setFmcgInput, 'costoVariableUnidad', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Fijos de Fábrica ($/mes)</label><input className={styles.input} type="number" value={fmcgInput.costoFijoPlanta} onChange={e=>handleInputChange(setFmcgInput, 'costoFijoPlanta', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>CapEx Máquinas (Año 0)</label><input className={styles.input} type="number" value={fmcgInput.maquinariaCapex} onChange={e=>handleInputChange(setFmcgInput, 'maquinariaCapex', e.target.value)}/></div>
              </>
            )}

            {modelType === 'boutique' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Tráfico Público (Mensual)</label><input className={styles.input} type="number" value={boutiqueInput.traficoMensual} onChange={e=>handleInputChange(setBoutiqueInput, 'traficoMensual', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Tasa de Conversión a Compra (%)</label><input className={styles.input} type="number" value={boutiqueInput.tasaConversion} onChange={e=>handleInputChange(setBoutiqueInput, 'tasaConversion', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>AOV (Ticket Promedio / $)</label><input className={styles.input} type="number" value={boutiqueInput.ticketPromedioAOV} onChange={e=>handleInputChange(setBoutiqueInput, 'ticketPromedioAOV', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Multiplier Retail (2x, 3x Costo)</label><input className={styles.input} type="number" value={boutiqueInput.multiplicadorMarkup} onChange={e=>handleInputChange(setBoutiqueInput, 'multiplicadorMarkup', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Alquiler Comercial + Staff ($/Mes)</label><input className={styles.input} type="number" value={boutiqueInput.alquilerYPersonal} onChange={e=>handleInputChange(setBoutiqueInput, 'alquilerYPersonal', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Derecho / Lave del Local (Año 0)</label><input className={styles.input} type="number" value={boutiqueInput.setupLocalFranquicia} onChange={e=>handleInputChange(setBoutiqueInput, 'setupLocalFranquicia', e.target.value)}/></div>
              </>
            )}

            <div className={styles.sectionTitle}>Horizonte & Tasa</div>
            <div className={styles.formGroup}><label className={styles.label}>WACC / Tasa Exigida (%)</label><input className={styles.input} type="number" value={macroInput.tasaDescuento} onChange={e=>handleInputChange(setMacroInput, 'tasaDescuento', e.target.value)}/></div>
            <div className={styles.formGroup}>
              <select className={styles.select} value={horizon} onChange={e=>setHorizon(parseInt(e.target.value))}>
                <option value={3}>3 Años M-to-M</option>
                <option value={5}>5 Años M-to-M</option>
                <option value={10}>10 Años Anualizado</option>
              </select>
            </div>
            
          </div>
        </div>

        {/* MAIN PANEL CONTENT */}
        <div className={styles.mainContent}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>VAN (Net Present Value)</span><span className={`${styles.kpiValue} ${eMetrics.van >= 0 ? styles.positive : styles.negative}`}>{fCurrency(eMetrics.van)}</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>TIR Anualizada (IRR)</span><span className={`${styles.kpiValue} ${eMetrics.tir >= macroInput.tasaDescuento ? styles.positive : styles.negative}`}>{eMetrics.tir !== null ? eMetrics.tir.toFixed(2) : '-'} %</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>Payback Estimado</span><span className={styles.kpiValue} style={{color:'var(--foreground)'}}>{eMetrics.payback !== null ? eMetrics.payback.toFixed(1) + ' Años' : 'N/A'}</span></div>
          </div>

          <div className={styles.chartCard} style={{ height: '360px' }}>
             {/* AESTHETIC SVG GRADIENTS */}
             <svg width="0" height="0">
                <defs>
                  <linearGradient id="colorFcl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="rgba(0,0,0,0.15)"/>
                  </filter>
                </defs>
             </svg>
             <h3 style={{fontSize:'1rem', margin:'0 0 10px 0'}}>Proyección de Beneficios</h3>
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={projData.slice(1)} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} opacity={0.6} />
                 <XAxis dataKey="label" stroke="var(--secondary-foreground)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                 <YAxis stroke="var(--secondary-foreground)" tickFormatter={(v) => `$${v/1000}k`} fontSize={11} width={50} axisLine={false} tickLine={false} />
                 <Tooltip formatter={fCurrency} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '12px', borderColor: 'var(--primary)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: 'white' }} />
                 <Legend wrapperStyle={{ paddingTop: '10px' }} />
                 <Area type="monotone" dataKey="FlujoCajaLibre" stroke="var(--primary)" fillOpacity={1} fill="url(#colorFcl)" name="Cashflow Operativo" strokeWidth={3} filter="url(#shadow)" />
                 <Line type="monotone" dataKey="CostosEstructura" stroke="#ef4444" name="Desgaste Fijo" strokeWidth={2} dot={false} strokeDasharray="5 5" />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Componentes (Editable ✓)</th>
                  {projData.map(d => <th key={d.periodoNumber}>{d.label}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{modelType==='saas'?'Suscriptores Activos (Auto)':'Demanda Estimada (Auto)'}</td>
                  {projData.map(d => <td style={{color:'var(--secondary-foreground)'}} key={d.periodoNumber}>{d.periodoNumber===0?'-': Math.round(d.Meta1)}</td>)}
                </tr>
                <tr>
                  <td>(+) Ventas Consolidadas</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="Ingresos" d={d} />}</td>)}
                </tr>
                <tr>
                  <td>(-) Costo de Entregable (Var.)</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="CostosDirectos" d={d} />}</td>)}
                </tr>
                <tr className={styles.rowNet}>
                  <td>(=) MARGEN DE EXPLOTACIÓN</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : fCurrency(d.MargenBruto)}</td>)}
                </tr>
                <tr>
                  <td>(-) Gasto de Estructura Inflex.</td>
                  {projData.map(d => <td key={d.periodoNumber}>{d.periodoNumber === 0 ? '-' : <EditableCell field="CostosEstructura" d={d} />}</td>)}
                </tr>
                <tr>
                  <td>(-) Erogación de Capital (CapEx)</td>
                  {projData.map(d => <td key={d.periodoNumber}><EditableCell field="Capex" d={d} /></td>)}
                </tr>
                <tr className={styles.rowNet} style={{ background: 'linear-gradient(90deg, var(--primary) 0%, rgba(99,102,241,0.8) 100%)', color: 'white' }}>
                  <td style={{ background: 'var(--primary)', color: 'white', fontWeight:'700', letterSpacing:'1px' }}>FREE CASHFLOW</td>
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
