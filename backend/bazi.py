"""望舒塔罗 v2 — 八字排盘核心计算

实现实用简化版的八字排盘：
- 年柱：以立春为界（约2月4日）
- 月柱：以节气为界
- 日柱：基于蔡勒公式 + 已知基准日推算
- 时柱：五鼠遁时干口诀
- 五行分析：统计各五行数量
- 日主强弱与喜用神初步推断

注意：完整八字排盘需要农历转换，此处用公历近似，适合娱乐场景。
"""

from datetime import date
from typing import Optional

# ==================== 基础数据 ====================

# 天干
TIAN_GAN: list[str] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]

# 地支
DI_ZHI: list[str] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

# 天干五行映射
GAN_WUXING: dict[str, str] = {
    "甲": "木", "乙": "木",
    "丙": "火", "丁": "火",
    "戊": "土", "己": "土",
    "庚": "金", "辛": "金",
    "壬": "水", "癸": "水",
}

# 地支五行映射
ZHI_WUXING: dict[str, str] = {
    "子": "水", "丑": "土",
    "寅": "木", "卯": "木",
    "辰": "土", "巳": "火",
    "午": "火", "未": "土",
    "申": "金", "酉": "金",
    "戌": "土", "亥": "水",
}

# 地支生肖
ZHI_SHENGXIAO: dict[str, str] = {
    "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔",
    "辰": "龙", "巳": "蛇", "午": "马", "未": "羊",
    "申": "猴", "酉": "鸡", "戌": "狗", "亥": "猪",
}

# 时辰与小时对应（地支序号 -> 小时范围）
SHICHEN_MAP: dict[int, tuple[int, int]] = {
    0: (23, 1),    # 子时 23:00-01:00
    1: (1, 3),     # 丑时 01:00-03:00
    2: (3, 5),     # 寅时 03:00-05:00
    3: (5, 7),     # 卯时 05:00-07:00
    4: (7, 9),     # 辰时 07:00-09:00
    5: (9, 11),    # 巳时 09:00-11:00
    6: (11, 13),   # 午时 11:00-13:00
    7: (13, 15),   # 未时 13:00-15:00
    8: (15, 17),   # 申时 15:00-17:00
    9: (17, 19),   # 酉时 17:00-19:00
    10: (19, 21),  # 戌时 19:00-21:00
    11: (21, 23),  # 亥时 21:00-23:00
}

# 五虎遁月干口诀：年干 -> 寅月(正月)天干起始索引
# 甲己之年丙作首 -> 甲/己年，寅月天干从丙开始
WU_HU_DUN: dict[int, int] = {
    0: 2,   # 甲 -> 丙
    1: 4,   # 乙 -> 戊
    2: 6,   # 丙 -> 庚
    3: 8,   # 丁 -> 壬
    4: 0,   # 戊 -> 甲
    5: 2,   # 己 -> 丙
    6: 4,   # 庚 -> 戊
    7: 6,   # 辛 -> 庚
    8: 8,   # 壬 -> 壬
    9: 0,   # 癸 -> 甲
}

# 五鼠遁时干口诀：日干 -> 子时天干起始索引
# 甲己还加甲 -> 甲/己日，子时天干从甲开始
WU_SHU_DUN: dict[int, int] = {
    0: 0,   # 甲 -> 甲
    1: 2,   # 乙 -> 丙
    2: 4,   # 丙 -> 戊
    3: 6,   # 丁 -> 庚
    4: 8,   # 戊 -> 壬
    5: 0,   # 己 -> 甲
    6: 2,   # 庚 -> 丙
    7: 4,   # 辛 -> 戊
    8: 6,   # 壬 -> 庚
    9: 8,   # 癸 -> 壬
}

