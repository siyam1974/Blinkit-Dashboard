const fs = require('fs');

const embeddedDataJs = fs.readFileSync('data_embedded.js', 'utf8');

const htmlTemplate = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blinkit Grocery Analytics Dashboard | Executive Sales & Profit Intelligence</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            blinkit: {
              yellow: '#F8C22E',
              amber: '#F59E0B',
              green: '#0C8340',
              emerald: '#10B981',
              dark: '#0F172A',
              card: '#1E293B',
              border: '#334155'
            }
          },
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  </script>

  <!-- Google Fonts & Chart.js & Lucide Icons -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(15, 23, 42, 0.6);
    }
    ::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    /* Glassmorphism Card Effects */
    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .light .glass-card {
      background: rgba(255, 255, 255, 0.88);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(0, 0, 0, 0.08);
    }

    .glass-card-hover {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .glass-card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3);
      border-color: rgba(248, 194, 46, 0.3);
    }

    /* Print styling */
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; color: black !important; }
      .glass-card { border: 1px solid #ccc !important; background: white !important; }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen antialiased transition-colors duration-200">

  <!-- TOP BRAND & HEADER BAR -->
  <header class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      
      <!-- Brand & Title -->
      <div class="flex items-center gap-3.5">
        <div class="h-11 w-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
          <div class="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <i data-lucide="shopping-bag" class="h-6 w-6 text-yellow-400"></i>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-amber-300 to-emerald-400 bg-clip-text text-transparent">
              Blinkit Grocery Analytics
            </h1>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Live Intelligence
            </span>
          </div>
          <p class="text-xs text-slate-400">Executive Revenue, Profit & Operational Performance Dashboard</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap no-print">
        <!-- Quick Stats Pill -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
          <i data-lucide="database" class="w-3.5 h-3.5 text-yellow-400"></i>
          <span>Dataset: <strong id="header-records-count" class="text-yellow-400">8,523</strong> items</span>
        </div>

        <!-- Export CSV Button -->
        <button id="btn-export-csv" onclick="exportFilteredDataCSV()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm" title="Export currently filtered dataset as CSV">
          <i data-lucide="download" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Export CSV</span>
        </button>

        <!-- Print / PDF Button -->
        <button onclick="window.print()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm" title="Print dashboard or save as PDF">
          <i data-lucide="printer" class="w-3.5 h-3.5 text-blue-400"></i>
          <span>Print / PDF</span>
        </button>

        <!-- Reset All Filters -->
        <button onclick="resetAllFilters()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-yellow-400 border border-yellow-500/30 transition shadow-sm" title="Reset all active filters">
          <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
          <span>Reset Filters</span>
        </button>

        <!-- Dark / Light Mode Toggle -->
        <button onclick="toggleDarkMode()" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-yellow-400 border border-slate-700 transition" title="Toggle Light/Dark Theme">
          <i id="theme-icon" data-lucide="sun" class="w-4 h-4 text-yellow-400"></i>
        </button>
      </div>

    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

    <!-- INTERACTIVE FILTER PANEL -->
    <section class="glass-card rounded-2xl p-5 shadow-xl border border-slate-800/80 transition-all no-print">
      <div class="flex flex-col gap-4">
        
        <!-- Filter Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <i data-lucide="sliders-horizontal" class="w-4 h-4 text-yellow-400"></i>
            <h2 class="text-sm font-semibold tracking-wide uppercase text-slate-300">Interactive Filter Engine</h2>
          </div>
          <div class="text-xs text-slate-400">
            Filtered: <span id="filtered-records-tag" class="font-bold text-yellow-400">8,523</span> / 8,523 records (<span id="filtered-percent-tag" class="text-emerald-400 font-semibold">100%</span>)
          </div>
        </div>

        <!-- Filter Controls Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          
          <!-- Filter 1: Year -->
          <div>
            <label for="filter-year" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-yellow-400"></i>
              Establishment Year
            </label>
            <select id="filter-year" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition">
              <option value="ALL">All Years (1985 - 2009)</option>
              <option value="1985">1985 (OUT027, OUT019)</option>
              <option value="1987">1987 (OUT013)</option>
              <option value="1997">1997 (OUT046)</option>
              <option value="1998">1998 (OUT010)</option>
              <option value="1999">1999 (OUT049)</option>
              <option value="2002">2002 (OUT045)</option>
              <option value="2004">2004 (OUT035)</option>
              <option value="2007">2007 (OUT017)</option>
              <option value="2009">2009 (OUT018)</option>
            </select>
          </div>

          <!-- Filter 2: Store Outlet -->
          <div>
            <label for="filter-outlet" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="store" class="w-3.5 h-3.5 text-emerald-400"></i>
              Store Outlet
            </label>
            <select id="filter-outlet" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition">
              <option value="ALL">All Outlets (10 Locations)</option>
              <option value="OUT027">OUT027 • Medium • Tier 3 (Type 3)</option>
              <option value="OUT035">OUT035 • Small • Tier 2 (Type 1)</option>
              <option value="OUT049">OUT049 • Medium • Tier 1 (Type 1)</option>
              <option value="OUT017">OUT017 • Tier 2 (Type 1)</option>
              <option value="OUT013">OUT013 • High • Tier 3 (Type 1)</option>
              <option value="OUT046">OUT046 • Small • Tier 1 (Type 1)</option>
              <option value="OUT045">OUT045 • Tier 2 (Type 1)</option>
              <option value="OUT018">OUT018 • Medium • Tier 3 (Type 2)</option>
              <option value="OUT010">OUT010 • Tier 3 (Grocery)</option>
              <option value="OUT019">OUT019 • Small • Tier 1 (Grocery)</option>
            </select>
          </div>

          <!-- Filter 3: Category -->
          <div>
            <label for="filter-category" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="tag" class="w-3.5 h-3.5 text-blue-400"></i>
              Product Category
            </label>
            <select id="filter-category" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition">
              <option value="ALL">All Categories (16)</option>
              <option value="Fruits and Vegetables">Fruits & Vegetables</option>
              <option value="Snack Foods">Snack Foods</option>
              <option value="Household">Household</option>
              <option value="Frozen Foods">Frozen Foods</option>
              <option value="Dairy">Dairy</option>
              <option value="Canned">Canned</option>
              <option value="Baking Goods">Baking Goods</option>
              <option value="Health and Hygiene">Health & Hygiene</option>
              <option value="Meat">Meat</option>
              <option value="Soft Drinks">Soft Drinks</option>
              <option value="Breads">Breads</option>
              <option value="Hard Drinks">Hard Drinks</option>
              <option value="Starchy Foods">Starchy Foods</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Seafood">Seafood</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <!-- Filter 4: Fat Content -->
          <div>
            <label for="filter-fat" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="heart-pulse" class="w-3.5 h-3.5 text-pink-400"></i>
              Fat Content
            </label>
            <select id="filter-fat" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 outline-none transition">
              <option value="ALL">All Fat Types</option>
              <option value="Low Fat">Low Fat (LF)</option>
              <option value="Regular">Regular</option>
            </select>
          </div>

          <!-- Filter 5: Location Tier -->
          <div>
            <label for="filter-tier" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 text-purple-400"></i>
              Location Tier
            </label>
            <select id="filter-tier" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition">
              <option value="ALL">All Location Tiers</option>
              <option value="Tier 1">Tier 1 (Metro)</option>
              <option value="Tier 2">Tier 2 (Urban)</option>
              <option value="Tier 3">Tier 3 (Semi-Urban)</option>
            </select>
          </div>

          <!-- Filter 6: Outlet Size -->
          <div>
            <label for="filter-size" class="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <i data-lucide="layers" class="w-3.5 h-3.5 text-cyan-400"></i>
              Outlet Size
            </label>
            <select id="filter-size" onchange="onFilterChange()" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition">
              <option value="ALL">All Outlet Sizes</option>
              <option value="High">High / Large</option>
              <option value="Medium">Medium</option>
              <option value="Small">Small</option>
              <option value="Not Specified">Not Specified</option>
            </select>
          </div>

        </div>

        <!-- Active Filter Pills Bar -->
        <div id="active-pills-container" class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-xs text-slate-400 flex items-center gap-1">
            <i data-lucide="filter" class="w-3 h-3 text-slate-400"></i> Active:
          </span>
          <div id="active-pills" class="flex flex-wrap gap-1.5">
            <!-- Dynamic pills inserted here -->
          </div>
        </div>

      </div>
    </section>

    <!-- EXECUTIVE KPI METRIC CARDS -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      
      <!-- Card 1: Total Revenue -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <div class="p-2 rounded-xl bg-yellow-400/10 text-yellow-400">
            <i data-lucide="dollar-sign" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-revenue" class="text-2xl font-extrabold text-white tracking-tight">$18.59M</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Avg: <strong id="kpi-avg-sales" class="text-yellow-400">$2,181.29</strong> /item</span>
          <span class="text-emerald-400 font-medium">100% Vol</span>
        </div>
      </div>

      <!-- Card 2: Total Profit -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Profit</span>
          <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <i data-lucide="trending-up" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-profit" class="text-2xl font-extrabold text-white tracking-tight">$4.75M</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Margin: <strong id="kpi-margin" class="text-emerald-400">25.56%</strong></span>
          <span class="text-emerald-400 font-medium">+14.2% YoY</span>
        </div>
      </div>

      <!-- Card 3: Total Orders -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders</span>
          <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <i data-lucide="shopping-cart" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-orders" class="text-2xl font-extrabold text-white tracking-tight">8,523</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Transacted Items</span>
          <span class="text-blue-400 font-medium">852/outlet</span>
        </div>
      </div>

      <!-- Card 4: Customers -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Est. Customers</span>
          <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <i data-lucide="users" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-customers" class="text-2xl font-extrabold text-white tracking-tight">4,842</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Avg: <strong id="kpi-cust-spend" class="text-purple-400">$3,839</strong>/user</span>
          <span class="text-purple-400 font-medium">1.76 items</span>
        </div>
      </div>

      <!-- Card 5: Average Item MRP -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Average MRP</span>
          <div class="p-2 rounded-xl bg-pink-500/10 text-pink-400">
            <i data-lucide="tag" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-mrp" class="text-2xl font-extrabold text-white tracking-tight">$140.99</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>Range: $31 - $266</span>
          <span class="text-pink-400 font-medium">1,559 SKUs</span>
        </div>
      </div>

      <!-- Card 6: Active Store Outlets -->
      <div class="glass-card glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition"></div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Outlets</span>
          <div class="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <i data-lucide="store" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <h3 id="kpi-outlets" class="text-2xl font-extrabold text-white tracking-tight">10</h3>
        </div>
        <div class="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>3 Tiers • 4 Formats</span>
          <span id="kpi-top-outlet-name" class="text-cyan-400 font-medium">OUT027 Leader</span>
        </div>
      </div>

    </section>

    <!-- MAIN CHARTS ROW 1: MONTHLY TREND & CATEGORY REVENUE -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Chart 1: Monthly Sales & Profit Trend (8 cols) -->
      <div class="lg:col-span-8 glass-card rounded-2xl p-5 shadow-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <i data-lucide="line-chart" class="w-4 h-4 text-yellow-400"></i>
                <h3 class="text-base font-bold text-slate-100">Monthly Sales & Profit Trend</h3>
              </div>
              <p class="text-xs text-slate-400">Seasonality, revenue trajectory and gross profit margin across months</p>
            </div>
            <!-- Trend View Selector -->
            <div class="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button id="btn-trend-all" onclick="setTrendMetric('both')" class="px-2.5 py-1 rounded bg-yellow-400/20 text-yellow-400 transition font-semibold">Revenue & Profit</button>
              <button id="btn-trend-rev" onclick="setTrendMetric('sales')" class="px-2.5 py-1 rounded text-slate-400 hover:text-white transition">Revenue Only</button>
              <button id="btn-trend-prof" onclick="setTrendMetric('profit')" class="px-2.5 py-1 rounded text-slate-400 hover:text-white transition">Profit Only</button>
              <button id="btn-trend-orders" onclick="setTrendMetric('orders')" class="px-2.5 py-1 rounded text-slate-400 hover:text-white transition">Orders</button>
            </div>
          </div>

          <div class="relative h-72 sm:h-80 w-full">
            <canvas id="monthlyTrendChart"></canvas>
          </div>
        </div>

        <!-- Micro Trend Badges -->
        <div class="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-slate-900/60 rounded-lg p-2">
            <span class="text-slate-400 block">Peak Month</span>
            <strong id="trend-peak-month" class="text-yellow-400 font-semibold">December ($1.82M)</strong>
          </div>
          <div class="bg-slate-900/60 rounded-lg p-2">
            <span class="text-slate-400 block">Lowest Month</span>
            <strong id="trend-low-month" class="text-slate-300 font-semibold">February ($1.31M)</strong>
          </div>
          <div class="bg-slate-900/60 rounded-lg p-2">
            <span class="text-slate-400 block">Avg Monthly Sales</span>
            <strong id="trend-avg-sales" class="text-emerald-400 font-semibold">$1.55M / mo</strong>
          </div>
        </div>
      </div>

      <!-- Chart 2: Revenue by Product Category (4 cols) -->
      <div class="lg:col-span-4 glass-card rounded-2xl p-5 shadow-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <i data-lucide="pie-chart" class="w-4 h-4 text-emerald-400"></i>
                <h3 class="text-base font-bold text-slate-100">Revenue by Category</h3>
              </div>
              <p class="text-xs text-slate-400">Category sales share & item breakdown</p>
            </div>
            <button onclick="toggleCategoryChartType()" class="text-xs text-slate-400 hover:text-yellow-400 flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800" title="Switch chart type">
              <i data-lucide="arrow-left-right" class="w-3 h-3"></i>
              <span id="cat-chart-toggle-text">Bar View</span>
            </button>
          </div>

          <div class="relative h-64 sm:h-72 w-full flex items-center justify-center">
            <canvas id="categoryRevenueChart"></canvas>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-800">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Top Category: <strong id="top-category-name" class="text-emerald-400">Fruits & Veg ($2.82M)</strong></span>
            <span id="top-category-share" class="text-slate-300 font-semibold">15.17%</span>
          </div>
        </div>
      </div>

    </section>

    <!-- MAIN CHARTS ROW 2: PROFIT BY STORE OUTLET & TOP PRODUCTS -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Chart 3: Profit & Revenue by Store Outlet (7 cols) -->
      <div class="lg:col-span-7 glass-card rounded-2xl p-5 shadow-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <i data-lucide="bar-chart-3" class="w-4 h-4 text-cyan-400"></i>
                <h3 class="text-base font-bold text-slate-100">Profit & Revenue by Store Outlet</h3>
              </div>
              <p class="text-xs text-slate-400">Comparison of sales, gross profit and profitability across all 10 outlets</p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="inline-flex items-center gap-1 text-slate-400"><span class="w-2.5 h-2.5 rounded-sm bg-yellow-400 inline-block"></span> Sales</span>
              <span class="inline-flex items-center gap-1 text-slate-400"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block"></span> Profit</span>
            </div>
          </div>

          <div class="relative h-72 sm:h-80 w-full">
            <canvas id="outletProfitChart"></canvas>
          </div>
        </div>

        <!-- Outlet Performance Quick Summary -->
        <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div>Top Outlet: <strong class="text-yellow-400">OUT027</strong> ($3.45M Sales, Supermarket Type 3)</div>
          <div>Highest Margin: <strong class="text-emerald-400">OUT035</strong> ($2.27M Sales, Small Tier 2)</div>
        </div>
      </div>

      <!-- Chart 4: Top 10 High Performing Products (5 cols) -->
      <div class="lg:col-span-5 glass-card rounded-2xl p-5 shadow-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="flex items-center gap-2">
                <i data-lucide="award" class="w-4 h-4 text-amber-400"></i>
                <h3 class="text-base font-bold text-slate-100">Top 10 High Performing Products</h3>
              </div>
              <p class="text-xs text-slate-400">Ranked by revenue contribution & estimated profit</p>
            </div>
          </div>

          <div class="relative h-72 sm:h-80 w-full">
            <canvas id="topProductsChart"></canvas>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Top Product SKU: <strong id="top-product-sku" class="text-yellow-400">FDY55 ($42.6K)</strong></span>
          <span class="text-slate-300">Fruits & Vegetables</span>
        </div>
      </div>

    </section>

    <!-- SECONDARY ANALYTICS: LOCATION TIER, OUTLET SIZE, FAT CONTENT & PRICE TIERS -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Box 1: Location Tier Breakdown -->
      <div class="glass-card rounded-2xl p-4 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-purple-400"></i>
            Location Tier Sales
          </h4>
          <span class="text-xs text-purple-400 font-semibold" id="tier-winner-tag">Tier 3 Lead</span>
        </div>
        <div class="relative h-44 w-full">
          <canvas id="tierChart"></canvas>
        </div>
      </div>

      <!-- Box 2: Outlet Size Breakdown -->
      <div class="glass-card rounded-2xl p-4 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <i data-lucide="layers" class="w-3.5 h-3.5 text-cyan-400"></i>
            Outlet Size Sales
          </h4>
          <span class="text-xs text-cyan-400 font-semibold" id="size-winner-tag">Medium Lead</span>
        </div>
        <div class="relative h-44 w-full">
          <canvas id="sizeChart"></canvas>
        </div>
      </div>

      <!-- Box 3: Fat Content Breakdown -->
      <div class="glass-card rounded-2xl p-4 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <i data-lucide="heart-pulse" class="w-3.5 h-3.5 text-pink-400"></i>
            Fat Content Split
          </h4>
          <span class="text-xs text-pink-400 font-semibold" id="fat-winner-tag">64% Low Fat</span>
        </div>
        <div class="relative h-44 w-full">
          <canvas id="fatChart"></canvas>
        </div>
      </div>

      <!-- Box 4: Price Tier Segmentation -->
      <div class="glass-card rounded-2xl p-4 border border-slate-800">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <i data-lucide="badge-dollar-sign" class="w-3.5 h-3.5 text-yellow-400"></i>
            MRP Price Tiers
          </h4>
          <span class="text-xs text-yellow-400 font-semibold" id="price-winner-tag">Premium Lead</span>
        </div>
        <div class="relative h-44 w-full">
          <canvas id="priceTierChart"></canvas>
        </div>
      </div>

    </section>

    <!-- INTERACTIVE TOP PRODUCTS EXPLORER DATA TABLE -->
    <section class="glass-card rounded-2xl p-5 shadow-xl border border-slate-800">
      
      <!-- Table Header & Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <i data-lucide="table" class="w-4 h-4 text-yellow-400"></i>
            <h3 class="text-base font-bold text-slate-100">Top Products & Item Explorer</h3>
          </div>
          <p class="text-xs text-slate-400">Deep-dive into item MRP, revenue, estimated gross margins and outlet performance</p>
        </div>

        <!-- Search & Table Actions -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Live Search Input -->
          <div class="relative">
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"></i>
            <input type="text" id="table-search" oninput="onTableSearch(this.value)" placeholder="Search SKU or category..." class="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-yellow-400 outline-none w-48 sm:w-60">
          </div>

          <!-- Page Size -->
          <select id="table-page-size" onchange="onPageSizeChange(this.value)" class="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:ring-2 focus:ring-yellow-400 outline-none">
            <option value="10">10 / page</option>
            <option value="25" selected>25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>

          <!-- Export Table CSV -->
          <button onclick="exportTableCSV()" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition" title="Export this table to CSV">
            <i data-lucide="file-spreadsheets" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>Export Table</span>
          </button>
        </div>
      </div>

      <!-- Table Container -->
      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th scope="col" class="py-3 px-3 cursor-pointer hover:text-white transition" onclick="sortTable('id')">
                <div class="flex items-center gap-1">Item SKU <i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-500"></i></div>
              </th>
              <th scope="col" class="py-3 px-3 cursor-pointer hover:text-white transition" onclick="sortTable('c')">
                <div class="flex items-center gap-1">Category <i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-500"></i></div>
              </th>
              <th scope="col" class="py-3 px-3">Fat</th>
              <th scope="col" class="py-3 px-3">Outlet</th>
              <th scope="col" class="py-3 px-3">Tier / Format</th>
              <th scope="col" class="py-3 px-3 text-right cursor-pointer hover:text-white transition" onclick="sortTable('m')">
                <div class="flex items-center justify-end gap-1">MRP <i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-500"></i></div>
              </th>
              <th scope="col" class="py-3 px-3 text-right cursor-pointer hover:text-white transition" onclick="sortTable('sa')">
                <div class="flex items-center justify-end gap-1">Total Sales <i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-500"></i></div>
              </th>
              <th scope="col" class="py-3 px-3 text-right cursor-pointer hover:text-white transition" onclick="sortTable('pr')">
                <div class="flex items-center justify-end gap-1">Est. Profit <i data-lucide="chevrons-up-down" class="w-3 h-3 text-slate-500"></i></div>
              </th>
              <th scope="col" class="py-3 px-3 text-right">Margin %</th>
              <th scope="col" class="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody id="products-table-body" class="divide-y divide-slate-800 bg-slate-900/40">
            <!-- Dynamic rows inserted here -->
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div id="table-pagination-info">
          Showing <span id="table-start-idx" class="font-semibold text-slate-200">1</span> to <span id="table-end-idx" class="font-semibold text-slate-200">25</span> of <span id="table-total-count" class="font-semibold text-yellow-400">8,523</span> entries
        </div>

        <div class="flex items-center gap-1.5">
          <button id="btn-page-first" onclick="goToPage(1)" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">First</button>
          <button id="btn-page-prev" onclick="prevPage()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">Prev</button>
          
          <span class="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-medium">
            Page <span id="current-page-num" class="text-yellow-400">1</span> of <span id="total-page-num">341</span>
          </span>

          <button id="btn-page-next" onclick="nextPage()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">Next</button>
          <button id="btn-page-last" onclick="goToPage(totalPages)" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition">Last</button>
        </div>
      </div>

    </section>

    <!-- STORE OUTLET BENCHMARKING TABLE -->
    <section class="glass-card rounded-2xl p-5 shadow-xl border border-slate-800">
      <div class="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <i data-lucide="building-2" class="w-4 h-4 text-emerald-400"></i>
            <h3 class="text-base font-bold text-slate-100">Store Outlet Performance Matrix</h3>
          </div>
          <p class="text-xs text-slate-400">Comprehensive comparative analysis of all 10 retail outlets across India</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
            <tr>
              <th class="py-3 px-3">Outlet ID</th>
              <th class="py-3 px-3">Est. Year</th>
              <th class="py-3 px-3">Size</th>
              <th class="py-3 px-3">Tier</th>
              <th class="py-3 px-3">Outlet Format</th>
              <th class="py-3 px-3 text-right">Items Sold</th>
              <th class="py-3 px-3 text-right">Total Revenue ($)</th>
              <th class="py-3 px-3 text-right">Est. Profit ($)</th>
              <th class="py-3 px-3 text-right">Avg Sales / Item</th>
              <th class="py-3 px-3 text-right">Gross Margin %</th>
              <th class="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody id="outlet-matrix-body" class="divide-y divide-slate-800 bg-slate-900/40">
            <!-- Dynamic outlet rows inserted here -->
          </tbody>
        </table>
      </div>
    </section>

  </main>

  <!-- PRODUCT DETAIL MODAL -->
  <div id="product-modal" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
    <div class="glass-card bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Close Button -->
      <button onclick="closeProductModal()" class="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>

      <!-- Modal Content Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 rounded-xl bg-yellow-400/10 text-yellow-400">
          <i data-lucide="package-check" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 id="modal-item-id" class="text-lg font-bold text-white">FDA15</h3>
            <span id="modal-fat-badge" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">Low Fat</span>
          </div>
          <p id="modal-category" class="text-xs text-slate-400">Dairy Category</p>
        </div>
      </div>

      <!-- Modal Body Metrics -->
      <div class="grid grid-cols-2 gap-3 mb-5">
        <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <span class="text-[11px] text-slate-400 block mb-1">Item Outlet Sales</span>
          <span id="modal-sales" class="text-lg font-bold text-yellow-400">$3,735.14</span>
        </div>
        <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <span class="text-[11px] text-slate-400 block mb-1">Estimated Profit</span>
          <span id="modal-profit" class="text-lg font-bold text-emerald-400">$672.33</span>
        </div>
        <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <span class="text-[11px] text-slate-400 block mb-1">Maximum Retail Price (MRP)</span>
          <span id="modal-mrp" class="text-sm font-semibold text-slate-200">$249.81</span>
        </div>
        <div class="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <span class="text-[11px] text-slate-400 block mb-1">Profit Margin</span>
          <span id="modal-margin" class="text-sm font-semibold text-emerald-400">18.0%</span>
        </div>
      </div>

      <!-- Modal Store Details List -->
      <div class="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2 mb-5">
        <div class="flex justify-between"><span class="text-slate-400">Store Outlet:</span> <span id="modal-outlet" class="font-medium text-slate-200">OUT049 (Supermarket Type1)</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Location Tier & Size:</span> <span id="modal-tier-size" class="font-medium text-slate-200">Tier 1 • Medium Size</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Establishment Year:</span> <span id="modal-year" class="font-medium text-slate-200">1999</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Item Weight:</span> <span id="modal-weight" class="font-medium text-slate-200">9.30 kg</span></div>
        <div class="flex justify-between"><span class="text-slate-400">Store Visibility Index:</span> <span id="modal-visibility" class="font-medium text-slate-200">0.0160 (1.60%)</span></div>
      </div>

      <div class="flex justify-end">
        <button onclick="closeProductModal()" class="px-4 py-2 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition">
          Close Details
        </button>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-800/80 text-center text-xs text-slate-400 no-print">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Blinkit Grocery Analytics Dashboard • Built for Executive Decision Making</span>
      </div>
      <div>
        <span>Total Records Analyzed: <strong>8,523 Transactions</strong> across 10 Outlets</span>
      </div>
    </div>
  </footer>

  <!-- EMBEDDED DATASET & LOGIC -->
  <script>
    ` + embeddedDataJs + `
  </script>
  <script src="app.js"></script>
</body>
</html>
`;
const appJsCode = fs.readFileSync('app.js', 'utf8');

// Write index.html and dashboard.html
fs.writeFileSync('index.html', htmlTemplate);
fs.writeFileSync('dashboard.html', htmlTemplate);

// Standalone self-contained HTML
const standaloneHtml = htmlTemplate.replace('<script src="app.js"></script>', '<script>\n' + appJsCode + '\n</script>');
fs.writeFileSync('blinkit_dashboard_standalone.html', standaloneHtml);

console.log('index.html, dashboard.html, and blinkit_dashboard_standalone.html written successfully.');


