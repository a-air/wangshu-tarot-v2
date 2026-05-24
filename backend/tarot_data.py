"""望舒塔罗 v2 — 78张塔罗牌数据

从前端 cards.js 迁移，包含大阿卡纳22张 + 小阿卡纳56张。
"""

from typing import Optional


# ==================== 大阿卡纳 22张 ====================

MAJOR_ARCANA: list[dict] = [
    {
        "id": 0, "name": "愚人", "en": "The Fool", "type": "major",
        "up": "新的开始、纯真、自由、冒险",
        "rev": "犹豫不决、鲁莽、缺乏计划",
        "love": "一段新鲜缘分的开始，别想太多，跟着感觉走",
        "career": "换个方向试试看，不要怕从头开始",
        "wealth": "可能有意外的小收获",
    },
    {
        "id": 1, "name": "魔术师", "en": "The Magician", "type": "major",
        "up": "创造力、行动力、掌控局面",
        "rev": "计划不周、才能没发挥出来",
        "love": "主动一点会赢，你的魅力正在线",
        "career": "现在是你发光的时候，资源都在你手上",
        "wealth": "能把想法变成钱",
    },
    {
        "id": 2, "name": "女祭司", "en": "The High Priestess", "type": "major",
        "up": "直觉、等待、内在智慧",
        "rev": "秘密、与直觉失联",
        "love": "有些事还不到揭晓的时候，耐心等等",
        "career": "相信直觉，先观察再行动",
        "wealth": "隐藏的机会，别急着出手",
    },
    {
        "id": 3, "name": "女皇", "en": "The Empress", "type": "major",
        "up": "丰盛、滋养、创造力",
        "rev": "创造力卡住了、太依赖别人",
        "love": "感情甜蜜期，适合表达爱意",
        "career": "创意爆发，艺术类工作特别顺",
        "wealth": "财运不错，享受生活的同时也有收获",
    },
    {
        "id": 4, "name": "皇帝", "en": "The Emperor", "type": "major",
        "up": "权威、秩序、领导力",
        "rev": "控制欲太强、僵化",
        "love": "稳定可靠的关系，但别太强势",
        "career": "升职掌权的好时机",
        "wealth": "财务结构稳定，适合做规划",
    },
    {
        "id": 5, "name": "教皇", "en": "The Hierophant", "type": "major",
        "up": "传统、导师、精神指引",
        "rev": "打破常规、挑战权威",
        "love": "可能会得到长辈认可的关系",
        "career": "找前辈请教，按规矩来能成",
        "wealth": "保守理财比较合适",
    },
    {
        "id": 6, "name": "恋人", "en": "The Lovers", "type": "major",
        "up": "真爱、和谐、重要选择",
        "rev": "关系不和谐、选择困难",
        "love": "命中注定的缘分来了，但要你真心选",
        "career": "面临重要的岔路口",
        "wealth": "合伙或联名的事有利",
    },
    {
        "id": 7, "name": "战车", "en": "The Chariot", "type": "major",
        "up": "胜利、决心、勇往直前",
        "rev": "失控、方向不对",
        "love": "主动追求能成功",
        "career": "全力冲刺的时候到了",
        "wealth": "果断出手能赚到",
    },
    {
        "id": 8, "name": "力量", "en": "Strength", "type": "major",
        "up": "内在力量、温柔驯服",
        "rev": "自我怀疑、软弱",
        "love": "用温柔化解矛盾，别硬来",
        "career": "以柔克刚比硬碰硬管用",
        "wealth": "克制冲动消费",
    },
    {
        "id": 9, "name": "隐者", "en": "The Hermit", "type": "major",
        "up": "独处、内省、智慧",
        "rev": "孤独、逃避",
        "love": "需要一个人静一静想清楚",
        "career": "埋头钻研的时候，别急",
        "wealth": "谨慎理财，不宜大动作",
    },
    {
        "id": 10, "name": "命运之轮", "en": "Wheel of Fortune", "type": "major",
        "up": "转折、好运、时机到了",
        "rev": "倒霉期、抗拒改变",
        "love": "命运的转折带来新缘分",
        "career": "好运在转动，抓住机会",
        "wealth": "财运在变好，等着",
    },
    {
        "id": 11, "name": "正义", "en": "Justice", "type": "major",
        "up": "公平、因果、真相",
        "rev": "不公平、逃避责任",
        "love": "付出多少得到多少，公平得很",
        "career": "合同签约有利，法律事务顺利",
        "wealth": "收支会平衡",
    },
    {
        "id": 12, "name": "倒吊人", "en": "The Hanged Man", "type": "major",
        "up": "换角度看、牺牲、等待",
        "rev": "拖延、白白等待",
        "love": "为爱等待是值得的",
        "career": "换个角度会发现新路",
        "wealth": "暂时牺牲换长远回报",
    },
    {
        "id": 13, "name": "死神", "en": "Death", "type": "major",
        "up": "结束、重生、蜕变",
        "rev": "抗拒改变、停滞",
        "love": "旧的不去新的不来",
        "career": "必须放下旧模式才有出路",
        "wealth": "旧的财务方式要改了",
    },
    {
        "id": 14, "name": "节制", "en": "Temperance", "type": "major",
        "up": "平衡、调和、耐心",
        "rev": "失衡、走极端",
        "love": "需要双方慢慢磨合",
        "career": "工作生活要找平衡",
        "wealth": "稳健规划，不贪不急",
    },
    {
        "id": 15, "name": "恶魔", "en": "The Devil", "type": "major",
        "up": "束缚、执念、物质欲望",
        "rev": "挣脱、觉醒",
        "love": "小心不健康的依赖关系",
        "career": "你是不是被钱或工作绑架了？",
        "wealth": "对钱的执念要审视",
    },
    {
        "id": 16, "name": "高塔", "en": "The Tower", "type": "major",
        "up": "剧变、崩塌、真相",
        "rev": "逃避改变",
        "love": "真相可能突然炸出来",
        "career": "旧体系崩塌是重建的机会",
        "wealth": "意外的财务冲击，也是重新开始",
    },
    {
        "id": 17, "name": "星星", "en": "The Star", "type": "major",
        "up": "希望、疗愈、灵感",
        "rev": "绝望、失去信心",
        "love": "伤会好的，新的希望在等你",
        "career": "灵感爆棚，做创意特别棒",
        "wealth": "财务状况在好转",
    },
    {
        "id": 18, "name": "月亮", "en": "The Moon", "type": "major",
        "up": "迷惑、恐惧、看不清",
        "rev": "真相浮出",
        "love": "感情里有些事情你还没看清",
        "career": "信息不全别做重大决定",
        "wealth": "有隐藏风险，小心点",
    },
    {
        "id": 19, "name": "太阳", "en": "The Sun", "type": "major",
        "up": "成功、快乐、温暖、最好的牌",
        "rev": "暂时阴霾、太乐观",
        "love": "感情阳光灿烂！",
        "career": "如日中天，成果被认可",
        "wealth": "财运最好的时候",
    },
    {
        "id": 20, "name": "审判", "en": "Judgement", "type": "major",
        "up": "觉醒、召唤、清算",
        "rev": "自我怀疑、拒绝面对",
        "love": "旧情复燃还是彻底翻篇？",
        "career": "重要的评估和跃升机会",
        "wealth": "过去的投资该收网了",
    },
    {
        "id": 21, "name": "世界", "en": "The World", "type": "major",
        "up": "圆满、完成、大成",
        "rev": "未完成、差一点",
        "love": "感情修成正果",
        "career": "重要里程碑达成",
        "wealth": "财务目标实现",
    },
]