# 月份对应的节气分界日（公历近似值，用于月柱计算）
# 每月的地支固定：正月寅、二月卯、三月辰...
# 对应公历月份：2月、3月、4月...
MONTH_JIEQI: list[dict] = [
    {"month": 2, "day": 4},    # 立春 -> 寅月（正月）
    {"month": 3, "day": 6},    # 惊蛰 -> 卯月（二月）
    {"month": 4, "day": 5},    # 清明 -> 辰月（三月）
    {"month": 5, "day": 6},    # 立夏 -> 巳月（四月）
    {"month": 6, "day": 6},    # 芒种 -> 午月（五月）
    {"month": 7, "day": 7},    # 小暑 -> 未月（六月）
    {"month": 8, "day": 8},    # 立秋 -> 申月（七月）
    {"month": 9, "day": 8},    # 白露 -> 酉月（八月）
    {"month": 10, "day": 8},   # 寒露 -> 戌月（九月）
    {"month": 11, "day": 7},   # 立冬 -> 亥月（十月）
    {"month": 12, "day": 7},   # 大雪 -> 子月（十一月）
    {"month": 1, "day": 6},    # 小寒 -> 丑月（十二月）
]

# 五行生克关系
WUXING_SHENG: dict[str, str] = {
    "木": "火", "火": "土", "土": "金", "金": "水", "水": "木",
}
WUXING_KE: dict[str, str] = {
    "木": "土", "火": "金", "土": "水", "金": "木", "水": "火",
}


# ==================== 日柱计算 ====================

# 基准日：2000年1月1日 = 庚辰年丙子月甲子日（干支序号：日干=0甲，日支=0子）
# 实际基准：1900年1月1日为甲戌日（干=0甲，支=10戌）
# 使用更可靠的基准：2000年1月7日 = 甲子日
# 计算公式：以已知基准日推算任意日的干支

# 已知基准：2000年1月7日 = 甲子日（天干索引0，地支索引0）
_BASE_DATE = date(2000, 1, 7)
_BASE_GAN_IDX = 0  # 甲
_BASE_ZHI_IDX = 0  # 子


def _date_to_day_ganzhi(target_date: date) -> tuple[int, int]:
    """计算公历日期对应的日干支索引。

    基于已知基准日（2000-01-07 = 甲子日）推算，
    60甲子循环，天干10循环，地支12循环。

    Args:
        target_date: 目标公历日期。

    Returns:
        (天干索引, 地支索引) 元组。
    """
    delta = (target_date - _BASE_DATE).days
    gan_idx = (_BASE_GAN_IDX + delta) % 10
    zhi_idx = (_BASE_ZHI_IDX + delta) % 12
    return gan_idx, zhi_idx


# ==================== 年柱计算 ====================

def _get_year_ganzhi(year: int, month: int, day: int) -> tuple[int, int]:
    """计算年柱天干地支索引。

    以立春（约2月4日）为界：立春前仍属上一年。

    Args:
        year: 公历年份。
        month: 公历月份（1-12）。
        day: 公历日期。

    Returns:
        (天干索引, 地支索引) 元组。
    """
    # 判断是否在立春之前
    lichun_day = 4  # 立春近似日
    if month < 2 or (month == 2 and day < lichun_day):
        year -= 1

    # 年干：(年份 - 4) % 10，因为公元4年 = 甲子年
    gan_idx = (year - 4) % 10
    # 年支：(年份 - 4) % 12
    zhi_idx = (year - 4) % 12
    return gan_idx, zhi_idx


# ==================== 月柱计算 ====================

def _get_lunar_month(month: int, day: int) -> int:
    """根据公历月日推算农历月份（节气分界）。

    Args:
        month: 公历月份（1-12）。
        day: 公历日期。

    Returns:
        农历月份（1-12），1=正月。
    """
    # 从后往前查找当前处于哪个节气月
    for i in range(len(MONTH_JIEQI) - 1, -1, -1):
        jq = MONTH_JIEQI[i]
        if month > jq["month"] or (month == jq["month"] and day >= jq["day"]):
            # 第i个节气月对应农历(i+1)月
            lunar_month = i + 1
            # 但MONTH_JIEQI的最后一个是小寒(1月6日)对应丑月(十二月)
            # 需要特殊处理跨年
            if lunar_month == 12 and month == 1:
                lunar_month = 12
            return lunar_month
    # 如果1月6日之前，属于上一年的丑月
    return 12


