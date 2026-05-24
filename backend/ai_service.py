"""望舒塔罗 v2 — DashScope AI 解读服务

使用阿里云 DashScope API（Qwen 模型）生成塔罗解读。
风格：温暖口语化的"望舒姐姐"，结合八字+塔罗+心理学。

当 DashScope 不可用时，自动 fallback 到模板解读。
"""

import json
import logging
from typing import Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)

# ==================== AI Prompt 模板 ====================

SYSTEM_PROMPT = """你是"望舒姐姐"，一位温暖、智慧、有亲和力的塔罗占卜师。

你的解读风格：
1. 温暖口语化，像在跟朋友聊天，不用生硬的占卜术语
2. 善于结合八字命理、塔罗象征、心理学视角给出多维度洞察
3. 既有玄学的神秘感，又有心理学的温度
4. 给人希望和方向，但不说空话，具体到可行动的建议
5. 偶尔用"亲爱的"等亲昵称呼，但不过度
6. 解读要有画面感，让用户能在脑海中看到场景

输出格式要求（严格 JSON）：
{
  "card_readings": [
    {
      "card_name": "牌名",
      "position": "位置含义",
      "orientation": "正位/逆位",
      "reading": "该牌在该位置的温暖解读（150-250字）"
    }
  ],
  "synthesis": "综合解读（300-500字），结合所有牌的关系和整体脉络给出深度洞察"
}
"""

USER_PROMPT_TEMPLATE = """请为以下占卜做解读：

## 求问者信息
- 姓名：{name}
- 星座：{zodiac}
- 八字：{bazi_summary}
- 日主：{day_master}，强弱：{strength}
- 喜用：{favorable}
- 问题：「{question}」

## 牌阵类型
{spread_name}

## 抽牌结果
{cards_detail}

请结合求问者的八字命理特点和星座特质，从塔罗象征、命理格局、心理洞察三个维度，
给出温暖而深刻的解读。注意：
1. 每张牌的解读要结合其位置含义
2. 综合解读要串联所有牌，看到整体脉络
3. 如果有逆位牌，要特别点出逆位带来的提醒
4. 结合八字强弱和喜用给出行动建议
5. 最后给一句望舒姐姐的暖心寄语
"""


def _build_cards_detail(cards: list[dict], spread_type: str) -> str:
    """构建抽牌结果的文本描述。

    Args:
        cards: 抽牌结果列表，每项含 id/name/orientation/position。
        spread_type: 牌阵类型。

    Returns:
        格式化的牌面详情文本。
    """
    position_labels = _get_position_labels(spread_type)
    lines: list[str] = []

    for card in cards:
        name = card.get("name", "未知")
        orient = "正位" if card.get("orientation", "up") == "up" else "逆位"
        pos = card.get("position", 0)
        pos_label = position_labels[pos] if pos < len(position_labels) else f"位置{pos+1}"
        lines.append(f"- 第{pos+1}张 [{pos_label}]：{name}（{orient}）")

    return "\n".join(lines)


def _get_position_labels(spread_type: str) -> list[str]:
    """获取牌阵位置标签。

    Args:
        spread_type: 牌阵类型 "single"/"three"/"celtic"。

    Returns:
        位置标签列表。
    """
    if spread_type == "single":
        return ["指引"]
    elif spread_type == "three":
        return ["过去", "现在", "未来"]
    elif spread_type == "celtic":
        return [
            "现状", "挑战", "过去", "未来", "理想", "近未来",
            "自我", "环境", "希望/恐惧", "最终结果",
        ]
    return ["位置"]


def _build_bazi_summary(bazi: dict) -> str:
    """构建八字摘要文本。

    Args:
        bazi: 八字排盘结果字典。

    Returns:
        八字摘要，如"庚辰年 辛巳月 甲午日 己巳时"。
    """
    return (
        f"{bazi.get('year_pillar', '??')}年 "
        f"{bazi.get('month_pillar', '??')}月 "
        f"{bazi.get('day_pillar', '??')}日 "
        f"{bazi.get('hour_pillar', '??')}时"
    )


async def _call_dashscope(prompt: str) -> Optional[str]:
    """调用 DashScope API 获取 AI 解读。

    Args:
        prompt: 用户消息 prompt。

    Returns:
        AI 返回的文本，失败返回 None。
    """
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.DASHSCOPE_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.DASHSCOPE_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.DASHSCOPE_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.85,
                    "max_tokens": 3000,
                    "result_format": "message",
                },
            )
            response.raise_for_status()
            data = response.json()

            # 兼容 OpenAI 格式和 DashScope 原生格式
            choices = data.get("choices", [])
            if choices:
                message = choices[0].get("message", {})
                return message.get("content", "")

            # DashScope 原生格式
            output = data.get("output", {})
            return output.get("text", "")

    except httpx.TimeoutException:
        logger.warning("DashScope API 请求超时")
        return None
    except httpx.HTTPStatusError as e:
        logger.error(f"DashScope API HTTP 错误: {e.response.status_code}")
        return None
    except Exception as e:
        logger.error(f"DashScope API 调用异常: {e}")
        return None


