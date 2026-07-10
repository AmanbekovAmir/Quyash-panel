import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'solar.db')


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    # ── Stats таблицасы ──────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stats (
            id      INTEGER PRIMARY KEY AUTOINCREMENT,
            icon    TEXT NOT NULL,
            value   TEXT NOT NULL,
            label   TEXT NOT NULL,
            unit    TEXT DEFAULT ''
        )
    ''')

    # ── FAQ таблицасы ────────────────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS faq (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer   TEXT NOT NULL,
            category TEXT DEFAULT 'general'
        )
    ''')

    # ── Calculator logs таблицасы ────────────────────────────────────────
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS calculations (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            panel_count     INTEGER,
            daily_kwh       REAL,
            monthly_savings REAL,
            payback_years   REAL,
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── Sample stats data ────────────────────────────────────────────────
    cursor.execute('SELECT COUNT(*) FROM stats')
    if cursor.fetchone()[0] == 0:
        stats_data = [
            ('☀️', '300+', 'Өзбекстанда жыллық күн нурлы күнлер саны', 'күн'),
            ('⚡', '25-30', 'Панельдиң орташа хызмет ўақты', 'жыл'),
            ('💰', '6-10', 'Орташа өз-өзин ақлаў мүддети', 'жыл'),
            ('🌿', '700', 'Ҳәр жылы үнемленетуғын CO₂ мөлшери (4 кВт система)', 'кг'),
            ('🏠', '4-6', 'Үй ушын кереклі панель саны (орташа)', 'дана'),
            ('📈', '80', 'Панель нәтийжелилиги 25 жылдан соң сақланады', '%'),
        ]
        cursor.executemany(
            'INSERT INTO stats (icon, value, label, unit) VALUES (?, ?, ?, ?)',
            stats_data
        )

    # ── Sample FAQ data ──────────────────────────────────────────────────
    cursor.execute('SELECT COUNT(*) FROM faq')
    if cursor.fetchone()[0] == 0:
        faq_data = [
            (
                'Күн панели қыста да жумыс ислей ме?',
                'Ҳәўа ашық болса, панельлер қыста да жумыс ислейди. Ҳаўа температурасы төмен болса, '
                'нәтийжелилик тийкарынан артады, себеби фотоэлементлер суық ҳаўада '
                'жақсырақ жумыс ислейди. Тек қар жабып қалса, тоқ өндириў тоқтайды.',
                'technical'
            ),
            (
                'Аккумулятор (батарея) орнатыў зәрүр бе?',
                'Зәрүр емес. Егер сиз тек электр желисине байланысқан (сеткалық) система орнатсаңыз, '
                'аккумулятор керек болмайды. Аккумулятор тек желиден толық ғәрезсиз болыў '
                'ямаса жели жийи үзиле беретуғын аймақлар ушын зәрүр.',
                'technical'
            ),
            (
                'Панельлерди техникалық қаўипсизлеў қыйын ба?',
                'Жоқ. Панельлер ҳәрекетлениўши бөлеклерсиз жумыс ислейди. Жылына '
                '1-2 мәрте панель бетин жуўыў жеткиликли. Жаңбыр да панельлерди '
                'тазалаўға жәрдем береди.',
                'maintenance'
            ),
            (
                'Артықша тоқты желиге сатыў мүмкин бе?',
                'Ҳәўа, бул «нетто-метринг» системасы арқалы мүмкин. Буның ушын '
                'эки тарифли (двухтарифный) счётчик орнатылады ҳәм жергиликли электр '
                'компаниясы менен шәртнама дүзиледи. Артықша тоқ желиге берилип, '
                'есаптан шегериледи.',
                'economic'
            ),
            (
                'Панельлерди өзим орната аламан ба?',
                'Техникалық жақтан мүмкин болса да, электр желисине байланыстырыў '
                'ушын лицензияланған электрик маманы зәрүр. Бул қаўипсизлик '
                'ҳәм нызамнама талабы болып табылады.',
                'technical'
            ),
            (
                'Панельлер неше жылда өзгереди?',
                'Жоқары сапалы панельлер 25-30 жыл хызмет етеди. '
                '25 жылдан соң да нәтийжелиликтиң 80%-ы сақланады. '
                'Инвертор болса 10-15 жылда алмастырыў керек болыўы мүмкин.',
                'maintenance'
            ),
        ]
        cursor.executemany(
            'INSERT INTO faq (question, answer, category) VALUES (?, ?, ?)',
            faq_data
        )

    conn.commit()
    conn.close()
    print('[OK] Database initialized.')


def get_stats():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM stats ORDER BY id').fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_faq():
    conn = get_connection()
    rows = conn.execute('SELECT * FROM faq ORDER BY id').fetchall()
    conn.close()
    return [dict(r) for r in rows]


def save_calculation(panel_count, daily_kwh, monthly_savings, payback_years):
    conn = get_connection()
    conn.execute(
        'INSERT INTO calculations (panel_count, daily_kwh, monthly_savings, payback_years) '
        'VALUES (?, ?, ?, ?)',
        (panel_count, daily_kwh, monthly_savings, payback_years)
    )
    conn.commit()
    conn.close()
