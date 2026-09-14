// =========================================================
// Blinkit Grocery Analytics Dashboard - Application Logic
// =========================================================

// State management
let filteredData = [...RAW_DATA];
let activeFilters = {
  year: 'ALL',
  outlet: 'ALL',
  category: 'ALL',
  fat: 'ALL',
  tier: 'ALL',
  size: 'ALL'
};
let currentTrendMetric = 'both';
let categoryChartIsBar = false;

// Table state
let tableSearchQuery = '';
let currentPage = 1;
let pageSize = 25;
let sortColumn = 'sa';
let sortAsc = false;
let totalPages = 1;

// Chart instances
let charts = {};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Outlet Details Map
const OUTLET_METADATA = {
  'OUT027': { year: 1985, size: 'Medium', tier: 'Tier 3', type: 'Supermarket Type3', city: 'Delhi NCR' },
  'OUT013': { year: 1987, size: 'High', tier: 'Tier 3', type: 'Supermarket Type1', city: 'Mumbai' },
  'OUT049': { year: 1999, size: 'Medium', tier: 'Tier 1', type: 'Supermarket Type1', city: 'Bengaluru' },
  'OUT046': { year: 1997, size: 'Small', tier: 'Tier 1', type: 'Supermarket Type1', city: 'Hyderabad' },
  'OUT035': { year: 2004, size: 'Small', tier: 'Tier 2', type: 'Supermarket Type1', city: 'Pune' },
  'OUT017': { year: 2007, size: 'Medium', tier: 'Tier 2', type: 'Supermarket Type1', city: 'Ahmedabad' },
  'OUT045': { year: 2002, size: 'Medium', tier: 'Tier 2', type: 'Supermarket Type1', city: 'Chennai' },
  'OUT018': { year: 2009, size: 'Medium', tier: 'Tier 3', type: 'Supermarket Type2', city: 'Kolkata' },
  'OUT010': { year: 1998, size: 'Small', tier: 'Tier 3', type: 'Grocery Store', city: 'Jaipur' },
  'OUT019': { year: 1985, size: 'Small', tier: 'Tier 1', type: 'Grocery Store', city: 'Chandigarh' }
};

// Initialize Dashboard on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  applyFiltersAndRender();
});

// Formatting Helpers
function formatCurrency(val) {
  if (val >= 1000000) {
    return '$' + (val / 1000000).toFixed(2) + 'M';
  } else if (val >= 1000) {
    return '$' + (val / 1000).toFixed(1) + 'K';
  }
  return '$' + Number(val).toFixed(2);
}

function formatNumber(val) {
  return new Intl.NumberFormat('en-US').format(val);
}

// Filter Change Handler
function onFilterChange() {
  activeFilters.year = document.getElementById('filter-year').value;
  activeFilters.outlet = document.getElementById('filter-outlet').value;
  activeFilters.category = document.getElementById('filter-category').value;
  activeFilters.fat = document.getElementById('filter-fat').value;
  activeFilters.tier = document.getElementById('filter-tier').value;
  activeFilters.size = document.getElementById('filter-size').value;

  currentPage = 1;
  applyFiltersAndRender();
}

function resetAllFilters() {
  document.getElementById('filter-year').value = 'ALL';
  document.getElementById('filter-outlet').value = 'ALL';
  document.getElementById('filter-category').value = 'ALL';
  document.getElementById('filter-fat').value = 'ALL';
  document.getElementById('filter-tier').value = 'ALL';
  document.getElementById('filter-size').value = 'ALL';
  
  activeFilters = {
    year: 'ALL',
    outlet: 'ALL',
    category: 'ALL',
    fat: 'ALL',
    tier: 'ALL',
    size: 'ALL'
  };

  tableSearchQuery = '';
  document.getElementById('table-search').value = '';
  currentPage = 1;

  applyFiltersAndRender();
}

function removeFilter(key) {
  activeFilters[key] = 'ALL';
  const el = document.getElementById('filter-' + key);
  if (el) el.value = 'ALL';
  currentPage = 1;
  applyFiltersAndRender();
}