def _parse_ai_response(ai_text: str) -> Optional[dict]:
    """解析 AI 返回的 JSON 解读。

    AI 可能返回包含 JSON 的文本，需要提取出 JSON 部分。

    Args:
        ai_text: AI 返回的原始文本。

    Returns:
        解析后的字典，失败返回 None。
    """
    if not ai_text:
        return None

    # 尝试直接解析
    try:
        return json.loads(ai_text)
    except json.JSONDecodeError:
        pass

    # 尝试从文本中提取 JSON 块
    import re
    json_match = re.search(r'```json\s*(.*?)\s*```', ai_text, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # 尝试提取花括号内容
    brace_match = re.search(r'\{.*\}', ai_text, re.DOTALL)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except json.JSONDecodeError:
            pass

    return None


def _generate_fallback_reading(
    cards: list[dict], spread_type: str, question: str,
    zodiac: str, bazi: dict,
) -> dict:
    """生成 fallback 模板解读（DashScope 不可用时）。

    Args:
        cards: 抽牌结果。
        spread_type: 牌阵类型。
        question: 用户问题。
        zodiac: 星座。
        bazi: 八字结果。

    Returns:
        模板解读字典。
    """
    from tarot_data import get_card_by_id

    position_labels = _get_position_labels(spread_type)
    card_readings: list[dict] = []

    for card_item in cards:
        card_id = card_item.get("id", 0)
        card_data = get_card_by_id(card_id) or {}
        name = card_data.get("name", card_item.get("name", "未知"))
        orient = card_item.get("orientation", "up")
        orient_label = "正位" if orient == "up" else "逆位"
        pos = card_item.get("position", 0)
        pos_label = position_labels[pos] if pos < len(position_labels) else f"位置{pos+1}"

        meaning = card_data.get("up", "") if orient == "up" else card_data.get("rev", "")
        love = card_data.get("love", "")
        career = card_data.get("career", "")

        reading = (
            f"亲爱的，{pos_label}出现了「{name}」{orient_label}。"
            f"这张牌告诉我们：{meaning}。"
        )
        if question:
            if "感情" in question or "爱" in question:
                reading += f"在感情方面，{love}。"
            elif "工作" in question or "事业" in question:
                reading += f"在事业方面，{career}。"
        reading += "请相信牌面的指引，用心感受它传递的信息。"

        card_readings.append({
            "card_name": name,
            "position": pos_label,
            "orientation": orient_label,
            "reading": reading,
        })

    # 综合解读
    card_names = "、".join(cr["card_name"] for cr in card_readings)
    strength = bazi.get("strength", "中和")
    favorable = bazi.get("favorable", "未知")

    synthesis = (
        f"亲爱的{zodiac}朋友，这次占卜抽到了{card_names}。"
        f"从整体来看，这些牌揭示了你当前最需要关注的能量方向。"
    )
    if question:
        synthesis += f"关于你问的「{question}」，牌面给出的答案是——相信自己的直觉，"
    synthesis += (
        f"从你的八字来看，日主{strength}，喜用{favorable}，"
        f"建议多接触与{favorable}相关的事物来增强运势。"
        f"记住，牌面只是指引，真正的力量在你自己手中。🌙"
    )

    return {
        "card_readings": card_readings,
        "synthesis": synthesis,
    }


async def generate_reading(
    name: str,
    question: str,
    spread_type: str,
    cards: list[dict],
    zodiac: str,
    bazi: dict,
) -> dict:
    """生成 AI 塔罗解读（含 fallback）。

    优先调用 DashScope API，失败时自动回退到模板解读。

    Args:
        name: 用户姓名。
        question: 用户问题。
        spread_type: 牌阵类型。
        cards: 抽牌结果列表。
        zodiac: 星座名。
        bazi: 八字排盘结果。

    Returns:
        解读字典，含 card_readings 和 synthesis。
    """
    spread_names = {
        "single": "单张指引",
        "three": "三牌阵·过去现在未来",
        "celtic": "凯尔特十字·十牌全盘",
    }
    spread_name = spread_names.get(spread_type, spread_type)

    # 构建 prompt
    cards_detail = _build_cards_detail(cards, spread_type)
    bazi_summary = _build_bazi_summary(bazi)

    prompt = USER_PROMPT_TEMPLATE.format(
        name=name or "朋友",
        zodiac=zodiac,
        bazi_summary=bazi_summary,
        day_master=bazi.get("day_master", "未知"),
        strength=bazi.get("strength", "中和"),
        favorable=bazi.get("favorable", "未知"),
        question=question or "综合运势",
        spread_name=spread_name,
        cards_detail=cards_detail,
    )

    # 调用 AI
    ai_text = await _call_dashscope(prompt)

    if ai_text:
        parsed = _parse_ai_response(ai_text)
        if parsed and "card_readings" in parsed and "synthesis" in parsed:
            logger.info("AI 解读生成成功")
            return parsed
        else:
            logger.warning("AI 返回格式异常，使用 fallback")

    # Fallback
    logger.info("使用模板解读（fallback）")
    return _generate_fallback_reading(cards, spread_type, question, zodiac, bazi)
