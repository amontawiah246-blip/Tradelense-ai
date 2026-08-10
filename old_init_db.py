def init_db():
    if os.path.exists(DB_PATH):
        try:
            conn = get_db_connection()
            conn.execute('SELECT 1 FROM sqlite_master LIMIT 1')
            conn.close()
        except psycopg2.DatabaseError:
            try: conn.close()
            except: pass
            try:
                os.remove(DB_PATH)
                print('WARNING: Corrupt DB removed. Creating fresh.', file=sys.stderr)
            except OSError as e:
                print(f'WARNING: Could not remove corrupt DB: {e}', file=sys.stderr)
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS signals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        # v13: add columns to any pre-existing signals table from before this patch
        # (SQLite requires ALTER TABLE for existing DBs — CREATE TABLE IF NOT EXISTS
        # won't add new columns to an already-existing table)
        existing_cols = [row[1] for row in c.execute("PRAGMA table_info(signals)").fetchall()]
        new_cols = {
            'verdict':                  "TEXT DEFAULT 'EXECUTE'",
            'current_price_at_signal':  'REAL DEFAULT NULL',
            'win_probability_pct':      'REAL DEFAULT NULL',
            'expected_value_r':         'REAL DEFAULT NULL',
            'hard_block_reason':        'TEXT DEFAULT NULL',
            'wait_reason':              'TEXT DEFAULT NULL',
        }
        for col, coltype in new_cols.items():
            if col not in existing_cols:
                try:
                    c.execute(f'ALTER TABLE signals ADD COLUMN {col} {coltype}')
                except Exception:
                    pass  # column likely already exists from a concurrent init
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
            id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL,
            asset TEXT NOT NULL, trades INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0,
            pnl_atr REAL DEFAULT 0, win_rate REAL DEFAULT NULL
        )''')
        c.execute('''CREATE TABLE IF NOT EXISTS active_thesis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
            invalidated_reason TEXT DEFAULT NULL
        )''')
        c.execute('''CREATE UNIQUE INDEX IF NOT EXISTS idx_active_thesis_asset_mode
            ON active_thesis(asset, mode)
            WHERE status = 'ACTIVE' ''')
            
        # v16: extend active_thesis with zone-refinement and proximity tracking
        existing_thesis_cols = [row[1] for row in c.execute("PRAGMA table_info(active_thesis)").fetchall()]
        new_thesis_cols = {
            'original_entry_low':       'REAL DEFAULT NULL',   # the FIRST zone ever set — never overwritten
            'original_entry_high':      'REAL DEFAULT NULL',
            'zone_source':              "TEXT DEFAULT 'OB'",    # 'OB' | 'FVG' | 'IFVG' — what kind of zone is currently active
            'zone_refined_count':       'INTEGER DEFAULT 0',    # how many times the trigger zone has been refined to a fresher FVG/iFVG
            'closest_approach_price':   'REAL DEFAULT NULL',    # closest price has come to the CURRENT zone, ever
            'closest_approach_atr':     'REAL DEFAULT NULL',    # that distance expressed in ATR units
            'closest_approach_at':      'TEXT DEFAULT NULL',    # timestamp of the closest approach
            'near_miss_count':          'INTEGER DEFAULT 0',    # how many times price approached within tolerance then reversed away
            'last_checked_at':          'TEXT DEFAULT NULL',
            'last_checked_price':       'REAL DEFAULT NULL',
        }
        for col, coltype in new_thesis_cols.items():
            if col not in existing_thesis_cols:
                try:
                    c.execute(f'ALTER TABLE active_thesis ADD COLUMN {col} {coltype}')
                except Exception:
                    pass

        # v16.1: lock confidence/EV at thesis CREATION time, separate from
        # whatever this run's fresh recalculation produces
        existing_thesis_cols_v161 = [row[1] for row in c.execute("PRAGMA table_info(active_thesis)").fetchall()]
        new_thesis_cols_v161 = {
            'locked_win_probability': 'REAL DEFAULT NULL',
            'locked_expected_value':  'REAL DEFAULT NULL',
            'locked_confluence':      'REAL DEFAULT NULL',
            'locked_at':              'TEXT DEFAULT NULL',
        }
        for col, coltype in new_thesis_cols_v161.items():
            if col not in existing_thesis_cols_v161:
                try:
                    c.execute(f'ALTER TABLE active_thesis ADD COLUMN {col} {coltype}')
                except Exception:
                    pass
        conn.commit()
