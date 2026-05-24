@echo off
chcp 65001 >nul
title 望舒塔罗 · Wangshu Tarot
color 0D

echo.
echo  ============================================================
echo   🌙  望舒塔罗 · Wangshu Tarot  ·  v2.0
echo  ============================================================
echo.
echo   月光下的牌阵  ·  八字 + 塔罗 + AI 解读
echo.
echo  ============================================================
echo.

cd /d "%~dp0backend"

echo [1/3] 检查 Python 环境...
where python >nul 2>nul
if errorlevel 1 (
    echo  ❌ 未找到 Python，请先安装 Python 3.9+
    echo     下载：https://www.python.org/downloads/
    pause
    exit /b 1
)
echo  ✓ Python 已就绪
echo.

echo [2/3] 检查依赖...
python -c "import fastapi, uvicorn, httpx, dotenv" >nul 2>nul
if errorlevel 1 (
    echo  ⚠️  依赖未安装，正在自动安装...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo  ❌ 依赖安装失败，请手动运行：
        echo     cd backend
        echo     pip install -r requirements.txt
        pause
        exit /b 1
    )
)
echo  ✓ 依赖齐全
echo.

echo [3/3] 启动望舒塔罗服务...
echo.
echo  🌙 服务地址：http://127.0.0.1:8000
echo  📖 API文档：http://127.0.0.1:8000/docs
echo.
echo  浏览器即将自动打开。如未弹出，请手动访问上方地址。
echo.
echo  关闭此窗口即可停止服务。
echo  ============================================================
echo.

start "" "http://127.0.0.1:8000"

python main.py