// Filter and Render Data
function applyFiltersAndRender() {
  filteredData = RAW_DATA.filter(item => {
    if (activeFilters.year !== 'ALL' && item.y.toString() !== activeFilters.year) return false;
    if (activeFilters.outlet !== 'ALL' && item.o !== activeFilters.outlet) return false;
    if (activeFilters.category !== 'ALL' && item.c !== activeFilters.category) return false;
    if (activeFilters.fat !== 'ALL' && item.f !== activeFilters.fat) return false;
    if (activeFilters.tier !== 'ALL' && item.t !== activeFilters.tier) return false;
    if (activeFilters.size !== 'ALL' && item.s !== activeFilters.size) return false;
    return true;
  });

  updateActivePills();
  updateHeaderAndKPIs();
  renderCharts();
  renderTable();
  renderOutletMatrix();
  lucide.createIcons();
}

// Update Active Filter Tags
function updateActivePills() {
  const container = document.getElementById('active-pills');
  if (!container) return;
  container.innerHTML = '';

  let hasFilters = false;
  const labels = {
    year: 'Year',
    outlet: 'Outlet',
    category: 'Category',
    fat: 'Fat',
    tier: 'Tier',
    size: 'Size'
  };

  for (const [key, val] of Object.entries(activeFilters)) {
    if (val !== 'ALL') {
      hasFilters = true;
      const pill = document.createElement('span');
      pill.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-300 border border-yellow-400/40';
      pill.innerHTML = `<span>${labels[key]}: ${val}</span><button onclick="removeFilter('${key}')" class="hover:text-white ml-1 font-bold">&times;</button>`;
      container.appendChild(pill);
    }
  }

  if (!hasFilters) {
    container.innerHTML = '<span class="text-xs text-slate-500 italic">Showing all records (No filters applied)</span>';
  }
}

