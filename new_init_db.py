def init_db():
    try:
        conn = get_db_connection()
        c = conn.cursor()
        
        c.execute('''CREATE TABLE IF NOT EXISTS signals (
            id SERIAL PRIMARY KEY,
            asset TEXT NOT NULL, mode TEXT, timestamp TEXT NOT NULL,
            direction TEXT, entry_low REAL, entry_high REAL,
            tp1 REAL, tp2 REAL, tp3 REAL, sl REAL,
            confluence_score REAL, htf_trend TEXT, etf_trend TEXT,
            rsi_htf REAL, atr REAL, regime TEXT, session TEXT,
            outcome TEXT DEFAULT NULL, outcome_checked_at TEXT DEFAULT NULL,
            pnl_atr REAL DEFAULT NULL, exit_price REAL DEFAULT NULL,
            bars_to_exit INTEGER DEFAULT NULL, notes TEXT DEFAULT NULL,
            verdict TEXT DEFAULT 'EXECUTE',
            current_price_at_signal REAL DEFAULT NULL,
            win_probability_pct REAL DEFAULT NULL,
            expected_value_r REAL DEFAULT NULL,
            hard_block_reason TEXT DEFAULT NULL,
            wait_reason TEXT DEFAULT NULL
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS asset_weights (
            asset TEXT PRIMARY KEY,
            w_structure REAL DEFAULT 20, w_liquidity REAL DEFAULT 15,
            w_choch REAL DEFAULT 15, w_ob REAL DEFAULT 10,
            w_fvg REAL DEFAULT 10, w_sd REAL DEFAULT 10,
            w_pd REAL DEFAULT 10, w_pa REAL DEFAULT 5, w_session REAL DEFAULT 5,
            total_trades INTEGER DEFAULT 0, win_rate REAL DEFAULT NULL,
            last_updated TEXT DEFAULT NULL
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS daily_performance (
            id SERIAL PRIMARY KEY, date TEXT NOT NULL,
            asset TEXT NOT NULL, trades INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0,
            pnl_atr REAL DEFAULT 0, win_rate REAL DEFAULT NULL,
            UNIQUE(date, asset)
        )''')

        c.execute('''CREATE TABLE IF NOT EXISTS active_thesis (
            id SERIAL PRIMARY KEY,
            asset TEXT NOT NULL,
            mode TEXT NOT NULL,
            direction TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            confluence_score REAL,
            htf_trend TEXT,
            etf_trend TEXT,
            entry_low REAL,
            entry_high REAL,
            sl REAL,
            tp1 REAL,
            tp2 REAL,
            tp3 REAL,
            invalidation_price REAL,
            invalidation_reason TEXT,
            structural_anchor TEXT,
            times_confirmed INTEGER DEFAULT 1,
            invalidated_at TEXT DEFAULT NULL,
            invalidated_reason TEXT DEFAULT NULL,
            original_entry_low REAL DEFAULT NULL,
            original_entry_high REAL DEFAULT NULL,
            zone_source TEXT DEFAULT 'OB',
            zone_refined_count INTEGER DEFAULT 0,
            closest_approach_price REAL DEFAULT NULL,
            closest_approach_atr REAL DEFAULT NULL,
            closest_approach_at TEXT DEFAULT NULL,
            near_miss_count INTEGER DEFAULT 0,
            last_checked_at TEXT DEFAULT NULL,
            last_checked_price REAL DEFAULT NULL,
            locked_win_probability REAL DEFAULT NULL,
            locked_expected_value REAL DEFAULT NULL,
            locked_confluence REAL DEFAULT NULL,
            locked_at TEXT DEFAULT NULL
        )''')
        
        c.execute('''CREATE UNIQUE INDEX IF NOT EXISTS idx_active_thesis_asset_mode 
            ON active_thesis(asset, mode) 
            WHERE status = 'ACTIVE' ''')

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error initializing DB: {e}")