def _get_month_ganzhi(year_gan_idx: int, month: int, day: int) -> tuple[int, int]:
    """计算月柱天干地支索引。

    使用五虎遁口诀推算月干。

    Args:
        year_gan_idx: 年柱天干索引。
        month: 公历月份。
        day: 公历日期。

    Returns:
        (天干索引, 地支索引) 元组。
    """
    lunar_month = _get_lunar_month(month, day)

    # 月支固定：正月寅(2)，二月卯(3)... 十二月子(0)需要取模
    zhi_idx = (lunar_month + 1) % 12  # 正月=寅(2)

    # 月干：五虎遁
    # 寅月天干起始 = WU_HU_DUN[year_gan_idx]
    # 然后每个月+1
    yin_gan = WU_HU_DUN[year_gan_idx]
    gan_idx = (yin_gan + lunar_month - 1) % 10  # 正月=yin_gan，二月=yin_gan+1...

    return gan_idx, zhi_idx


# ==================== 时柱计算 ====================

def _hour_to_zhi(hour: int) -> int:
    """将小时转换为地支索引。

    Args:
        hour: 24小时制的小时（0-23）。

    Returns:
        地支索引（0=子，1=丑...）。
    """
    if hour == 23 or hour == 0:
        return 0  # 子时
    return (hour + 1) // 2


def _get_hour_ganzhi(day_gan_idx: int, hour: int) -> tuple[int, int]:
    """计算时柱天干地支索引。

    使用五鼠遁口诀推算时干。

    Args:
        day_gan_idx: 日柱天干索引。
        hour: 24小时制的小时（0-23），None时默认取子时。

    Returns:
        (天干索引, 地支索引) 元组。
    """
    zhi_idx = _hour_to_zhi(hour)

    # 时干：五鼠遁
    zi_gan = WU_SHU_DUN[day_gan_idx]
    gan_idx = (zi_gan + zhi_idx) % 10

    return gan_idx, zhi_idx


# ==================== 五行分析 ====================

def _analyze_five_elements(
    year_gan: str, year_zhi: str,
    month_gan: str, month_zhi: str,
    day_gan: str, day_zhi: str,
    hour_gan: str, hour_zhi: str,
) -> dict[str, int]:
    """统计八字四柱的五行数量。

    Args:
        year_gan/year_zhi: 年柱天干/地支。
        month_gan/month_zhi: 月柱天干/地支。
        day_gan/day_zhi: 日柱天干/地支。
        hour_gan/hour_zhi: 时柱天干/地支。

    Returns:
        五行计数字典 {"金": n, "木": n, "水": n, "火": n, "土": n}。
    """
    counts: dict[str, int] = {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0}

    elements = [
        GAN_WUXING.get(year_gan, ""), ZHI_WUXING.get(year_zhi, ""),
        GAN_WUXING.get(month_gan, ""), ZHI_WUXING.get(month_zhi, ""),
        GAN_WUXING.get(day_gan, ""), ZHI_WUXING.get(day_zhi, ""),
        GAN_WUXING.get(hour_gan, ""), ZHI_WUXING.get(hour_zhi, ""),
    ]

    for e in elements:
        if e in counts:
            counts[e] += 1

    return counts


