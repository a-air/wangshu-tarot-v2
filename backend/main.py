"""望舒塔罗 v2 — FastAPI 主应用

核心 API 端点:
- POST /api/draw     — 服务端洗牌抽牌
- POST /api/reading  — 提交信息+抽牌结果，返回AI解读
- GET  /api/zodiac   — 星座计算
- GET  /api/bazi     — 八字排盘
- GET  /api/health   — 健康检查
"""

import logging
import random
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_service import generate_reading
from bazi import calculate_bazi, get_zodiac
from config import settings
from database import create_reading, create_session, init_db
from tarot_data import FULL_DECK, get_card_by_id

# ==================== 日志配置 ====================

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ==================== 生命周期管理 ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时初始化数据库。"""
    logger.info("🌙 望舒塔罗 v2 后端启动中...")
    init_db()
    logger.info(f"数据库初始化完成: {settings.DATABASE_PATH}")
    logger.info(f"DashScope 模型: {settings.DASHSCOPE_MODEL}")
    yield
    logger.info("🌙 望舒塔罗 v2 后端关闭")


# ==================== FastAPI 应用 ====================

app = FastAPI(
    title="望舒塔罗 v2",
    description="塔罗占卜后端服务 — 八字排盘 + AI解读",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Pydantic 模型 ====================

class DrawRequest(BaseModel):
    """抽牌请求模型。"""
    spread_type: str = Field(
        default="single",
        pattern="^(single|three|celtic)$",
        description="牌阵类型: single/three/celtic",
    )


class CardItem(BaseModel):
    """单张牌结果模型。"""
    id: int = Field(description="牌ID (0-77)")
    name: str = Field(description="牌名")
    en: str = Field(default="", description="英文名")
    type: str = Field(default="major", description="类型: major/minor")
    orientation: str = Field(description="朝向: up/rev")
    position: int = Field(description="位置索引")


class DrawResponse(BaseModel):
    """抽牌响应模型。"""
    cards: list[CardItem]
    seed: str = Field(description="随机种子")


class ReadingRequest(BaseModel):
    """解读请求模型。"""
    name: str = Field(default="", description="用户姓名")
    year: Optional[int] = Field(default=None, ge=1900, le=2100, description="出生年份")
    month: Optional[int] = Field(default=None, ge=1, le=12, description="出生月份")
    day: Optional[int] = Field(default=None, ge=1, le=31, description="出生日期")
    hour: Optional[int] = Field(default=None, ge=0, le=23, description="出生时辰(24h)")
    gender: Optional[str] = Field(default=None, description="性别")
    question: str = Field(default="", description="用户问题")
    spread_type: str = Field(default="single", description="牌阵类型")
    cards: list[CardItem] = Field(description="抽牌结果")


class BaziResult(BaseModel):
    """八字排盘结果模型。"""
    year_pillar: str
    month_pillar: str
    day_pillar: str
    hour_pillar: str
    day_master: str
    five_elements: dict[str, int]
    strength: str
    favorable: str


class CardReading(BaseModel):
    """单张牌解读模型。"""
    card_name: str
    position: str
    orientation: str
    reading: str


class ReadingResponse(BaseModel):
    """解读响应模型。"""
    zodiac: str = Field(default="未知", description="星座")
    bazi: BaziResult = Field(description="八字排盘结果")
    card_readings: list[CardReading] = Field(description="逐牌解读")
    synthesis: str = Field(description="综合解读")
    session_id: str = Field(description="会话ID")


class ZodiacResponse(BaseModel):
    """星座响应模型。"""
    zodiac: str
    element: str
    ruling_planet: str


class HealthResponse(BaseModel):
    """健康检查响应模型。"""
    status: str
    version: str
    deck_size: int


# ==================== 牌阵配置 ====================

SPREAD_COUNTS: dict[str, int] = {
    "single": 1,
    "three": 3,
    "celtic": 10,
}


# ==================== API 端点 ====================

@app.get("/api/health", response_model=HealthResponse, summary="健康检查")
async def health_check():
    """健康检查端点，返回服务状态和牌组信息。"""
    return HealthResponse(
        status="ok",
        version="2.0.0",
        deck_size=len(FULL_DECK),
    )


@app.get("/api/zodiac", response_model=ZodiacResponse, summary="星座计算")
async def zodiac_endpoint(
    month: int = Query(..., ge=1, le=12, description="月份"),
    day: int = Query(..., ge=1, le=31, description="日期"),
):
    """根据月日计算星座（修正前端 bug）。

    前端的 getZodiac() 函数存在边界逻辑错误，此接口提供正确实现。
    """
    result = get_zodiac(month, day)
    return ZodiacResponse(**result)


@app.get("/api/bazi", response_model=BaziResult, summary="八字排盘")
async def bazi_endpoint(
    year: int = Query(..., ge=1900, le=2100, description="出生年份"),
    month: int = Query(..., ge=1, le=12, description="出生月份"),
    day: int = Query(..., ge=1, le=31, description="出生日期"),
    hour: Optional[int] = Query(default=None, ge=0, le=23, description="出生时辰"),
    gender: Optional[str] = Query(default=None, description="性别"),
):
    """八字排盘计算（实用简化版）。

    用公历日期近似推算，适合娱乐占卜场景。
    """
    result = calculate_bazi(year, month, day, hour, gender)
    return BaziResult(**result)


@app.post("/api/draw", response_model=DrawResponse, summary="服务端洗牌抽牌")
async def draw_cards(request: DrawRequest):
    """服务端洗牌抽牌，防止前端作弊和抄袭牌序逻辑。

    使用 Fisher-Yates 洗牌算法，随机决定正逆位（65%正位）。
    """
    spread_type = request.spread_type
    count = SPREAD_COUNTS.get(spread_type, 1)

    # 生成随机种子
    seed = uuid.uuid4().hex[:16]
    random.seed(seed + str(random.random()))

    # Fisher-Yates 洗牌
    deck_indices = list(range(len(FULL_DECK)))
    for i in range(len(deck_indices) - 1, 0, -1):
        j = random.randint(0, i)
        deck_indices[i], deck_indices[j] = deck_indices[j], deck_indices[i]

    # 抽牌
    drawn_cards: list[CardItem] = []
    for pos in range(count):
        card_id = deck_indices[pos]
        card_data = FULL_DECK[card_id]
        orientation = "up" if random.random() < 0.65 else "rev"

        drawn_cards.append(CardItem(
            id=card_id,
            name=card_data["name"],
            en=card_data.get("en", ""),
            type=card_data.get("type", "major"),
            orientation=orientation,
            position=pos,
        ))

    return DrawResponse(cards=drawn_cards, seed=seed)


@app.post("/api/reading", response_model=ReadingResponse, summary="AI塔罗解读")
async def reading_endpoint(request: ReadingRequest):
    """提交用户信息+抽牌结果，返回AI解读。

    流程：
    1. 计算星座（修正前端bug）
    2. 八字排盘
    3. 调用 DashScope AI 生成解读
    4. 存储会话和解读记录
    5. 返回完整解读结果
    """
    # 1. 星座计算
    zodiac_result = {"zodiac": "未知", "element": "未知", "ruling_planet": "未知"}
    if request.month and request.day:
        zodiac_result = get_zodiac(request.month, request.day)

    # 2. 八字排盘
    bazi_result = {
        "year_pillar": "未知", "month_pillar": "未知",
        "day_pillar": "未知", "hour_pillar": "未知",
        "day_master": "未知",
        "five_elements": {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0},
        "strength": "中和", "favorable": "未知",
    }
    if request.year and request.month and request.day:
        bazi_result = calculate_bazi(
            request.year, request.month, request.day,
            request.hour, request.gender,
        )

    # 3. 准备牌数据给 AI
    cards_for_ai = [card.model_dump() for card in request.cards]

    # 4. AI 解读
    ai_result = await generate_reading(
        name=request.name,
        question=request.question,
        spread_type=request.spread_type,
        cards=cards_for_ai,
        zodiac=zodiac_result["zodiac"],
        bazi=bazi_result,
    )

    # 5. 存储会话
    birth_info = {
        "year": request.year,
        "month": request.month,
        "day": request.day,
        "hour": request.hour,
        "gender": request.gender,
    }
    bazi_summary = (
        f"{bazi_result.get('year_pillar', '??')}年"
        f" {bazi_result.get('month_pillar', '??')}月"
        f" {bazi_result.get('day_pillar', '??')}日"
        f" {bazi_result.get('hour_pillar', '??')}时"
    )

    try:
        session_id = create_session(
            name=request.name,
            birth_info=birth_info,
            zodiac=zodiac_result["zodiac"],
            bazi_summary=bazi_summary,
        )
    except Exception as e:
        logger.error(f"创建会话失败: {e}")
        session_id = str(uuid.uuid4())

    # 6. 存储解读记录
    try:
        create_reading(
            session_id=session_id,
            spread_type=request.spread_type,
            cards=cards_for_ai,
            question=request.question,
            ai_reading=ai_result,
        )
    except Exception as e:
        logger.error(f"存储解读记录失败: {e}")

    # 7. 组装响应
    card_readings = []
    for cr in ai_result.get("card_readings", []):
        card_readings.append(CardReading(
            card_name=cr.get("card_name", "未知"),
            position=cr.get("position", ""),
            orientation=cr.get("orientation", ""),
            reading=cr.get("reading", ""),
        ))

    return ReadingResponse(
        zodiac=zodiac_result["zodiac"],
        bazi=BaziResult(**bazi_result),
        card_readings=card_readings,
        synthesis=ai_result.get("synthesis", "解读生成中，请稍候..."),
        session_id=session_id,
    )


# ==================== 静态文件服务（前端同源部署）====================

from fastapi.staticfiles import StaticFiles
from pathlib import Path

frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    # 必须放在所有 /api/* 路由之后，否则会拦截 API
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
    logger.info(f"前端已挂载: {frontend_path}")
else:
    logger.warning(f"前端目录不存在: {frontend_path}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
