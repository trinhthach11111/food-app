import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="FoodHòaLạc API")

# Cấu hình CORS để Frontend (index.html) gọi được API từ trình duyệt
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# 1. TẠO DATABASE SQLITE & BẢNG NGUYÊN BẢN
# ---------------------------------------------------------
def init_db():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Bảng thực đơn (foods)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS foods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price INTEGER NOT NULL,
            description TEXT,
            category TEXT,
            image_url TEXT
        )
    """)
    
    # Bảng đơn hàng (orders)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            status TEXT DEFAULT 'Đang xử lý'
        )
    """)
    
    # Thêm dữ liệu mẫu các món Hòa Lạc nếu bảng đang trống
    cursor.execute("SELECT COUNT(*) FROM foods")
    if cursor.fetchone()[0] == 0:
        sample_foods = [
            ("Mì Tôm Xào Trứng Bò Cấp Tốc", 25000, "Mì tôm xào rau cải, kèm 1 trứng ốp la & thịt bò mềm thơm.", "main", "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400"),
            ("Cơm Rang Dưa Bò Giòn Rụm", 30000, "Cơm rang vàng giòn, dưa chua xào thịt bò đậm đà chuẩn vị.", "main", "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"),
            ("Bánh Mì Thập Cẩm Đầy Đặn", 20000, "Bánh mì giòn rụm kẹp pate, xá xíu, chả lụa & dưa góp.", "snack", "https://images.unsplash.com/photo-1626844131082-256783844137?w=400"),
            ("Trà Tắc Khổng Lồ Giải Nhiệt", 15000, "Ly 1 lít mát lạnh, thơm mùi tắc tươi giúp tỉnh táo học tập.", "drink", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400")
        ]
        cursor.executemany("INSERT INTO foods (name, price, description, category, image_url) VALUES (?, ?, ?, ?, ?)", sample_foods)
        
    conn.commit()
    conn.close()

init_db()

# ---------------------------------------------------------
# 2. KHAI BÁO MODEL DỮ LIỆU (Pydantic)
# ---------------------------------------------------------
class OrderCreate(BaseModel):
    student_name: str
    student_id: str
    delivery_address: str
    total_price: int

# ---------------------------------------------------------
# 3. CÁC API ENDPOINTS
# ---------------------------------------------------------

# API 1: Lấy danh sách thực đơn
@app.get("/api/foods")
def get_foods():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, price, description, category, image_url FROM foods")
    rows = cursor.fetchall()
    conn.close()
    
    foods = []
    for r in rows:
        foods.append({
            "id": r[0],
            "name": r[1],
            "price": r[2],
            "description": r[3],
            "category": r[4],
            "image_url": r[5]
        })
    return {"status": "success", "data": foods}

# API 2: Tạo đơn hàng mới từ sinh viên
@app.post("/api/orders")
def create_order(order: OrderCreate):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO orders (student_name, student_id, delivery_address, total_price) VALUES (?, ?, ?, ?)",
        (order.student_name, order.student_id, order.delivery_address, order.total_price)
    )
    order_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "status": "success", 
        "message": "Đã nhận đơn hàng thành công!", 
        "order_id": order_id
    }