// Update KPI Header and Cards
function updateHeaderAndKPIs() {
  const totalCount = filteredData.length;
  const totalRawCount = RAW_DATA.length;
  const pct = ((totalCount / totalRawCount) * 100).toFixed(1);

  document.getElementById('filtered-records-tag').textContent = formatNumber(totalCount);
  document.getElementById('filtered-percent-tag').textContent = pct + '%';
  document.getElementById('header-records-count').textContent = formatNumber(totalCount);

  if (totalCount === 0) {
    document.getElementById('kpi-revenue').textContent = '$0';
    document.getElementById('kpi-profit').textContent = '$0';
    document.getElementById('kpi-margin').textContent = '0%';
    document.getElementById('kpi-orders').textContent = '0';
    document.getElementById('kpi-customers').textContent = '0';
    document.getElementById('kpi-avg-sales').textContent = '$0.00';
    document.getElementById('kpi-mrp').textContent = '$0.00';
    document.getElementById('kpi-outlets').textContent = '0';
    return;
  }

  const totalRevenue = filteredData.reduce((acc, cur) => acc + cur.sa, 0);
  const totalProfit = filteredData.reduce((acc, cur) => acc + cur.pr, 0);
  const totalMRP = filteredData.reduce((acc, cur) => acc + cur.m, 0);
  const avgSalesPerItem = totalRevenue / totalCount;
  const avgMRP = totalMRP / totalCount;
  const margin = (totalProfit / totalRevenue) * 100;

  const uniqueOutlets = new Set(filteredData.map(d => d.o));
  const estCustomers = Math.round(totalCount * 0.568);
  const avgCustSpend = estCustomers > 0 ? (totalRevenue / estCustomers) : 0;

  document.getElementById('kpi-revenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('kpi-profit').textContent = formatCurrency(totalProfit);
  document.getElementById('kpi-margin').textContent = margin.toFixed(2) + '%';
  document.getElementById('kpi-orders').textContent = formatNumber(totalCount);
  document.getElementById('kpi-customers').textContent = formatNumber(estCustomers);
  document.getElementById('kpi-cust-spend').textContent = '$' + avgCustSpend.toFixed(0);
  document.getElementById('kpi-avg-sales').textContent = '$' + avgSalesPerItem.toFixed(2);
  document.getElementById('kpi-mrp').textContent = '$' + avgMRP.toFixed(2);
  document.getElementById('kpi-outlets').textContent = uniqueOutlets.size;
}

// Render Charts
function renderCharts() {
  renderMonthlyTrendChart();
  renderCategoryRevenueChart();
  renderOutletProfitChart();
  renderTopProductsChart();
  renderSecondaryCharts();
}

// 1. Monthly Sales & Profit Trend Chart
function renderMonthlyTrendChart() {
  const monthSales = new Array(12).fill(0);
  const monthProfit = new Array(12).fill(0);
  const monthOrders = new Array(12).fill(0);

  filteredData.forEach(d => {
    monthSales[d.mo] += d.sa;
    monthProfit[d.mo] += d.pr;
    monthOrders[d.mo] += 1;
  });

  let maxSales = -1, maxMonth = 0, minSales = Infinity, minMonth = 0;
  monthSales.forEach((s, idx) => {
    if (s > maxSales) { maxSales = s; maxMonth = idx; }
    if (s < minSales && s > 0) { minSales = s; minMonth = idx; }
  });

  const totalSales = monthSales.reduce((a,b) => a+b, 0);
  const avgMth = totalSales / 12;

  document.getElementById('trend-peak-month').textContent = MONTH_NAMES[maxMonth] + ' (' + formatCurrency(maxSales) + ')';
  document.getElementById('trend-low-month').textContent = (minSales === Infinity ? 'N/A' : MONTH_NAMES[minMonth]) + ' (' + (minSales === Infinity ? '$0' : formatCurrency(minSales)) + ')';
  document.getElementById('trend-avg-sales').textContent = formatCurrency(avgMth) + ' / mo';

  const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
  if (charts.monthlyTrend) charts.monthlyTrend.destroy();

  const datasets = [];
  if (currentTrendMetric === 'both' || currentTrendMetric === 'sales') {
    datasets.push({
      label: 'Sales Revenue ($)',
      data: monthSales,
      borderColor: '#F8C22E',
      backgroundColor: 'rgba(248, 194, 46, 0.15)',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#F8C22E',
      yAxisID: 'y'
    });
  }

  if (currentTrendMetric === 'both' || currentTrendMetric === 'profit') {
    datasets.push({
      label: 'Gross Profit ($)',
      data: monthProfit,
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#10B981',
      yAxisID: currentTrendMetric === 'profit' ? 'y' : 'y1'
    });
  }

  if (currentTrendMetric === 'orders') {
    datasets.push({
      label: 'Order Volume (Transactions)',
      data: monthOrders,
      borderColor: '#38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#38BDF8',
      yAxisID: 'y'
    });
  }

  const scalesConfig = {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
      ticks: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.06)' },
      ticks: {
        color: '#94a3b8',
        font: { size: 11, family: 'Plus Jakarta Sans' },
        callback: (val) => currentTrendMetric === 'orders' ? formatNumber(val) : formatCurrency(val)
      }
    }
  };

  if (currentTrendMetric === 'both') {
    scalesConfig.y1 = {
      position: 'right',
      grid: { drawOnChartArea: false },
      ticks: {
        color: '#10B981',
        font: { size: 11, family: 'Plus Jakarta Sans' },
        callback: (val) => formatCurrency(val)
      }
    };
  }

  charts.monthlyTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: MONTH_NAMES,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#e2e8f0', boxWidth: 12, font: { size: 12, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#F8C22E',
          bodyColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const val = context.parsed.y;
              return currentTrendMetric === 'orders' ? `${label}: ${formatNumber(val)} orders` : `${label}: $${formatNumber(val.toFixed(2))}`;
            }
          }
        }
      },
      scales: scalesConfig
    }
  });
}

function setTrendMetric(metric) {
  currentTrendMetric = metric;
  const btns = {
    both: document.getElementById('btn-trend-all'),
    sales: document.getElementById('btn-trend-rev'),
    profit: document.getElementById('btn-trend-prof'),
    orders: document.getElementById('btn-trend-orders')
  };

  for (const [key, btn] of Object.entries(btns)) {
    if (!btn) continue;
    if (key === metric) {
      btn.className = 'px-2.5 py-1 rounded bg-yellow-400/20 text-yellow-400 transition font-semibold';
    } else {
      btn.className = 'px-2.5 py-1 rounded text-slate-400 hover:text-white transition';
    }
  }
  renderMonthlyTrendChart();
}

