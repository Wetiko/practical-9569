import sqlite3
from datetime import date
from flask import Flask, request, redirect, render_template

def create_app(database='bookings.db'):
    app = Flask(__name__)
    def connect():
        conn = sqlite3.connect(database)
        conn.execute('PRAGMA foreign_keys=ON')
        return conn
    with connect() as conn:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS Customer(id INTEGER PRIMARY KEY,name TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Event(id INTEGER PRIMARY KEY,title TEXT NOT NULL,day TEXT NOT NULL,category TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS Booking(customer_id INTEGER REFERENCES Customer(id),event_id INTEGER REFERENCES Event(id),quantity INTEGER CHECK(quantity BETWEEN 1 AND 8),PRIMARY KEY(customer_id,event_id));
        INSERT OR IGNORE INTO Customer VALUES(1,'Ari'),(2,'Mei');
        INSERT OR IGNORE INTO Event VALUES(1,'Robotics','2026-10-01','Tech'),(2,'Pottery','2026-10-02','Art');
        ''')
    @app.route('/', methods=['GET','POST'])
    def index():
        if request.method == 'POST':
            try:
                customer, event, quantity = [int(request.form[k]) for k in ['customer','event','quantity']]
                if not 1 <= quantity <= 8:
                    raise ValueError()
                with connect() as conn:
                    conn.execute('INSERT INTO Booking VALUES(?,?,?)',(customer,event,quantity))
            except (ValueError,KeyError,sqlite3.IntegrityError):
                return 'Invalid or duplicate booking',400
            return redirect('/')
        day, category = request.args.get('day',''), request.args.get('category','')
        if day:
            try:
                if date.fromisoformat(day).isoformat()!=day:
                    raise ValueError()
            except ValueError:
                return 'Invalid date',400
        sql = 'SELECT c.name,e.title,e.day,e.category,b.quantity FROM Booking b JOIN Customer c ON c.id=b.customer_id JOIN Event e ON e.id=b.event_id WHERE 1=1'
        params = []
        for column,value in [('e.day',day),('e.category',category)]:
            if value:
                sql += ' AND '+column+'=?'
                params.append(value)
        with connect() as conn:
            rows = conn.execute(sql+' ORDER BY e.day,c.id,e.id',params).fetchall()
        return render_template('index.html',rows=rows,day=day,category=category)
    return app

if __name__=='__main__':
    create_app().run(host='127.0.0.1',port=5051)
