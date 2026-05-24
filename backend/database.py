"""望舒塔罗 v2 — SQLite 数据层

管理用户会话和占卜记录的持久化存储。

表结构:
- sessions: 用户会话（id, name, birth_info, zodiac, bazi_summary, created_at）
- readings: 占卜记录（id, session_id, spread_type, cards_json, question, ai_reading, created_at）
"""

import json
import logging
import sqlite3
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)

# 数据库文件路径
DB_PATH = Path(settings.DATABASE_PATH)


def _get_conn() -> sqlite3.Connection:
    """获取 SQLite 数据库连接。

    Returns:
        sqlite3.Connection 实例，启用了 WAL 模式和外键约束。
    """
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    """初始化数据库，创建表结构。

    如果表已存在则跳过。
    """
    conn = _get_conn()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL DEFAULT '',
                birth_info TEXT NOT NULL DEFAULT '{}',
                zodiac TEXT NOT NULL DEFAULT '',
                bazi_summary TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
            );

            CREATE TABLE IF NOT EXISTS readings (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                spread_type TEXT NOT NULL DEFAULT 'single',
                cards_json TEXT NOT NULL DEFAULT '[]',
                question TEXT NOT NULL DEFAULT '',
                ai_reading TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            );

            CREATE INDEX IF NOT EXISTS idx_readings_session ON readings(session_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
        """)
        conn.commit()
        logger.info("数据库初始化完成")
    finally:
        conn.close()


# ==================== Session 操作 ====================

def create_session(
    name: str,
    birth_info: dict,
    zodiac: str,
    bazi_summary: str,
) -> str:
    """创建用户会话记录。

    Args:
        name: 用户姓名。
        birth_info: 出生信息字典（年/月/日/时/性别）。
        zodiac: 星座。
        bazi_summary: 八字摘要。

    Returns:
        会话 ID（UUID）。
    """
    session_id = str(uuid.uuid4())
    conn = _get_conn()
    try:
        conn.execute(
            """INSERT INTO sessions (id, name, birth_info, zodiac, bazi_summary)
               VALUES (?, ?, ?, ?, ?)""",
            (session_id, name, json.dumps(birth_info, ensure_ascii=False), zodiac, bazi_summary),
        )
        conn.commit()
        return session_id
    finally:
        conn.close()


def get_session(session_id: str) -> Optional[dict]:
    """根据 ID 获取用户会话。

    Args:
        session_id: 会话 ID。

    Returns:
        会话字典，不存在返回 None。
    """
    conn = _get_conn()
    try:
        row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        if row:
            result = dict(row)
            result["birth_info"] = json.loads(result.get("birth_info", "{}"))
            return result
        return None
    finally:
        conn.close()


# ==================== Reading 操作 ====================

def create_reading(
    session_id: str,
    spread_type: str,
    cards: list[dict],
    question: str,
    ai_reading: dict,
) -> str:
    """创建占卜记录。

    Args:
        session_id: 关联的会话 ID。
        spread_type: 牌阵类型。
        cards: 抽牌结果列表。
        question: 用户问题。
        ai_reading: AI 解读字典。

    Returns:
        记录 ID（UUID）。
    """
    reading_id = str(uuid.uuid4())
    conn = _get_conn()
    try:
        conn.execute(
            """INSERT INTO readings (id, session_id, spread_type, cards_json, question, ai_reading)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (
                reading_id,
                session_id,
                spread_type,
                json.dumps(cards, ensure_ascii=False),
                question,
                json.dumps(ai_reading, ensure_ascii=False),
            ),
        )
        conn.commit()
        return reading_id
    finally:
        conn.close()


def get_reading(reading_id: str) -> Optional[dict]:
    """根据 ID 获取占卜记录。

    Args:
        reading_id: 记录 ID。

    Returns:
        记录字典，不存在返回 None。
    """
    conn = _get_conn()
    try:
        row = conn.execute("SELECT * FROM readings WHERE id = ?", (reading_id,)).fetchone()
        if row:
            result = dict(row)
            result["cards_json"] = json.loads(result.get("cards_json", "[]"))
            result["ai_reading"] = json.loads(result.get("ai_reading", "{}"))
            return result
        return None
    finally:
        conn.close()


def get_readings_by_session(session_id: str) -> list[dict]:
    """获取某会话下的所有占卜记录。

    Args:
        session_id: 会话 ID。

    Returns:
        占卜记录列表。
    """
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT * FROM readings WHERE session_id = ? ORDER BY created_at DESC",
            (session_id,),
        ).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            r["cards_json"] = json.loads(r.get("cards_json", "[]"))
            r["ai_reading"] = json.loads(r.get("ai_reading", "{}"))
            results.append(r)
        return results
    finally:
        conn.close()


def get_recent_readings(limit: int = 20) -> list[dict]:
    """获取最近的占卜记录。

    Args:
        limit: 返回数量上限。

    Returns:
        占卜记录列表。
    """
    conn = _get_conn()
    try:
        rows = conn.execute(
            """SELECT r.*, s.name as user_name, s.zodiac as user_zodiac
               FROM readings r
               LEFT JOIN sessions s ON r.session_id = s.id
               ORDER BY r.created_at DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        results = []
        for row in rows:
            r = dict(row)
            r["cards_json"] = json.loads(r.get("cards_json", "[]"))
            r["ai_reading"] = json.loads(r.get("ai_reading", "{}"))
            results.append(r)
        return results
    finally:
        conn.close()