// 2. Revenue by Category Chart
function renderCategoryRevenueChart() {
  const catMap = {};
  filteredData.forEach(d => {
    if (!catMap[d.c]) catMap[d.c] = { sales: 0, count: 0 };
    catMap[d.c].sales += d.sa;
    catMap[d.c].count += 1;
  });

  const sorted = Object.entries(catMap).sort((a,b) => b[1].sales - a[1].sales);
  const labels = sorted.map(s => s[0]);
  const sales = sorted.map(s => s[1].sales);
  const totalSales = sales.reduce((a,b) => a+b, 0);

  if (sorted.length > 0) {
    const topCat = sorted[0];
    const pct = totalSales > 0 ? ((topCat[1].sales / totalSales) * 100).toFixed(2) : '0';
    document.getElementById('top-category-name').textContent = topCat[0] + ' (' + formatCurrency(topCat[1].sales) + ')';
    document.getElementById('top-category-share').textContent = pct + '%';
  } else {
    document.getElementById('top-category-name').textContent = 'None';
    document.getElementById('top-category-share').textContent = '0%';
  }

  const ctx = document.getElementById('categoryRevenueChart').getContext('2d');
  if (charts.categoryRevenue) charts.categoryRevenue.destroy();

  const palette = [
    '#10B981', '#F8C22E', '#38BDF8', '#F43F5E', '#A855F7',
    '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
    '#06B6D4', '#EAB308', '#8B5CF6', '#D946EF', '#64748B', '#0284C7'
  ];

  if (categoryChartIsBar) {
    charts.categoryRevenue = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue ($)',
          data: sales,
          backgroundColor: palette.slice(0, labels.length),
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#F8C22E',
            callbacks: {
              label: (ctx) => 'Revenue: $' + formatNumber(ctx.parsed.x.toFixed(2))
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => formatCurrency(v) }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 10 } }
          }
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const selectedCat = labels[idx];
            document.getElementById('filter-category').value = selectedCat;
            onFilterChange();
          }
        }
      }
    });
  } else {
    charts.categoryRevenue = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: sales,
          backgroundColor: palette.slice(0, labels.length),
          borderColor: '#0f172a',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#F8C22E',
            callbacks: {
              label: function(context) {
                const val = context.parsed;
                const share = totalSales > 0 ? ((val / totalSales) * 100).toFixed(1) : 0;
                return ` ${context.label}: $${formatNumber(val.toFixed(2))} (${share}%)`;
              }
            }
          }
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const selectedCat = labels[idx];
            document.getElementById('filter-category').value = selectedCat;
            onFilterChange();
          }
        }
      }
    });
  }
}

function toggleCategoryChartType() {
  categoryChartIsBar = !categoryChartIsBar;
  document.getElementById('cat-chart-toggle-text').textContent = categoryChartIsBar ? 'Donut View' : 'Bar View';
  renderCategoryRevenueChart();
}