def _judge_strength(day_gan: str, five_elements: dict[str, int], month_zhi: str) -> str:
    """判断日主强弱。

    简化版判断逻辑：
    1. 日主五行是否得令（月支是否生扶日主）
    2. 五行数量中同类（生我、助我）vs 异类（克我、泄我、耗我）

    Args:
        day_gan: 日主天干。
        five_elements: 五行计数。
        month_zhi: 月支。

    Returns:
        强弱描述："极强"/"偏强"/"中和"/"偏弱"/"极弱"。
    """
    day_wx = GAN_WUXING[day_gan]
    month_wx = ZHI_WUXING[month_zhi]

    # 同类五行：与日主相同 + 生日主的五行
    # 异类五行：克日主 + 日主所生 + 日主所克
    sheng_wo = None  # 生我的五行
    for wx, target in WUXING_SHENG.items():
        if target == day_wx:
            sheng_wo = wx
            break

    tonglei = five_elements.get(day_wx, 0) + five_elements.get(sheng_wo, 0) if sheng_wo else five_elements.get(day_wx, 0)
    yilei = 8 - tonglei  # 总共8个元素

    # 得令判断：月支五行是否生扶日主
    demling = month_wx == day_wx or month_wx == sheng_wo

    # 综合判断
    score = tonglei - yilei
    if demling:
        score += 1
    else:
        score -= 1

    if score >= 4:
        return "极强"
    elif score >= 2:
        return "偏强"
    elif score >= -1:
        return "中和"
    elif score >= -3:
        return "偏弱"
    else:
        return "极弱"


def _get_favorable(day_gan: str, strength: str) -> str:
    """根据日主强弱推断喜用神。

    强则克泄耗（克我、我生、我克），弱则生助（生我、助我）。

    Args:
        day_gan: 日主天干。
        strength: 强弱描述。

    Returns:
        喜用神五行描述，如"水、木"。
    """
    day_wx = GAN_WUXING[day_gan]

    # 生我的五行
    sheng_wo = None
    for wx, target in WUXING_SHENG.items():
        if target == day_wx:
            sheng_wo = wx
            break

    if strength in ("极强", "偏强"):
        # 强则喜克泄耗：克我、我生、我克
        ke_wo = WUXING_KE.get(day_wx, "")  # 注意：这里应该是"什么克我"
        # 反向查找：谁的克值指向day_wx
        ke_wo_wx = ""
        for wx, target in WUXING_KE.items():
            if target == day_wx:
                ke_wo_wx = wx
                break
        wo_sheng = WUXING_SHENG.get(day_wx, "")  # 我生
        wo_ke = WUXING_KE.get(day_wx, "")  # 我克
        favors = [x for x in [ke_wo_wx, wo_sheng, wo_ke] if x]
        return "、".join(favors[:2])
    else:
        # 弱则喜生助：生我、助我（同类）
        favors = [sheng_wo, day_wx] if sheng_wo else [day_wx]
        return "、".join(favors)


# ==================== 主入口 ====================

