# 🌙 望舒塔罗 · Wangshu Tarot

> 月光下的牌阵 · 八字 + 塔罗 + AI 解读

## 直接使用（最简）

**双击 `启动.bat`** → 浏览器自动打开 → 开占。

完事。

---

## 第一次跑前的准备

只需要装一次 Python，以后都不用管：

1. 装 Python 3.9 及以上：https://www.python.org/downloads/
   - 装的时候**勾选 "Add Python to PATH"**（很重要）
2. 双击 `启动.bat`，会自动装依赖、起服务、开浏览器
3. 看到浏览器跳出"望舒塔罗"主页就成功了

---

## 项目结构

```
wangshu-tarot-v2/
├── 启动.bat              ← 双击这个就行
├── README.md             ← 你正在看的文件
├── backend/              ← FastAPI 后端
│   ├── main.py           ← 入口（已挂载前端，同源部署）
│   ├── ai_service.py     ← 调 DashScope 千问
│   ├── bazi.py           ← 八字排盘
│   ├── tarot_data.py     ← 78 张牌数据
│   ├── database.py       ← SQLite
│   └── requirements.txt  ← 依赖清单
├── frontend/             ← 纯静态前端（HTML/JS/CSS）
│   ├── index.html
│   ├── app.js            ← 主逻辑
│   ├── cards.js          ← 牌面 SVG + 牌池
│   └── styles.css
└── data/
```

## 用法

1. 启动后访问 http://127.0.0.1:8000
2. 填写姓名、出生日期、想问的问题
3. 选牌阵：单张 / 三牌阵 / 凯尔特十字
4. 洗牌 → 抽牌 → 翻牌 → AI 解读

## API

启动后可看 Swagger 文档：http://127.0.0.1:8000/docs

| 接口 | 说明 |
|---|---|
| `POST /api/draw` | 服务端洗牌抽牌 |
| `POST /api/reading` | 提交牌+信息，返回 AI 解读 |
| `GET  /api/zodiac` | 星座计算 |
| `GET  /api/bazi`   | 八字排盘 |
| `GET  /api/health` | 健康检查 |

## 配置（可选）

后端使用 DashScope 千问。代码里已内置默认 key，要换的话在 `backend/` 目录下新建 `.env`：

```
DASHSCOPE_API_KEY=你的key
DASHSCOPE_MODEL=qwen-plus
PORT=8000
```

## 常见问题

**Q: 后端没起来怎么办？**
A: 不影响。前端会自动 fallback 到本地模板解读，照样能用。

**Q: 端口 8000 被占用？**
A: 在 `backend/.env` 里改 `PORT=8001`，然后改启动脚本里的端口号。

**Q: 想换牌面美术？**
A: 改 `frontend/cards.js` 里的 `getMajorSVG` / `getMinorSVG` 函数，或用 `<img src="...">` 替换 SVG 字符串。

---

🌙 望舒，与扶光同在。
