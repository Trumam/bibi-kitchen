// server.js 完整代码
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();

// 允许跨域（解决GitHub Pages访问后端的跨域问题）
app.use(cors({
  origin: "*", // 开发阶段允许所有域名访问，生产可限定为你的GitHub Pages地址
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// 解析JSON请求体
app.use(express.json({ limit: "1mb" }));

// 数据存储文件路径（会自动创建）
const DATA_FILE = "./data.json";

// 初始化数据文件（首次运行时创建默认数据）
function initDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      menu: [], // 菜品列表
      categories: ["肉类", "菜类", "饮料", "甜品"], // 默认分类
      orders: [] // 订单列表
    };
    // 写入默认数据到JSON文件
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
    console.log("初始化默认数据文件成功");
  }
}

// 1. 接口：获取所有数据（菜单/分类/订单）
app.get("/api/data", (req, res) => {
  try {
    initDataFile(); // 确保文件存在
    const data = fs.readFileSync(DATA_FILE, "utf8");
    res.json(JSON.parse(data)); // 返回JSON数据
  } catch (err) {
    res.status(500).json({ error: "读取数据失败", msg: err.message });
  }
});

// 2. 接口：更新所有数据（覆盖式保存）
app.post("/api/data", (req, res) => {
  try {
    // 验证请求数据格式
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: "无效的请求数据" });
    }
    // 将前端传来的数据写入JSON文件
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ success: true, msg: "数据保存成功" });
  } catch (err) {
    res.status(500).json({ error: "保存数据失败", msg: err.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000; // 优先使用平台分配的端口，本地用3000
app.listen(PORT, () => {
  initDataFile(); // 启动时初始化数据文件
  console.log(`后端服务运行中 → http://localhost:${PORT}`);
  console.log("测试接口：GET http://localhost:3000/api/data");
});