// 3. Profit & Revenue by Store Outlet Chart
function renderOutletProfitChart() {
  const outMap = {};
  filteredData.forEach(d => {
    if (!outMap[d.o]) outMap[d.o] = { sales: 0, profit: 0, count: 0 };
    outMap[d.o].sales += d.sa;
    outMap[d.o].profit += d.pr;
    outMap[d.o].count += 1;
  });

  const outlets = ['OUT027', 'OUT035', 'OUT049', 'OUT017', 'OUT013', 'OUT046', 'OUT045', 'OUT018', 'OUT010', 'OUT019'];
  const activeOutlets = outlets.filter(o => outMap[o] && outMap[o].count > 0);

  const salesData = activeOutlets.map(o => outMap[o].sales);
  const profitData = activeOutlets.map(o => outMap[o].profit);

  const ctx = document.getElementById('outletProfitChart').getContext('2d');
  if (charts.outletProfit) charts.outletProfit.destroy();

  charts.outletProfit = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: activeOutlets.map(o => {
        const meta = OUTLET_METADATA[o];
        return meta ? `${o} (${meta.tier})` : o;
      }),
      datasets: [
        {
          label: 'Revenue ($)',
          data: salesData,
          backgroundColor: '#F8C22E',
          borderRadius: 6,
          barPercentage: 0.75,
          categoryPercentage: 0.85
        },
        {
          label: 'Profit ($)',
          data: profitData,
          backgroundColor: '#10B981',
          borderRadius: 6,
          barPercentage: 0.75,
          categoryPercentage: 0.85
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#e2e8f0', boxWidth: 12, font: { size: 11, weight: 'bold' } }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#F8C22E',
          padding: 10,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y;
              const label = context.dataset.label;
              return `${label}: $${formatNumber(val.toFixed(2))}`;
            },
            afterBody: function(contexts) {
              const idx = contexts[0].dataIndex;
              const outletId = activeOutlets[idx];
              const d = outMap[outletId];
              const margin = d.sales > 0 ? ((d.profit / d.sales) * 100).toFixed(2) : 0;
              const meta = OUTLET_METADATA[outletId];
              return [
                `Gross Margin: ${margin}%`,
                `Outlet Format: ${meta ? meta.type : 'N/A'}`,
                `Size: ${meta ? meta.size : 'N/A'}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#94a3b8', font: { size: 10, family: 'Plus Jakarta Sans' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 10, family: 'Plus Jakarta Sans' },
            callback: (v) => formatCurrency(v)
          }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const idx = elements[0].index;
          const selectedOutlet = activeOutlets[idx];
          document.getElementById('filter-outlet').value = selectedOutlet;
          onFilterChange();
        }
      }
    }
  });
}

// 4. Top 10 High Performing Products Chart
function renderTopProductsChart() {
  const prodMap = {};
  filteredData.forEach(d => {
    if (!prodMap[d.id]) {
      prodMap[d.id] = { id: d.id, category: d.c, sales: 0, profit: 0, count: 0, mrp: d.m };
    }
    prodMap[d.id].sales += d.sa;
    prodMap[d.id].profit += d.pr;
    prodMap[d.id].count += 1;
  });

  const sortedProds = Object.values(prodMap).sort((a,b) => b.sales - a.sales).slice(0, 10);
  const labels = sortedProds.map(p => `${p.id} (${p.category.split(' ')[0]})`);
  const salesData = sortedProds.map(p => p.sales);

  if (sortedProds.length > 0) {
    document.getElementById('top-product-sku').textContent = sortedProds[0].id + ' (' + formatCurrency(sortedProds[0].sales) + ')';
  }

  const ctx = document.getElementById('topProductsChart').getContext('2d');
  if (charts.topProducts) charts.topProducts.destroy();

  charts.topProducts = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Revenue ($)',
        data: salesData,
        backgroundColor: '#F59E0B',
        borderRadius: 4,
        barThickness: 14
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#F8C22E',
          callbacks: {
            label: (ctx) => 'Revenue: $' + formatNumber(ctx.parsed.x.toFixed(2)),
            afterBody: (ctx) => {
              const prod = sortedProds[ctx[0].dataIndex];
              return [
                `Category: ${prod.category}`,
                `Avg MRP: $${prod.mrp.toFixed(2)}`,
                `Est. Profit: $${formatNumber(prod.profit.toFixed(2))}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => formatCurrency(v) }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#cbd5e1', font: { size: 10 } }
        }
      }
    }
  });
}