# ==================== 小阿卡纳 ====================

SUITS: list[str] = ["权杖", "圣杯", "宝剑", "星币"]
RANKS: list[str] = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "侍从", "骑士", "皇后", "国王"]

# 花色主题含义
SUIT_THEMES: dict[str, dict[str, str]] = {
    "权杖": {
        "kw": "行动、热情、事业",
        "love": "主动表达你的热情",
        "career": "行动力就是答案",
        "wealth": "积极进取",
    },
    "圣杯": {
        "kw": "情感、直觉、关系",
        "love": "用心感受对方的心意",
        "career": "跟着内心的热情走",
        "wealth": "心灵满足比钱重要",
    },
    "宝剑": {
        "kw": "智慧、抉择、沟通",
        "love": "理性沟通解决问题",
        "career": "清晰思考再做决定",
        "wealth": "理性规划",
    },
    "星币": {
        "kw": "物质、稳定、积累",
        "love": "踏实的承诺比甜言蜜语重要",
        "career": "专注技能提升",
        "wealth": "慢慢积累会看到回报",
    },
}

# 数字牌位阶含义
RANK_MEANINGS: dict[str, dict[str, str]] = {
    "一": {"up": "新的开始", "rev": "机会溜走"},
    "二": {"up": "需要选择", "rev": "犹豫"},
    "三": {"up": "初步成果", "rev": "进展慢"},
    "四": {"up": "稳固一下", "rev": "太死板"},
    "五": {"up": "有竞争", "rev": "冲突"},
    "六": {"up": "恢复平衡", "rev": "失衡"},
    "七": {"up": "坚持住", "rev": "想放弃"},
    "八": {"up": "加速前进", "rev": "别急"},
    "九": {"up": "快到了", "rev": "还差一点"},
    "十": {"up": "圆满", "rev": "负担"},
    "侍从": {"up": "新消息", "rev": "坏消息"},
    "骑士": {"up": "冲！", "rev": "太冲动"},
    "皇后": {"up": "成熟稳重", "rev": "没安全感"},
    "国王": {"up": "掌控全局", "rev": "管太多"},
}

