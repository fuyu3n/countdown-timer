# countdown-timer [VIBE CODE]

Countdown Timer แบบ real-time ที่ใช้ WebSocket ในการซิงค์เวลาระหว่างหน้า Control และหน้า Display
เหมาะสำหรับใช้ในงาน Streaming, Presentation หรืองานที่ต้องการแสดงเวลานับถอยหลังบนหน้าจอแยกต่างหาก

---

## โครงสร้างหน้าของ App

| หน้า | URL | คำอธิบาย |
|------|-----|-----------|
| **Control** | `/control` | หน้าควบคุมตั้งเวลาและสั่ง Start / Stop / Reset |
| **Display** | `/display` | หน้าแสดงผลเวลานับถอยหลัง ตัวใหญ่ เหมาะใส่ใน Browser Source |

---

## การใช้งาน

### 1. ตั้งค่าเวลา

เปิดหน้า **Control** แล้วกรอกเวลาในช่อง **ชั่วโมง : นาที : วินาที**

### 2. ควบคุมนาฬิกา

| ปุ่ม | สี | การทำงาน |
|------|----|----------|
| **Start** | เขียว | เริ่มนับถอยหลัง (ถ้าหยุดค้างไว้จะนับต่อจากที่เหลือ) |
| **Stop** | เหลือง | หยุดนาฬิกาชั่วคราว โดยเก็บเวลาที่เหลือไว้ |
| **Reset** | แดง | รีเซ็ตกลับไปยังเวลาที่ตั้งไว้ |

### 3. หน้า Display

เปิดหน้า **Display** บนจอหรือหน้าต่างอื่น นาฬิกาจะซิงค์อัตโนมัติผ่าน WebSocket
เมื่อเวลาหมด จะมีเสียงแจ้งเตือนดังขึ้นประมาณ **10 วินาที**

---

## การแยก Room ด้วย `?user=`

App รองรับการแยก room สำหรับผู้ใช้หลายคน โดยส่ง query parameter `user` ในทั้งสอง URL

```
/control?user=alice   ←→   /display?user=alice
/control?user=bob     ←→   /display?user=bob
```

Control และ Display ที่ใช้ `user` เดียวกันจะซิงค์หากัน และไม่กระทบ room ของคนอื่น
หากไม่ระบุ `user` จะใช้ room ชื่อ `default` โดยอัตโนมัติ

---

## การติดตั้งและรัน

### ข้อกำหนด

- [Bun](https://bun.sh) v1.x ขึ้นไป

### ติดตั้ง dependencies

```bash
bun install
```

### รันในโหมด Development (มี Hot Reload)

```bash
bun dev
```

### รันในโหมด Production

```bash
bun start
```

เซิร์ฟเวอร์จะรันที่ `http://localhost:3030` (เปลี่ยนได้ด้วย env `PORT`)

### Deploy บน Railway

Deploy จาก GitHub branch `main` อัตโนมัติ ตั้ง env `PORT=3030` และเปิด Serverless (App Sleeping) ไว้
service จะหลับเมื่อไม่มี traffic ประมาณ 10 นาที และตื่นเมื่อมี request เข้ามา (request แรกจะช้ากว่าปกติ)

---

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Frontend**: React 19 + Tailwind CSS v4
- **Real-time**: WebSocket (Bun built-in)
- **Hosting**: Railway (Serverless)