// 5. Secondary Dimension Breakdown Charts (Tier, Size, Fat, Price)
function renderSecondaryCharts() {
  // 5A: Tier Chart
  const tierMap = { 'Tier 1': 0, 'Tier 2': 0, 'Tier 3': 0 };
  filteredData.forEach(d => { if (tierMap[d.t] !== undefined) tierMap[d.t] += d.sa; });
  const tierCtx = document.getElementById('tierChart').getContext('2d');
  if (charts.tier) charts.tier.destroy();

  const sortedTiers = Object.entries(tierMap).sort((a,b) => b[1] - a[1]);
  if (sortedTiers[0]) document.getElementById('tier-winner-tag').textContent = `${sortedTiers[0][0]} Lead (${formatCurrency(sortedTiers[0][1])})`;

  charts.tier = new Chart(tierCtx, {
    type: 'doughnut',
    data: {
      labels: ['Tier 1 (Metro)', 'Tier 2 (Urban)', 'Tier 3 (Semi-Urban)'],
      datasets: [{
        data: [tierMap['Tier 1'], tierMap['Tier 2'], tierMap['Tier 3']],
        backgroundColor: ['#A855F7', '#38BDF8', '#10B981'],
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 9 } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          callbacks: { label: (c) => ` ${c.label}: $${formatNumber(c.parsed.toFixed(2))}` }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const tiers = ['Tier 1', 'Tier 2', 'Tier 3'];
          document.getElementById('filter-tier').value = tiers[elements[0].index];
          onFilterChange();
        }
      }
    }
  });

  // 5B: Size Chart
  const sizeMap = { 'High': 0, 'Medium': 0, 'Small': 0, 'Not Specified': 0 };
  filteredData.forEach(d => {
    const s = d.s || 'Not Specified';
    sizeMap[s] = (sizeMap[s] || 0) + d.sa;
  });
  const sizeCtx = document.getElementById('sizeChart').getContext('2d');
  if (charts.size) charts.size.destroy();

  const sortedSizes = Object.entries(sizeMap).sort((a,b) => b[1] - a[1]);
  if (sortedSizes[0]) document.getElementById('size-winner-tag').textContent = `${sortedSizes[0][0]} Lead`;

  charts.size = new Chart(sizeCtx, {
    type: 'doughnut',
    data: {
      labels: ['Medium', 'Small', 'High', 'Unspecified'],
      datasets: [{
        data: [sizeMap['Medium'], sizeMap['Small'], sizeMap['High'], sizeMap['Not Specified']],
        backgroundColor: ['#F8C22E', '#38BDF8', '#10B981', '#64748B'],
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 9 } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          callbacks: { label: (c) => ` ${c.label}: $${formatNumber(c.parsed.toFixed(2))}` }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const sizes = ['Medium', 'Small', 'High', 'Not Specified'];
          document.getElementById('filter-size').value = sizes[elements[0].index];
          onFilterChange();
        }
      }
    }
  });

  // 5C: Fat Chart
  const fatMap = { 'Low Fat': 0, 'Regular': 0 };
  filteredData.forEach(d => { fatMap[d.f] = (fatMap[d.f] || 0) + d.sa; });
  const fatCtx = document.getElementById('fatChart').getContext('2d');
  if (charts.fat) charts.fat.destroy();

  const totalFatSales = fatMap['Low Fat'] + fatMap['Regular'];
  const lfPct = totalFatSales > 0 ? ((fatMap['Low Fat'] / totalFatSales) * 100).toFixed(0) : 0;
  document.getElementById('fat-winner-tag').textContent = `${lfPct}% Low Fat`;

  charts.fat = new Chart(fatCtx, {
    type: 'doughnut',
    data: {
      labels: ['Low Fat (LF)', 'Regular'],
      datasets: [{
        data: [fatMap['Low Fat'], fatMap['Regular']],
        backgroundColor: ['#EC4899', '#F97316'],
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 9 } } },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          callbacks: { label: (c) => ` ${c.label}: $${formatNumber(c.parsed.toFixed(2))}` }
        }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const fats = ['Low Fat', 'Regular'];
          document.getElementById('filter-fat').value = fats[elements[0].index];
          onFilterChange();
        }
      }
    }
  });

  // 5D: Price Tier Chart
  const priceMap = { 'Budget (<$50)': 0, 'Mid ($50-100)': 0, 'Premium ($100-200)': 0, 'Luxury ($200+)': 0 };
  filteredData.forEach(d => {
    if (d.m < 50) priceMap['Budget (<$50)'] += d.sa;
    else if (d.m <= 100) priceMap['Mid ($50-100)'] += d.sa;
    else if (d.m <= 200) priceMap['Premium ($100-200)'] += d.sa;
    else priceMap['Luxury ($200+)'] += d.sa;
  });

  const priceCtx = document.getElementById('priceTierChart').getContext('2d');
  if (charts.priceTier) charts.priceTier.destroy();

  charts.priceTier = new Chart(priceCtx, {
    type: 'bar',
    data: {
      labels: ['Budget', 'Mid', 'Premium', 'Luxury'],
      datasets: [{
        label: 'Sales ($)',
        data: Object.values(priceMap),
        backgroundColor: ['#64748B', '#38BDF8', '#F8C22E', '#10B981'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          callbacks: { label: (c) => `Sales: $${formatNumber(c.parsed.y.toFixed(2))}` }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 9 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.06)' },
          ticks: { color: '#94a3b8', font: { size: 9 }, callback: (v) => formatCurrency(v) }
        }
      }
    }
  });
}

// Table Searching, Sorting, and Pagination
function onTableSearch(query) {
  tableSearchQuery = query.trim().toLowerCase();
  currentPage = 1;
  renderTable();
}

function onPageSizeChange(size) {
  pageSize = parseInt(size, 10);
  currentPage = 1;
  renderTable();
}

function sortTable(column) {
  if (sortColumn === column) {
    sortAsc = !sortAsc;
  } else {
    sortColumn = column;
    sortAsc = false;
  }
  renderTable();
}