# 小阿卡纳英文翻译
SUIT_EN: dict[str, str] = {
    "权杖": "Wands",
    "圣杯": "Cups",
    "宝剑": "Swords",
    "星币": "Pentacles",
}

RANK_EN: dict[str, str] = {
    "一": "Ace", "二": "Two", "三": "Three", "四": "Four",
    "五": "Five", "六": "Six", "七": "Seven", "八": "Eight",
    "九": "Nine", "十": "Ten",
    "侍从": "Page", "骑士": "Knight", "皇后": "Queen", "国王": "King",
}


def _build_minor_arcana() -> list[dict]:
    """构建56张小阿卡纳牌数据。

    Returns:
        包含56张小阿卡纳牌的列表，每张牌含 id/name/en/type/suit/rank/up/rev/love/career/wealth 字段。
    """
    deck: list[dict] = []
    card_id: int = 22  # 从22开始，接在大阿卡纳后面

    for suit in SUITS:
        st = SUIT_THEMES[suit]
        for rank in RANKS:
            rm = RANK_MEANINGS[rank]
            en_name = f"{RANK_EN[rank]} of {SUIT_EN[suit]}"
            deck.append({
                "id": card_id,
                "name": f"{suit}{rank}",
                "en": en_name,
                "type": "minor",
                "suit": suit,
                "rank": rank,
                "up": f"{st['kw']} · {rm['up']}",
                "rev": rm["rev"],
                "love": st["love"],
                "career": st["career"],
                "wealth": st["wealth"],
            })
            card_id += 1

    return deck


MINOR_ARCANA: list[dict] = _build_minor_arcana()

# 完整78张牌
FULL_DECK: list[dict] = MAJOR_ARCANA + MINOR_ARCANA


def get_card_by_id(card_id: int) -> Optional[dict]:
    """根据ID获取牌数据。

    Args:
        card_id: 牌的ID（0-77）。

    Returns:
        牌数据字典，未找到返回 None。
    """
    if 0 <= card_id < len(FULL_DECK):
        return FULL_DECK[card_id]
    return None


def get_card_by_name(name: str) -> Optional[dict]:
    """根据中文名获取牌数据。

    Args:
        name: 牌的中文名，如"愚人"、"权杖一"。

    Returns:
        牌数据字典，未找到返回 None。
    """
    for card in FULL_DECK:
        if card["name"] == name:
            return card
    return None
