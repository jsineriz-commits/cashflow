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
  const [saasInput, setSaasInput] = useState({
    nuevosClientesMes: 20, crecimientoAdquisicion: 5, ticketMensualMRR: 150, churnRate: 2, 
    marketingCacMensual: 5000, costoServidoresCliente: 5, staffFijoMensual: 12000, inversionDesarrollo: 50000,
  });

  const [fmcgInput, setFmcgInput] = useState({
    volumenUnidadesMes: 15000, crecimientoVolumen: 10, precioUnidadFabricada: 80, 
    costoVariableUnidad: 35, logisticaFleteUnidad: 5, costoFijoPlanta: 250000, maquinariaCapex: 2000000
  });

  const [boutiqueInput, setBoutiqueInput] = useState({
    traficoMensual: 50000, crecimientoTrafico: 15, tasaConversion: 1.5, ticketPromedioAOV: 12000, 
    multiplicadorMarkup: 3, alquilerYPersonal: 800000, setupLocalFranquicia: 15000000
  });

  const [macroInput, setMacroInput] = useState({ tasaDescuento: 12 });
  const [overrides, setOverrides] = useState({});
  const [expandedYears, setExpandedYears] = useState({ 1: true }); // Por defecto el año 1 arranca expandido

  const handleInputChange = (setter, field, value) => {
    setter(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    setOverrides({});
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const getValue = (field, periodIndex, defaultMathValue) => {
    const key = `${field}_${periodIndex}`;
    return overrides[key] !== undefined ? overrides[key] : defaultMathValue;
  };

  const handleCellEdit = (field, periodIndex, valStr, isAnnualGroup = false) => {
    const val = parseFloat(valStr);
    
    setOverrides(prev => {
      const next = { ...prev };
      
      if (isAnnualGroup) {
        // Prorrateo Cascada: Si el usuario edita el año agrupado, dividimos el valor en 12 meses.
        // `periodIndex` en este caso es el Año X
        const monthStart = (periodIndex - 1) * 12 + 1;
        const monthEnd = periodIndex * 12;
        
        if (isNaN(val)) {
           // Si blanquea la celda, quitamos todos los overrides
           for(let m=monthStart; m<=monthEnd; m++) delete next[`${field}_${m}`];
        } else {
           // Regla de distribución (podría ser equitativa o ponderada, pero usaremos equitativa)
           const monthlyShare = val / 12;
           for(let m=monthStart; m<=monthEnd; m++) next[`${field}_${m}`] = monthlyShare;
        }
      } else {
        // Edición Mensual Standard
        const key = `${field}_${periodIndex}`;
        if (isNaN(val)) delete next[key]; 
        else next[key] = val;
      }
      return next;
    });
  };

  // Motor Core con FOREWARD PROPAGATION (Cascada Acumulativa)
  const projDataAllMonths = useMemo(() => {
    const data = [];
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
      ClientesActivos: 0, Volumen: 0, Visitas: 0
    });

    const numMonths = horizon * 12;
    // Tasas Anuales a Mensuales reales
    const growthSaasAdqM = Math.pow(1+(saasInput.crecimientoAdquisicion/100), 1/12);
    const growthFmcgVolM = Math.pow(1+(fmcgInput.crecimientoVolumen/100), 1/12);
    const growthBoutTrafM= Math.pow(1+(boutiqueInput.crecimientoTrafico/100), 1/12);
    const churnM = saasInput.churnRate / 100;

    for (let t = 1; t <= numMonths; t++) {
      let prev = data[t - 1]; // Toma la iteración inmediatamente anterior
      
      let mathIngresos = 0, mathCostosDirectos = 0, mathCostosEstruc = 0, meta1 = 0;

      // ---- BRANCH: SAAS ----
      if (modelType === 'saas') {
        const clientAdqBase = t === 1 ? saasInput.nuevosClientesMes : prev.altasNuevas * growthSaasAdqM;
        const altasNuevas = getValue('Altas', t, clientAdqBase);
        
        const bajas = prev.ClientesActivos * churnM; 
        const prevCL = prev.ClientesActivos || 0;
        const clientsNow = Math.max(0, prevCL + altasNuevas - bajas);

        mathIngresos = clientsNow * saasInput.ticketMensualMRR;
        mathCostosDirectos = saasInput.marketingCacMensual + (clientsNow * saasInput.costoServidoresCliente);
        mathCostosEstruc = saasInput.staffFijoMensual;
        meta1 = clientsNow;
        data[t] = { altasNuevas }; // Tracking local
      }
      // ---- BRANCH: FMCG ----
      else if (modelType === 'fmcg') {
        const volBase = t === 1 ? fmcgInput.volumenUnidadesMes : prev.Meta1 * growthFmcgVolM;
        const volumen = getValue('Volumen', t, volBase);
        
        mathIngresos = volumen * fmcgInput.precioUnidadFabricada;
        mathCostosDirectos = volumen * (fmcgInput.costoVariableUnidad + fmcgInput.logisticaFleteUnidad);
        mathCostosEstruc = fmcgInput.costoFijoPlanta;
        meta1 = volumen;
      }
      // ---- BRANCH: BOUTIQUE ----
      else if (modelType === 'boutique') {
        // The Meta1 will carry the "Trafico Mensual", not just ventas, to propagate growth properly
        const traficoBase = t === 1 ? boutiqueInput.traficoMensual : prev.traficoTrack * growthBoutTrafM;
        const trafico = getValue('Trafico', t, traficoBase);
        const ventas = trafico * (boutiqueInput.tasaConversion / 100);
        
        mathIngresos = ventas * boutiqueInput.ticketPromedioAOV;
        mathCostosDirectos = mathIngresos / boutiqueInput.multiplicadorMarkup; 
        mathCostosEstruc = boutiqueInput.alquilerYPersonal;
        meta1 = ventas; 
        data[t] = { traficoTrack: trafico };
      }

      // 3. Aplicar overrides FINAL de Dinero (si escribis el Ingreso, PISA tu volumen o conversion)
      const Ingresos = getValue('Ingresos', t, mathIngresos);
      const CostosDirectos = getValue('CostosDirectos', t, mathCostosDirectos);
      const CostosEstructura = getValue('CostosEstructura', t, mathCostosEstruc);
      const Capex = getValue('Capex', t, 0);

      const MargenBruto = Ingresos - CostosDirectos;
      const FlujoCajaLibre = MargenBruto - CostosEstructura - Capex;
      
      data[t] = {
        ...data[t],
        periodoNumber: t,
        label: `M ${t}`,
        Ingresos, CostosDirectos, MargenBruto, CostosEstructura, Capex, FlujoCajaLibre, 
        Meta1: meta1, ClientesActivos: meta1
      };
    }
    return data;
  }, [modelType, saasInput, fmcgInput, boutiqueInput, horizon, overrides]);

  // Cálculos Financieros
  const eMetrics = useMemo(() => {
    const cashFlows = projDataAllMonths.map(d => d.FlujoCajaLibre);
    const rateAnnualDecimal = macroInput.tasaDescuento / 100;
    const rateMonth = Math.pow(1 + rateAnnualDecimal, 1/12) - 1;
    
    const initialInv = -cashFlows[0]; 
    const futureFlows = cashFlows.slice(1);
    
    const van = calculateNPV(rateMonth, initialInv, futureFlows);
    let tir = calculateIRR(initialInv, futureFlows);
    if (tir !== null) tir = Math.pow(1 + tir, 12) - 1;
    
    let payback = calculatePayback(initialInv, futureFlows);
    if (payback) payback = payback / 12;

    return { van, tir: tir ? tir * 100 : null, payback };
  }, [projDataAllMonths, macroInput]);

  // AGRUPADO TREE GRID RENDERER
  const gridColumns = useMemo(() => {
    const cols = [];
    cols.push({ isMonth: false, ...projDataAllMonths[0] }); // M0

    for (let yr = 1; yr <= horizon; yr++) {
      const monthStart = (yr - 1) * 12 + 1;
      const monthEnd = yr * 12;

      if (expandedYears[yr]) {
        // Si está expandido agregamos los 12 meses individuales
        for (let m = monthStart; m <= monthEnd; m++) {
          cols.push({ isMonth: true, yearBlock: yr, ...projDataAllMonths[m] });
        }
      } else {
        // Si está colapsado, generamos una columna sumaria (El acumulador anual)
        let sumIngresos = 0, sumCostos = 0, sumEstructura = 0, sumCapex = 0, sumFCL = 0, sumMB = 0;
        let lastMeta1 = projDataAllMonths[monthEnd]?.Meta1; // Take end of year metric (e.g. active clients)
        
        // Sumamos
        for(let m = monthStart; m <= monthEnd; m++) {
           const d = projDataAllMonths[m];
           sumIngresos += d.Ingresos;
           sumCostos += d.CostosDirectos;
           sumEstructura += d.CostosEstructura;
           sumCapex += d.Capex;
           sumMB += d.MargenBruto;
           sumFCL += d.FlujoCajaLibre;
        }

        cols.push({
          isMonth: false,
          isAnnualSummary: true,
          periodoNumber: yr, // year tracking number
          label: `Total Año ${yr}`,
          Ingresos: sumIngresos, CostosDirectos: sumCostos, CostosEstructura: sumEstructura,
          Capex: sumCapex, MargenBruto: sumMB, FlujoCajaLibre: sumFCL, Meta1: lastMeta1
        });
      }
    }
    return cols;
  }, [projDataAllMonths, horizon, expandedYears]);

  // Generación de Data para Chart (Anualizada para evitar ruido en gráficos)
  const chartData = useMemo(() => {
     let chart = [];
     for(let yr=1; yr<=horizon; yr++){
        const baseStart = (yr-1)*12 + 1;
        let sumFCL = 0, sumCE = 0;
        for(let m=baseStart; m<=yr*12; m++) { sumFCL += projDataAllMonths[m].FlujoCajaLibre; sumCE += projDataAllMonths[m].CostosEstructura; }
        chart.push({ label: `Y${yr}`, FlujoCajaLibre: sumFCL, CostosEstructura: sumCE });
     }
     return chart;
  }, [projDataAllMonths, horizon]);

  const fCurrency = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const EditableCell = ({ field, col }) => {
    // Si es Month = periodoNumber es 't'
    // Si es AnnualSummary = periodoNumber es 'yr'
    const isOverride = 
       col.isMonth ? (overrides[`${field}_${col.periodoNumber}`] !== undefined)
                   : false; // Annual summary overides are harder to detect cleanly as they are arrays, we just color input if it happened
                   
    // Small check to see if an annual group has an override inside
    const hasAnyOverride = !col.isMonth && col.isAnnualSummary ? (
       Array.from({length: 12}, (_, i) => overrides[`${field}_${((col.periodoNumber-1)*12+1)+i}`]).some(x => x !== undefined)
    ) : isOverride;

    return (
      <input 
        type="number" 
        className={`${styles.cellInput} ${hasAnyOverride ? styles.overridden : ''}`} 
        value={Math.round(col[field])} 
        onChange={(e) => handleCellEdit(field, col.periodoNumber, e.target.value, col.isAnnualSummary)} 
      />
    );
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>FP&A Avanzado: {modelType.toUpperCase()}</h2>
          <p style={{ color: 'var(--secondary-foreground)' }}>Modelo en Cascada (Forward-Propagating) con Agrupación Anual Dinámica.</p>
        </div>
      </div>

      <div className={styles.panels}>
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
            {modelType === 'saas' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Nuevos Clientes (M1 Base)</label><input className={styles.input} type="number" value={saasInput.nuevosClientesMes} onChange={e=>handleInputChange(setSaasInput, 'nuevosClientesMes', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Crec. de Adquisición Anual(%)</label><input className={styles.input} type="number" value={saasInput.crecimientoAdquisicion} onChange={e=>handleInputChange(setSaasInput, 'crecimientoAdquisicion', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>MRR por Cliente ($)</label><input className={styles.input} type="number" value={saasInput.ticketMensualMRR} onChange={e=>handleInputChange(setSaasInput, 'ticketMensualMRR', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Churn Mensual (%)</label><input className={styles.input} type="number" value={saasInput.churnRate} onChange={e=>handleInputChange(setSaasInput, 'churnRate', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Costo Dev Inicial (M0)</label><input className={styles.input} type="number" value={saasInput.inversionDesarrollo} onChange={e=>handleInputChange(setSaasInput, 'inversionDesarrollo', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Marketing Base ($/mes)</label><input className={styles.input} type="number" value={saasInput.marketingCacMensual} onChange={e=>handleInputChange(setSaasInput, 'marketingCacMensual', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Headcount Staff Base ($/mes)</label><input className={styles.input} type="number" value={saasInput.staffFijoMensual} onChange={e=>handleInputChange(setSaasInput, 'staffFijoMensual', e.target.value)}/></div>
              </>
            )}

            {modelType === 'fmcg' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Volumen Base (Uds/M1)</label><input className={styles.input} type="number" value={fmcgInput.volumenUnidadesMes} onChange={e=>handleInputChange(setFmcgInput, 'volumenUnidadesMes', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Crecimiento Anual Volumen (%)</label><input className={styles.input} type="number" value={fmcgInput.crecimientoVolumen} onChange={e=>handleInputChange(setFmcgInput, 'crecimientoVolumen', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Precio Lista Venta ($)</label><input className={styles.input} type="number" value={fmcgInput.precioUnidadFabricada} onChange={e=>handleInputChange(setFmcgInput, 'precioUnidadFabricada', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Costo Variable Unidad ($)</label><input className={styles.input} type="number" value={fmcgInput.costoVariableUnidad} onChange={e=>handleInputChange(setFmcgInput, 'costoVariableUnidad', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Planta Operativa Base ($/m)</label><input className={styles.input} type="number" value={fmcgInput.costoFijoPlanta} onChange={e=>handleInputChange(setFmcgInput, 'costoFijoPlanta', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>CapEx Máquinas (M0)</label><input className={styles.input} type="number" value={fmcgInput.maquinariaCapex} onChange={e=>handleInputChange(setFmcgInput, 'maquinariaCapex', e.target.value)}/></div>
              </>
            )}

            {modelType === 'boutique' && (
              <>
                <div className={styles.formGroup}><label className={styles.label}>Tráfico Inicial Mensual</label><input className={styles.input} type="number" value={boutiqueInput.traficoMensual} onChange={e=>handleInputChange(setBoutiqueInput, 'traficoMensual', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Crecimiento Orgánico Anual(%)</label><input className={styles.input} type="number" value={boutiqueInput.crecimientoTrafico} onChange={e=>handleInputChange(setBoutiqueInput, 'crecimientoTrafico', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Tasa Conversión (Compra %)</label><input className={styles.input} type="number" value={boutiqueInput.tasaConversion} onChange={e=>handleInputChange(setBoutiqueInput, 'tasaConversion', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>AOV (Ticket Promedio / $)</label><input className={styles.input} type="number" value={boutiqueInput.ticketPromedioAOV} onChange={e=>handleInputChange(setBoutiqueInput, 'ticketPromedioAOV', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Multiplier Retail (Markup)</label><input className={styles.input} type="number" value={boutiqueInput.multiplicadorMarkup} onChange={e=>handleInputChange(setBoutiqueInput, 'multiplicadorMarkup', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Alquiler + Personal Básico ($/M)</label><input className={styles.input} type="number" value={boutiqueInput.alquilerYPersonal} onChange={e=>handleInputChange(setBoutiqueInput, 'alquilerYPersonal', e.target.value)}/></div>
                <div className={styles.formGroup}><label className={styles.label}>Setup Store / Llave (M0)</label><input className={styles.input} type="number" value={boutiqueInput.setupLocalFranquicia} onChange={e=>handleInputChange(setBoutiqueInput, 'setupLocalFranquicia', e.target.value)}/></div>
              </>
            )}

            <div className={styles.sectionTitle}>Horizonte Total</div>
            <div className={styles.formGroup}><label className={styles.label}>WACC / Tasa de Inversor (%)</label><input className={styles.input} type="number" value={macroInput.tasaDescuento} onChange={e=>handleInputChange(setMacroInput, 'tasaDescuento', e.target.value)}/></div>
            <div className={styles.formGroup}>
              <select className={styles.select} value={horizon} onChange={e=>setHorizon(parseInt(e.target.value))}>
                <option value={3}>3 Años (36 Meses)</option>
                <option value={5}>5 Años (60 Meses)</option>
                <option value={10}>10 Años (120 Meses)</option>
                <option value={20}>20 Años (240 Meses)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>VAN Neto Consolidado</span><span className={`${styles.kpiValue} ${eMetrics.van >= 0 ? styles.positive : styles.negative}`}>{fCurrency(eMetrics.van)}</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>TIR Anual de Estructura</span><span className={`${styles.kpiValue} ${eMetrics.tir >= macroInput.tasaDescuento ? styles.positive : styles.negative}`}>{eMetrics.tir !== null ? eMetrics.tir.toFixed(2) : '-'} %</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>Break-Even (Repago)</span><span className={styles.kpiValue} style={{color:'var(--foreground)'}}>{eMetrics.payback !== null ? eMetrics.payback.toFixed(1) + ' Años' : 'N/A'}</span></div>
          </div>

          <div className={styles.chartCard} style={{ height: '300px' }}>
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
             <h3 style={{fontSize:'1rem', margin:'0 0 10px 0'}}>Proyección de Beneficios (Acumulado Anual)</h3>
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} opacity={0.6} />
                 <XAxis dataKey="label" stroke="var(--secondary-foreground)" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                 <YAxis stroke="var(--secondary-foreground)" tickFormatter={(v) => `$${v/1000}k`} fontSize={11} width={50} axisLine={false} tickLine={false} />
                 <Tooltip formatter={fCurrency} contentStyle={{ backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '12px', borderColor: 'var(--primary)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }} itemStyle={{ color: 'white' }} />
                 <Legend wrapperStyle={{ paddingTop: '10px' }} />
                 <Area type="monotone" dataKey="FlujoCajaLibre" stroke="var(--primary)" fillOpacity={1} fill="url(#colorFcl)" name="Cashflow Libre Anual" strokeWidth={3} filter="url(#shadow)" />
                 <Line type="monotone" dataKey="CostosEstructura" stroke="#ef4444" name="Estructuras Fijas" strokeWidth={2} dot={false} strokeDasharray="5 5" />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
          
          {/* HEADER TREE GRIDS (Pestañas de expansión Anuales) */}
          <div style={{display:'flex', gap:'5px', marginBottom:'-0.5rem'}}>
             {Array.from({length: horizon}).map((_, i) => {
                const yr = i+1;
                return (
                   <button key={yr} onClick={() => toggleYear(yr)} className={styles.thExpandable} style={{padding: '0.4rem 0.8rem', borderRadius:'6px 6px 0 0', display:'flex', alignItems:'center', gap:'0.4rem', borderBottom:'none'}}>
                      {expandedYears[yr] ? '[-]' : '[+]'} Año {yr}
                   </button>
                )
             })}
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Conceptos P&L</th>
                  {gridColumns.map((col, i) => (
                    <th key={col.periodoNumber !== undefined ? `yr_${col.periodoNumber}` : `M_${i}`} className={!col.isMonth && col.periodoNumber > 0 ? styles.thExpandable : ''} onClick={() => !col.isMonth && col.periodoNumber > 0 ? toggleYear(col.periodoNumber) : null} title={!col.isMonth && col.periodoNumber > 0 ? "Click para Expandir/Colapsar Año" : ""}>
                       {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{modelType==='saas'?'Suscriptores Activos (Auto)':'Demanda Cierre Periodo'}</td>
                  {gridColumns.map((c, i) => <td style={{color:'var(--secondary-foreground)'}} key={i}>{c.periodoNumber===0?'-': Math.round(c.Meta1)}</td>)}
                </tr>
                <tr>
                  <td>(+) Ventas Consolidadas</td>
                  {gridColumns.map((c, i) => <td key={i}>{c.periodoNumber === 0 ? '-' : <EditableCell field="Ingresos" col={c} />}</td>)}
                </tr>
                <tr>
                  <td>(-) Erogación Directa (COGS)</td>
                  {gridColumns.map((c, i) => <td key={i}>{c.periodoNumber === 0 ? '-' : <EditableCell field="CostosDirectos" col={c} />}</td>)}
                </tr>
                <tr className={styles.rowNet}>
                  <td>(=) MARGEN DE EXPLOTACIÓN</td>
                  {gridColumns.map((c, i) => <td key={i}>{c.periodoNumber === 0 ? '-' : fCurrency(c.MargenBruto)}</td>)}
                </tr>
                <tr>
                  <td>(-) Gasto de Estructura Inflex.</td>
                  {gridColumns.map((c, i) => <td key={i}>{c.periodoNumber === 0 ? '-' : <EditableCell field="CostosEstructura" col={c} />}</td>)}
                </tr>
                <tr>
                  <td>(-) CapEx (Bienes de Uso)</td>
                  {gridColumns.map((c, i) => <td key={i}><EditableCell field="Capex" col={c} /></td>)}
                </tr>
                <tr className={styles.rowNet} style={{ background: 'linear-gradient(90deg, var(--primary) 0%, rgba(99,102,241,0.8) 100%)', color: 'white' }}>
                  <td style={{ background: 'var(--primary)', color: 'white', fontWeight:'700', letterSpacing:'1px' }}>FREE CASHFLOW NETO</td>
                  {gridColumns.map((c, i) => <td key={i} style={{ textAlign: 'right' }}>{fCurrency(c.FlujoCajaLibre)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