def calculate_bazi(
    year: int, month: int, day: int,
    hour: Optional[int] = None, gender: Optional[str] = None,
) -> dict:
    """八字排盘主函数。

    根据公历出生日期计算八字四柱，并分析五行、日主强弱、喜用神。

    Args:
        year: 公历年份，如2000。
        month: 公历月份，1-12。
        day: 公历日期，1-31。
        hour: 出生时辰（24小时制），None时默认子时。
        gender: 性别 "male"/"female"，暂未使用。

    Returns:
        八字排盘结果字典，包含四柱、五行、强弱、喜用神等。
    """
    # 确保日期有效
    try:
        target_date = date(year, month, day)
    except ValueError:
        return {
            "year_pillar": "未知", "month_pillar": "未知",
            "day_pillar": "未知", "hour_pillar": "未知",
            "day_master": "未知",
            "five_elements": {"金": 0, "木": 0, "水": 0, "火": 0, "土": 0},
            "strength": "未知", "favorable": "未知",
        }

    # 默认时辰
    if hour is None:
        hour = 0

    # 年柱
    y_gan_idx, y_zhi_idx = _get_year_ganzhi(year, month, day)
    year_gan = TIAN_GAN[y_gan_idx]
    year_zhi = DI_ZHI[y_zhi_idx]
    year_pillar = f"{year_gan}{year_zhi}"

    # 月柱
    m_gan_idx, m_zhi_idx = _get_month_ganzhi(y_gan_idx, month, day)
    month_gan = TIAN_GAN[m_gan_idx]
    month_zhi = DI_ZHI[m_zhi_idx]
    month_pillar = f"{month_gan}{month_zhi}"

    # 日柱
    d_gan_idx, d_zhi_idx = _date_to_day_ganzhi(target_date)
    day_gan = TIAN_GAN[d_gan_idx]
    day_zhi = DI_ZHI[d_zhi_idx]
    day_pillar = f"{day_gan}{day_zhi}"

    # 时柱
    h_gan_idx, h_zhi_idx = _get_hour_ganzhi(d_gan_idx, hour)
    hour_gan = TIAN_GAN[h_gan_idx]
    hour_zhi = DI_ZHI[h_zhi_idx]
    hour_pillar = f"{hour_gan}{hour_zhi}"

    # 五行分析
    five_elements = _analyze_five_elements(
        year_gan, year_zhi, month_gan, month_zhi,
        day_gan, day_zhi, hour_gan, hour_zhi,
    )

    # 日主强弱
    strength = _judge_strength(day_gan, five_elements, month_zhi)

    # 喜用神
    favorable = _get_favorable(day_gan, strength)

    # 日主描述
    day_master = f"{day_gan}{GAN_WUXING[day_gan]}"

    return {
        "year_pillar": year_pillar,
        "month_pillar": month_pillar,
        "day_pillar": day_pillar,
        "hour_pillar": hour_pillar,
        "day_master": day_master,
        "five_elements": five_elements,
        "strength": strength,
        "favorable": favorable,
    }


# ==================== 星座计算 ====================

# 星座数据：(月, 日, 星座名, 元素, 守护星)
ZODIAC_DATA: list[tuple[int, int, str, str, str]] = [
    (1, 20, "水瓶座", "风", "天王星"),
    (2, 19, "双鱼座", "水", "海王星"),
    (3, 21, "白羊座", "火", "火星"),
    (4, 20, "金牛座", "土", "金星"),
    (5, 21, "双子座", "风", "水星"),
    (6, 22, "巨蟹座", "水", "月亮"),
    (7, 23, "狮子座", "火", "太阳"),
    (8, 23, "处女座", "土", "水星"),
    (9, 23, "天秤座", "风", "金星"),
    (10, 24, "天蝎座", "水", "冥王星"),
    (11, 23, "射手座", "火", "木星"),
    (12, 22, "摩羯座", "土", "土星"),
]


def get_zodiac(month: int, day: int) -> dict:
    """根据月日计算星座（修正前端bug）。

    前端 bug：当月份=1且日<20时，循环中没有匹配项，
    最终返回默认值'摩羯座'是正确的，但中间月份的边界逻辑有问题。
    这里重写为正确版本。

    Args:
        month: 月份（1-12）。
        day: 日期（1-31）。

    Returns:
        {"zodiac": "星座名", "element": "元素", "ruling_planet": "守护星"}。
    """
    if not month or not day:
        return {"zodiac": "未知", "element": "未知", "ruling_planet": "未知"}

    # 从后往前匹配，找到最后一个满足条件的星座
    result = ZODIAC_DATA[0]  # 默认水瓶座（1月20日之后）
    for m, d, name, element, planet in ZODIAC_DATA:
        if month > m or (month == m and day >= d):
            result = (m, d, name, element, planet)

    # 特殊处理：12月22日之后是摩羯座，1月1-19日也是摩羯座
    if month == 12 and day >= 22:
        return {"zodiac": "摩羯座", "element": "土", "ruling_planet": "土星"}
    if month == 1 and day < 20:
        return {"zodiac": "摩羯座", "element": "土", "ruling_planet": "土星"}

    return {"zodiac": result[2], "element": result[3], "ruling_planet": result[4]}
