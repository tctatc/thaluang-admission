# เผยแพร่ระบบรับสมัครขึ้น GitHub Pages

repo: https://github.com/tctatc/thaluang-admission
หน้าเว็บ: https://tctatc.github.io/thaluang-admission/

ทุกครั้งที่ push เข้า branch `main` จะมี GitHub Actions (`.github/workflows/deploy-pages.yml`) รันเทส build หน้าเว็บ แล้วเผยแพร่ให้เองภายในราว 2 นาที ดูความคืบหน้าได้ที่แท็บ **Actions** ของ repo

## สิ่งที่เป็นสาธารณะ และสิ่งที่ไม่ใช่

| อยู่บน GitHub (ใครก็อ่านได้) | ไม่เคยขึ้น GitHub |
|---|---|
| โค้ดหน้าเว็บและโค้ด Apps Script | ข้อมูลผู้สมัคร (อยู่ใน Google Sheets ของวิทยาลัย) |
| ตรา สอศ. ตราวิทยาลัย และ PDF ใบสมัครเปล่า | ไฟล์เอกสารแนบ (อยู่ใน Google Drive แบบส่วนตัว) |
| URL ของ Apps Script หลังตั้งค่าแล้ว | กุญแจลับ รหัสผ่านเจ้าหน้าที่ token ของ LINE (อยู่ใน Script Properties) |

## แก้โค้ดแล้วเอาขึ้นใหม่

```bash
cd /Users/shoyu/code/thaluang-admission
npm run verify                 # เทสต้องผ่านก่อน
npm run build:domain           # ถ้าแก้ไฟล์ใน shared/
git add -A
git commit -m "อธิบายสิ่งที่แก้"
git push
```

ถ้าแก้ `shared/` แล้วลืมรัน `npm run build:domain` ขั้นตอนบน GitHub จะไม่ผ่านและแจ้งเตือนในแท็บ Actions เพราะฝั่ง Apps Script จะใช้กฎเก่าโดยไม่มีใครรู้

## ต่อหน้าเว็บกับ Google Sheets (เลิกโหมดสาธิต)

1. ติดตั้ง Apps Script ตาม README หัวข้อ "ติดตั้งของจริง" จนได้ URL ที่ลงท้ายด้วย `/exec`
2. ใน repo เข้า **Settings → Secrets and variables → Actions → แท็บ Variables → New repository variable**
   - Name: `VITE_API_URL`
   - Value: URL `/exec` ที่ได้
3. เข้าแท็บ **Actions** เลือก workflow "ตรวจและเผยแพร่หน้าเว็บขึ้น GitHub Pages" แล้วกด **Run workflow** (หรือ push อะไรก็ได้หนึ่งครั้ง)
4. เปิดหน้าเว็บ แถบเหลือง "โหมดสาธิต" ต้องหายไป
5. ใส่ `PUBLIC_SITE_URL` = `https://tctatc.github.io/thaluang-admission/` ใน Script Properties ของ Apps Script เพื่อให้ลิงก์ในอีเมลถึงผู้สมัครถูกต้อง

ใช้ Variables ไม่ใช่ Secrets เพราะ URL นี้ถูกฝังในหน้าเว็บที่ทุกคนดาวน์โหลดอยู่แล้ว ความปลอดภัยของระบบอยู่ที่การตรวจสิทธิ์ฝั่ง Apps Script

## ถ้าเว็บไม่ขึ้น

| อาการ | สาเหตุที่พบบ่อย |
|---|---|
| หน้า 404 | ยังไม่ได้ตั้ง **Settings → Pages → Source = GitHub Actions** หรือ workflow ยังรันไม่เสร็จ |
| แท็บ Actions มีกากบาทแดง | เปิดดูขั้นที่พัง ส่วนใหญ่คือเทสไม่ผ่าน หรือลืม `npm run build:domain` |
| ดับเบิลคลิก `index.html` ในเครื่องแล้วหน้าขาว | เบราว์เซอร์ไม่ให้เปิดแบบนี้ ใช้ `cd web && npm run dev` แล้วเปิด http://localhost:5174 |
| ขึ้น "เซิร์ฟเวอร์ตอบกลับในรูปแบบที่อ่านไม่ได้" | URL Apps Script ผิด หรือ deploy ไม่ได้ตั้ง Who has access = Anyone |
