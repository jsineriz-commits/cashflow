'use client';
import { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateNPV, calculateIRR, calculatePayback } from '@/lib/financialMath';
import { Briefcase, Settings, ArrowRight, CornerDownRight } from 'lucide-react';
import styles from './FinancialEngine.module.css';
import { industryTemplates } from '@/data/industryTemplates';

export default function FinancialEngine() {
  const [activeTemplateId, setActiveTemplateId] = useState(industryTemplates[0].id);
  const [templateInputs, setTemplateInputs] = useState(industryTemplates[0].defaults);
  const [horizon, setHorizon] = useState(5); 
  const [macroInput, setMacroInput] = useState({ tasaDescuento: 12 });
  const [overrides, setOverrides] = useState({});
  const [expandedYears, setExpandedYears] = useState({ 1: true }); 

  const activeTemplate = useMemo(() => industryTemplates.find(t => t.id === activeTemplateId), [activeTemplateId]);

  // Agrupamos las plantillas por categoría para el <select>
  const groupedTemplates = useMemo(() => {
    return industryTemplates.reduce((acc, curr) => {
      (acc[curr.category] = acc[curr.category] || []).push(curr);
      return acc;
    }, {});
  }, []);

  const handleTemplateChange = (newId) => {
    setActiveTemplateId(newId);
    const newTmpl = industryTemplates.find(t => t.id === newId);
    setTemplateInputs(newTmpl.defaults);
    setOverrides({});
  };

  const handleInputChange = (field, value) => {
    setTemplateInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
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
        const monthStart = (periodIndex - 1) * 12 + 1;
        const monthEnd = periodIndex * 12;
        if (isNaN(val)) {
           for(let m=monthStart; m<=monthEnd; m++) delete next[`${field}_${m}`];
        } else {
           const monthlyShare = val / 12;
           for(let m=monthStart; m<=monthEnd; m++) next[`${field}_${m}`] = monthlyShare;
        }
      } else {
        const key = `${field}_${periodIndex}`;
        if (isNaN(val)) delete next[key]; 
        else next[key] = val;
      }
      return next;
    });
  };

  // Motor UNIVERSAL con FOREWARD PROPAGATION
  const projDataAllMonths = useMemo(() => {
    const data = [];
    const capexM0 = getValue('Capex', 0, templateInputs.capex);

    data.push({
      periodoNumber: 0,
      label: `M-0`,
      Ingresos: 0, CostosDirectos: 0, MargenBruto: 0,
      CostosEstructura: 0, Capex: capexM0, FlujoCajaLibre: -capexM0,
      ClientesActivos: 0, Volumen: 0, Visitas: 0
    });

    const numMonths = horizon * 12;
    const growthM = Math.pow(1+(templateInputs.primaryGrowth/100), 1/12);
    const churnM = (templateInputs.churn || 0) / 100;

    for (let t = 1; t <= numMonths; t++) {
      let prev = data[t - 1]; 
      let mathIngresos = 0, mathCostosDirectos = 0, mathCostosEstruc = 0, meta1 = 0;

      if (activeTemplate.engineType === 'subscription') {
        const clientAdqBase = t === 1 ? templateInputs.primaryVolume : prev.altasNuevas * growthM;
        const altasNuevas = getValue('Altas', t, clientAdqBase);
        
        const bajas = prev.ClientesActivos * churnM; 
        const prevCL = prev.ClientesActivos || 0;
        const clientsNow = Math.max(0, prevCL + altasNuevas - bajas);

        mathIngresos = clientsNow * templateInputs.ticket;
        mathCostosDirectos = (clientsNow * templateInputs.cogs);
        mathCostosEstruc = templateInputs.fixed;
        meta1 = clientsNow;
        data[t] = { altasNuevas };
      }
      else {
        // VOLUME (Retail, Restaurantes, Hoteles, Transporte)
        const volBase = t === 1 ? templateInputs.primaryVolume : prev.Meta1 * growthM;
        const volumen = getValue('Volumen', t, volBase);
        
        mathIngresos = volumen * templateInputs.ticket;
        mathCostosDirectos = volumen * templateInputs.cogs;
        mathCostosEstruc = templateInputs.fixed;
        meta1 = volumen;
      }

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
  }, [activeTemplate, templateInputs, horizon, overrides]);

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

  const gridColumns = useMemo(() => {
    const cols = [];
    cols.push({ isMonth: false, ...projDataAllMonths[0] }); 

    for (let yr = 1; yr <= horizon; yr++) {
      const monthStart = (yr - 1) * 12 + 1;
      const monthEnd = yr * 12;

      if (expandedYears[yr]) {
        for (let m = monthStart; m <= monthEnd; m++) cols.push({ isMonth: true, yearBlock: yr, ...projDataAllMonths[m] });
      } else {
        let sumI = 0, sumC = 0, sumE = 0, sumCapex = 0, sumFCL = 0, sumMB = 0;
        let lastMeta1 = projDataAllMonths[monthEnd]?.Meta1; 
        
        for(let m = monthStart; m <= monthEnd; m++) {
           const d = projDataAllMonths[m];
           sumI += d.Ingresos; sumC += d.CostosDirectos; sumE += d.CostosEstructura;
           sumCapex += d.Capex; sumMB += d.MargenBruto; sumFCL += d.FlujoCajaLibre;
        }

        cols.push({
          isMonth: false, isAnnualSummary: true, periodoNumber: yr, label: `Total Año ${yr}`,
          Ingresos: sumI, CostosDirectos: sumC, CostosEstructura: sumE,
          Capex: sumCapex, MargenBruto: sumMB, FlujoCajaLibre: sumFCL, Meta1: lastMeta1
        });
      }
    }
    return cols;
  }, [projDataAllMonths, horizon, expandedYears]);

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
    const isOverride = 
       col.isMonth ? (overrides[`${field}_${col.periodoNumber}`] !== undefined) : false; 
    const hasAnyOverride = !col.isMonth && col.isAnnualSummary ? (
       Array.from({length: 12}, (_, i) => overrides[`${field}_${((col.periodoNumber-1)*12+1)+i}`]).some(x => x !== undefined)
    ) : isOverride;

    return (
      <input type="number" 
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
          <h2 className={styles.title}>Evaluador de Proyectos</h2>
          <p style={{ color: 'var(--secondary-foreground)', fontSize:'1.1rem' }}>Simula y proyecta más de 50 escenarios de negocios reales.</p>
        </div>
      </div>

      {/* NEW UX: Top Control Panel instead of Sidebar */}
      <div className={styles.topPanel}>
         <div className={styles.topPanelSection}>
            <div className={styles.sectionTitle}><Briefcase size={18} /> 1. Elige la Industria y Negocio</div>
            <div className={styles.formGroupGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>TIPO DE NEGOCIO</label>
                <select className={`${styles.select} ${styles.selectLarge}`} value={activeTemplateId} onChange={e => handleTemplateChange(e.target.value)}>
                  {Object.keys(groupedTemplates).map(category => (
                    <optgroup label={category} key={category}>
                      {groupedTemplates[category].map(t => (
                        <option value={t.id} key={t.id}>{t.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>HORIZONTE (AÑOS)</label>
                <select className={`${styles.select} ${styles.selectLarge}`} value={horizon} onChange={e=>setHorizon(parseInt(e.target.value))}>
                  <option value={3}>Corto (3 Años)</option>
                  <option value={5}>Estándar (5 Años)</option>
                  <option value={10}>Largo (10 Años)</option>
                  <option value={20}>Corporativo (20 Años)</option>
                </select>
              </div>
            </div>
         </div>

         <div className={styles.topPanelSection}>
            <div className={styles.sectionTitle}><Settings size={18} /> 2. Ajusta las Variables del Operativas</div>
            <div className={styles.formGroupGrid3}>
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.primaryVolume}</label><input className={styles.input} type="number" value={templateInputs.primaryVolume} onChange={e=>handleInputChange('primaryVolume', e.target.value)}/></div>
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.primaryGrowth}</label><input className={styles.input} type="number" value={templateInputs.primaryGrowth} onChange={e=>handleInputChange('primaryGrowth', e.target.value)}/></div>
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.ticket}</label><input className={styles.input} type="number" value={templateInputs.ticket} onChange={e=>handleInputChange('ticket', e.target.value)}/></div>
               
               {activeTemplate.engineType === 'subscription' && (
                  <div className={styles.formGroup}><label className={styles.label}>Tasa de Fuga / Churn (%)</label><input className={styles.input} type="number" value={templateInputs.churn} onChange={e=>handleInputChange('churn', e.target.value)}/></div>
               )}
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.cogs}</label><input className={styles.input} type="number" value={templateInputs.cogs} onChange={e=>handleInputChange('cogs', e.target.value)}/></div>
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.fixed}</label><input className={styles.input} type="number" value={templateInputs.fixed} onChange={e=>handleInputChange('fixed', e.target.value)}/></div>
               <div className={styles.formGroup}><label className={styles.label}>{activeTemplate.labels.capex}</label><input className={styles.input} type="number" value={templateInputs.capex} onChange={e=>handleInputChange('capex', e.target.value)}/></div>
            </div>
         </div>
      </div>

      {/* Instrucciones UX amigables para el usuario de 55 Años */}
      <div className={styles.uxBanner}>
         <ArrowRight className={styles.uxIcon} size={24} />
         <div>
            <h4>Paso 3: Explora y Edita los Resultados </h4>
            <p>Puedes <strong>hacer clic en cualquier celda con números</strong> de la tabla para cambiar un valor futuro, y el resto del proyecto se actualizará. Usa los botones <code>[+] Año</code> para ver el detalle mes a mes.</p>
         </div>
      </div>

      <div className={styles.panels}>
        <div className={styles.mainContent}>
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>Rentabilidad Neta (VAN)</span><span className={`${styles.kpiValue} ${eMetrics.van >= 0 ? styles.positive : styles.negative}`}>{fCurrency(eMetrics.van)}</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>Tasa Int. de Retorno (TIR)</span><span className={`${styles.kpiValue} ${eMetrics.tir >= macroInput.tasaDescuento ? styles.positive : styles.negative}`}>{eMetrics.tir !== null ? eMetrics.tir.toFixed(2) : '-'} %</span></div>
            <div className={styles.kpiCard}><span className={styles.kpiTitle}>Recupero de Inversión</span><span className={styles.kpiValue} style={{color:'var(--foreground)'}}>{eMetrics.payback !== null ? eMetrics.payback.toFixed(1) + ' Años' : 'N/A'}</span></div>
          </div>

          <div className={styles.chartCard} style={{ height: '300px' }}>
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
                  {gridColumns.map((col, i) => {
                    const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                    return (
                      <th key={uniqueKey} className={col.isAnnualSummary && col.periodoNumber > 0 ? styles.thExpandable : ''} onClick={() => col.isAnnualSummary && col.periodoNumber > 0 ? toggleYear(col.periodoNumber) : null} title={col.isAnnualSummary && col.periodoNumber > 0 ? "Haz clic para ver el detalle de meses" : ""}>
                         {col.label}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    {activeTemplate.engineType==='subscription'?'Suscripciones Activas / Cuentas':'Volumen Primario / Demanda'}
                  </td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td style={{color:'var(--secondary-foreground)'}} key={uniqueKey}><span>{col.periodoNumber===0?'-': Math.round(col.Meta1)}</span></td>;
                  })}
                </tr>
                <tr>
                  <td><CornerDownRight size={14} style={{display:'inline', marginRight:'5px'}}/> (+) Ventas Netas Brutas</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey}>{col.periodoNumber === 0 ? <span>-</span> : <EditableCell field="Ingresos" col={col} />}</td>;
                  })}
                </tr>
                <tr>
                  <td><CornerDownRight size={14} style={{display:'inline', marginRight:'5px'}}/> (-) Erogación Directa (COGS)</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey}>{col.periodoNumber === 0 ? <span>-</span> : <EditableCell field="CostosDirectos" col={col} />}</td>;
                  })}
                </tr>
                <tr className={styles.rowNet}>
                  <td>(=) MARGEN DE EXPLOTACIÓN</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey}><span>{col.periodoNumber === 0 ? '-' : fCurrency(col.MargenBruto)}</span></td>;
                  })}
                </tr>
                <tr>
                  <td><CornerDownRight size={14} style={{display:'inline', marginRight:'5px'}}/> (-) Estructura Inflexible Mensual</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey}>{col.periodoNumber === 0 ? <span>-</span> : <EditableCell field="CostosEstructura" col={col} />}</td>;
                  })}
                </tr>
                <tr>
                  <td><CornerDownRight size={14} style={{display:'inline', marginRight:'5px'}}/> (-) CapEx (Bienes de Capital)</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey}><EditableCell field="Capex" col={col} /></td>;
                  })}
                </tr>
                <tr className={styles.rowNet} style={{ background: 'linear-gradient(90deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)', color: 'var(--primary)', borderTop: '1px solid var(--primary)' }}>
                  <td style={{ color: 'var(--primary)', fontWeight:'600', letterSpacing:'1px' }}>FREE CASHFLOW LIBRE</td>
                  {gridColumns.map((col, i) => {
                     const uniqueKey = col.isAnnualSummary ? `yr_${col.periodoNumber}` : `M_${col.periodoNumber || i}`;
                     return <td key={uniqueKey} style={{ textAlign: 'right', color: col.FlujoCajaLibre < 0 ? 'var(--danger)' : 'var(--primary)' }}><span>{fCurrency(col.FlujoCajaLibre)}</span></td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
