from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from database import init_db, get_stats, get_faq, save_calculation
import math

app = Flask(__name__)
CORS(app)

# ── Database'ти инициализациялаў ─────────────────────────────────────────────
init_db()


# ── Тийкарғы бет ────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


# ── Статистика API ───────────────────────────────────────────────────────────
@app.route('/api/stats')
def api_stats():
    return jsonify(get_stats())


# ── FAQ API ──────────────────────────────────────────────────────────────────
@app.route('/api/faq')
def api_faq():
    return jsonify(get_faq())


# ── Калькулятор API ──────────────────────────────────────────────────────────
@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    data = request.get_json()

    panel_count   = int(data.get('panel_count', 6))
    panel_watt    = int(data.get('panel_watt', 400))       # Ватт/панель
    tariff        = float(data.get('tariff', 900))          # сум/кВт·сааттан
    install_cost  = float(data.get('install_cost', 8_000_000))  # сум
    sun_hours     = float(data.get('sun_hours', 5.5))       # күнлик орташа

    # ── Есаплаўлар ───────────────────────────────────────────────────────────
    daily_kwh        = panel_count * panel_watt * sun_hours / 1000
    monthly_kwh      = daily_kwh * 30
    yearly_kwh       = daily_kwh * 365

    monthly_savings  = monthly_kwh * tariff
    yearly_savings   = yearly_kwh * tariff

    payback_years    = install_cost / yearly_savings if yearly_savings > 0 else 0
    payback_years    = round(payback_years, 1)

    total_25y        = yearly_savings * 25
    net_profit_25y   = total_25y - install_cost

    # ── Айлар бойынша диаграмма мағлыўматы ───────────────────────────────────
    sun_by_month = [4.2, 5.0, 6.1, 7.3, 8.2, 9.0, 8.8, 8.5, 7.4, 6.0, 4.8, 3.9]
    monthly_production = [
        round(panel_count * panel_watt * h / 1000 * 30, 1)
        for h in sun_by_month
    ]

    result = {
        'panel_count'      : panel_count,
        'daily_kwh'        : round(daily_kwh, 2),
        'monthly_kwh'      : round(monthly_kwh, 1),
        'yearly_kwh'       : round(yearly_kwh, 1),
        'monthly_savings'  : round(monthly_savings),
        'yearly_savings'   : round(yearly_savings),
        'payback_years'    : payback_years,
        'total_25y'        : round(total_25y),
        'net_profit_25y'   : round(net_profit_25y),
        'monthly_production': monthly_production,
    }

    # Логты сақлаў
    save_calculation(panel_count, daily_kwh, monthly_savings, payback_years)

    return jsonify(result)


# ── Барлық есаплаўлар тарийхы ────────────────────────────────────────────────
@app.route('/api/calculations')
def api_calculations():
    import sqlite3
    from database import get_connection
    conn = get_connection()
    rows = conn.execute(
        'SELECT * FROM calculations ORDER BY created_at DESC LIMIT 20'
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


if __name__ == '__main__':
    print('[START] Server running at http://localhost:5000')
    app.run(debug=True, port=5000)