function renderTable() {
  let tableRows = filteredData;
  if (tableSearchQuery) {
    tableRows = tableRows.filter(d => 
      d.id.toLowerCase().includes(tableSearchQuery) ||
      d.c.toLowerCase().includes(tableSearchQuery) ||
      d.o.toLowerCase().includes(tableSearchQuery) ||
      d.t.toLowerCase().includes(tableSearchQuery)
    );
  }

  tableRows.sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const totalCount = tableRows.length;
  totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;

  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalCount);
  const pageItems = tableRows.slice(startIdx, endIdx);

  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = '';

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-500 italic">No products matching your search criteria.</td></tr>`;
  } else {
    pageItems.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-800/60 transition group cursor-pointer';
      tr.onclick = () => openProductModal(row);

      const margin = row.sa > 0 ? ((row.pr / row.sa) * 100).toFixed(1) : 0;
      const fatBadge = row.f === 'Low Fat' 
        ? '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Low Fat</span>'
        : '<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-yellow-400 border border-yellow-500/20">Regular</span>';

      tr.innerHTML = `
        <td class="py-2.5 px-3 font-mono font-semibold text-yellow-400 group-hover:underline">${row.id}</td>
        <td class="py-2.5 px-3 font-medium text-slate-200">${row.c}</td>
        <td class="py-2.5 px-3">${fatBadge}</td>
        <td class="py-2.5 px-3 font-semibold text-slate-300">${row.o}</td>
        <td class="py-2.5 px-3 text-slate-400">${row.t} • ${row.s}</td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-300">$${row.m.toFixed(2)}</td>
        <td class="py-2.5 px-3 text-right font-bold text-white">$${formatNumber(row.sa.toFixed(2))}</td>
        <td class="py-2.5 px-3 text-right font-bold text-emerald-400">$${formatNumber(row.pr.toFixed(2))}</td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-300">${margin}%</td>
        <td class="py-2.5 px-3 text-center">
          <button onclick="event.stopPropagation(); openProductModal(RAW_DATA.find(x => x.id === '${row.id}' && x.o === '${row.o}'))" class="p-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-400 text-[11px] px-2 py-1 font-medium transition">
            Inspect
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('table-start-idx').textContent = totalCount > 0 ? (startIdx + 1) : 0;
  document.getElementById('table-end-idx').textContent = endIdx;
  document.getElementById('table-total-count').textContent = formatNumber(totalCount);
  document.getElementById('current-page-num').textContent = currentPage;
  document.getElementById('total-page-num').textContent = totalPages;

  document.getElementById('btn-page-first').disabled = currentPage === 1;
  document.getElementById('btn-page-prev').disabled = currentPage === 1;
  document.getElementById('btn-page-next').disabled = currentPage === totalPages;
  document.getElementById('btn-page-last').disabled = currentPage === totalPages;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
}

function goToPage(page) {
  currentPage = page;
  renderTable();
}

// Render Store Outlets Performance Matrix Table
function renderOutletMatrix() {
  const tbody = document.getElementById('outlet-matrix-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const outStats = {};
  filteredData.forEach(d => {
    if (!outStats[d.o]) {
      outStats[d.o] = { sales: 0, profit: 0, count: 0, year: d.y, size: d.s, tier: d.t, type: d.ot };
    }
    outStats[d.o].sales += d.sa;
    outStats[d.o].profit += d.pr;
    outStats[d.o].count += 1;
  });

  const sortedOutlets = Object.entries(outStats).sort((a,b) => b[1].sales - a[1].sales);

  sortedOutlets.forEach(([outletId, stats]) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/60 transition';
    const margin = stats.sales > 0 ? ((stats.profit / stats.sales) * 100).toFixed(2) : 0;
    const avgItemSales = stats.count > 0 ? (stats.sales / stats.count).toFixed(2) : 0;

    tr.innerHTML = `
      <td class="py-3 px-3 font-bold text-yellow-400">${outletId}</td>
      <td class="py-3 px-3 text-slate-300">${stats.year}</td>
      <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">${stats.size}</span></td>
      <td class="py-3 px-3 font-medium text-purple-400">${stats.tier}</td>
      <td class="py-3 px-3 text-slate-300">${stats.type}</td>
      <td class="py-3 px-3 text-right font-medium text-slate-300">${formatNumber(stats.count)}</td>
      <td class="py-3 px-3 text-right font-bold text-white">$${formatNumber(stats.sales.toFixed(2))}</td>
      <td class="py-3 px-3 text-right font-bold text-emerald-400">$${formatNumber(stats.profit.toFixed(2))}</td>
      <td class="py-3 px-3 text-right font-medium text-slate-300">$${formatNumber(avgItemSales)}</td>
      <td class="py-3 px-3 text-right font-bold text-emerald-400">${margin}%</td>
      <td class="py-3 px-3 text-center">
        <button onclick="document.getElementById('filter-outlet').value = '${outletId}'; onFilterChange();" class="px-2 py-1 rounded bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 text-[11px] font-semibold transition">
          Filter Outlet
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Modal Interaction
function openProductModal(item) {
  if (!item) return;
  document.getElementById('modal-item-id').textContent = item.id;
  document.getElementById('modal-category').textContent = item.c + ' Category';
  document.getElementById('modal-sales').textContent = '$' + formatNumber(item.sa.toFixed(2));
  document.getElementById('modal-profit').textContent = '$' + formatNumber(item.pr.toFixed(2));
  document.getElementById('modal-mrp').textContent = '$' + item.m.toFixed(2);
  
  const margin = item.sa > 0 ? ((item.pr / item.sa) * 100).toFixed(1) : 0;
  document.getElementById('modal-margin').textContent = margin + '% Margin';
  document.getElementById('modal-outlet').textContent = `${item.o} (${item.ot})`;
  document.getElementById('modal-tier-size').textContent = `${item.t} • ${item.s} Size`;
  document.getElementById('modal-year').textContent = item.y;
  document.getElementById('modal-weight').textContent = item.w > 0 ? `${item.w.toFixed(2)} kg` : 'N/A';
  document.getElementById('modal-visibility').textContent = item.v.toFixed(4) + ' (' + (item.v * 100).toFixed(2) + '%)';

  const fatBadge = document.getElementById('modal-fat-badge');
  fatBadge.textContent = item.f;
  fatBadge.className = item.f === 'Low Fat' ? 'px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300' : 'px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-yellow-300';

  document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

// Export Filtered CSV
function exportFilteredDataCSV() {
  if (filteredData.length === 0) {
    alert('No records available to export.');
    return;
  }

  let csv = 'Item_Identifier,Category,Fat_Content,MRP,Outlet_Identifier,Establishment_Year,Outlet_Size,Location_Tier,Outlet_Type,Item_Outlet_Sales,Estimated_Profit\\n';
  filteredData.forEach(d => {
    csv += `"${d.id}","${d.c}","${d.f}",${d.m},"${d.o}",${d.y},"${d.s}","${d.t}","${d.ot}",${d.sa},${d.pr}\\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `blinkit_sales_filtered_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportTableCSV() {
  let tableRows = filteredData;
  if (tableSearchQuery) {
    tableRows = tableRows.filter(d => 
      d.id.toLowerCase().includes(tableSearchQuery) ||
      d.c.toLowerCase().includes(tableSearchQuery) ||
      d.o.toLowerCase().includes(tableSearchQuery) ||
      d.t.toLowerCase().includes(tableSearchQuery)
    );
  }

  let csv = 'Item_SKU,Category,Fat,Outlet,Location_Tier,Outlet_Size,MRP,Sales,Profit,Margin_Percent\\n';
  tableRows.forEach(d => {
    const margin = d.sa > 0 ? ((d.pr / d.sa) * 100).toFixed(1) : 0;
    csv += `"${d.id}","${d.c}","${d.f}","${d.o}","${d.t}","${d.s}",${d.m},${d.sa},${d.pr},${margin}\\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `blinkit_products_table_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Dark / Light Theme Toggle
function toggleDarkMode() {
  const html = document.documentElement;
  const themeIcon = document.getElementById('theme-icon');
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    html.classList.add('light');
    document.body.classList.remove('bg-slate-950', 'text-slate-100');
    document.body.classList.add('bg-slate-50', 'text-slate-800');
    themeIcon.setAttribute('data-lucide', 'moon');
    themeIcon.classList.remove('text-yellow-400');
    themeIcon.classList.add('text-slate-600');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    document.body.classList.remove('bg-slate-50', 'text-slate-800');
    document.body.classList.add('bg-slate-950', 'text-slate-100');
    themeIcon.setAttribute('data-lucide', 'sun');
    themeIcon.classList.remove('text-slate-600');
    themeIcon.classList.add('text-yellow-400');
  }
  lucide.createIcons();
}