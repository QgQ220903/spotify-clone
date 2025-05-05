

### **Hướng dẫn cài đặt**

#### **1 Clone source code từ GitHub**

* Repository: [https://github.com/QgQ220903/spotify-clone.git](https://github.com/QgQ220903/spotify-clone.git)
* Thực hiện:

  ```bash
  git clone https://github.com/QgQ220903/spotify-clone.git
  cd spotify-clone
  ```

#### **2 Cài đặt Backend**

1. Vào thư mục `backend`:

   ```bash
   cd backend
   ```
2. Tạo và kích hoạt môi trường ảo Python:

   * Trên **Linux/MacOS**:

     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   * Trên **Windows**:

     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```
3. Cài đặt các dependencies:

   ```bash
   pip install -r requirements.txt
   ```
4. Thiết lập cơ sở dữ liệu:

   ```bash
   python manage.py migrate
   ```
5. Tạo tài khoản **superuser** (tùy chọn):

   ```bash
   python manage.py createsuperuser
   ```

#### **4.2.3 Cài đặt Frontend**

1. Mở terminal mới và vào thư mục `frontend`:

   ```bash
   cd ../frontend
   ```
2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

#### **4.2.4 Cài đặt Admin Frontend**

1. Mở terminal mới và vào thư mục `admin-frontend`:

   ```bash
   cd ../admin-frontend
   ```
2. Cài đặt các dependencies:

   ```bash
   npm install
   ```

---

### **Hướng dẫn chạy ứng dụng**

#### **1 Khởi chạy Backend**

```bash
cd backend
python manage.py runserver
```

* Backend sẽ chạy tại: **[http://localhost:8000](http://localhost:8000)**

#### **2 Khởi chạy Frontend**

```bash
cd frontend
npm run dev
```

* Frontend người dùng sẽ tự động mở tại: **[http://localhost:5173](http://localhost:5173)**

#### **3 Khởi chạy Admin Frontend**

```bash
cd admin-frontend
npm run dev
```

* Frontend quản trị sẽ tự động mở tại: **[http://localhost:5174](http://localhost:5174)**

#### **4 Truy cập ứng dụng**

* Truy cập ứng dụng người dùng: **[http://localhost:5173](http://localhost:5173)**
* Truy cập trang quản trị Django: **[http://localhost:8000/admin](http://localhost:8000/admin)**

> **Lưu ý:** Đảm bảo **backend**, **frontend**, và **admin-frontend** đều đang chạy đồng thời để ứng dụng hoạt động đầy đủ chức năng.

