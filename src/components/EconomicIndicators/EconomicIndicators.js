'use client';
import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Bitcoin, Activity } from 'lucide-react';
import styles from './EconomicIndicators.module.css';

export default function EconomicIndicators() {
  const [data, setData] = useState({
    dolarBlue: null,
    dolarMep: null,
    dolarOficial: null,
    bitcoin: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Dolar
      const dolarRes = await fetch('https://dolarapi.com/v1/dolares');
      const dolares = await dolarRes.json();
      
      const blue = dolares.find(d => d.casa === 'blue');
      const mep = dolares.find(d => d.casa === 'bolsa');
      const oficial = dolares.find(d => d.casa === 'oficial');

      // Fetch Crypto (Bitcoin)
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
      const btcData = await btcRes.json();

      setData({
        dolarBlue: blue,
        dolarMep: mep,
        dolarOficial: oficial,
        bitcoin: btcData.bitcoin ? { 
          price: btcData.bitcoin.usd, 
          change24h: btcData.bitcoin.usd_24h_change 
        } : null
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching economic data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val, currency = 'ARS') => {
    if (val === undefined || val === null) return '-';
    return new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: currency,
      maximumFractionDigits: currency === 'USD' ? 0 : 2 
    }).format(val);
  };

  const getFormatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute:'2-digit' });
  };

  const renderTrendBadge = (change) => {
    if (change === undefined || change === null) return null;
    const isPositive = change > 0;
    const isNeutral = change === 0;
    
    let badgeClass = styles.neutral;
    if (isPositive) badgeClass = styles.positive;
    else if (!isNeutral) badgeClass = styles.negative;

    const Icon = isPositive ? TrendingUp : (isNeutral ? Activity : TrendingDown);

    return (
      <span className={`${styles.badge} ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
        <Icon size={12} />
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Activity size={20} color="var(--primary)" />
          Entorno Macroeconómico
        </h3>
        <button 
          className={styles.refreshButton} 
          onClick={fetchData} 
          disabled={loading}
          aria-label="Actualizar cotizaciones"
        >
          <RefreshCw size={14} className={loading ? styles.spin : ''} />
          {lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'})}` : 'Actualizar'}
        </button>
      </div>

      <div className={styles.grid}>
        {loading && !data.dolarBlue ? (
          <>
            <div className={styles.loadingSkeleton}></div>
            <div className={styles.loadingSkeleton}></div>
            <div className={styles.loadingSkeleton}></div>
            <div className={styles.loadingSkeleton}></div>
          </>
        ) : (
          <>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Dólar Blue</span>
                {data.dolarBlue && (
                   <span className={`${styles.badge} ${styles.neutral}`}>
                     {getFormatDate(data.dolarBlue.fechaActualizacion)}
                   </span>
                )}
              </div>
              <div className={styles.value}>
                {formatCurrency(data.dolarBlue?.venta)}
              </div>
              <div className={styles.subValue}>
                Compra: {formatCurrency(data.dolarBlue?.compra)}
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Dólar MEP</span>
                {data.dolarMep && (
                   <span className={`${styles.badge} ${styles.neutral}`}>
                     {getFormatDate(data.dolarMep.fechaActualizacion)}
                   </span>
                )}
              </div>
              <div className={styles.value}>
                {formatCurrency(data.dolarMep?.venta)}
              </div>
              <div className={styles.subValue}>
                Legal / Bolsa
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Dólar Oficial</span>
                {data.dolarOficial && (
                   <span className={`${styles.badge} ${styles.neutral}`}>
                     {getFormatDate(data.dolarOficial.fechaActualizacion)}
                   </span>
                )}
              </div>
              <div className={styles.value}>
                {formatCurrency(data.dolarOficial?.venta)}
              </div>
              <div className={styles.subValue}>
                Minorista (Sin Impuestos)
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>
                  <Bitcoin size={16} color="#f7931a" /> 
                  Bitcoin
                </span>
                {renderTrendBadge(data.bitcoin?.change24h)}
              </div>
              <div className={styles.value}>
                {formatCurrency(data.bitcoin?.price, 'USD')}
              </div>
              <div className={styles.subValue}>
                Últimas 24hs globales
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
