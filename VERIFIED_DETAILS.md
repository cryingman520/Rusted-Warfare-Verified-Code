# 1.15 非显式文档细节记录

## 1. `activeWaypointTarget` 不等于“正在攻击的单位”

**等级：VERIFIED / DOCUMENTED**

`activeWaypointTarget` 表示当前主动路径/行动所使用的目标引用。它覆盖的范围比单纯攻击目标更广：攻击、运输、维修等行动都可能成为当前 active waypoint target。

因此：

```ini
[hiddenAction_debugTarget]
# 仅示意：检查当前主动行动目标是否存在。
# 不应把 activeWaypointTarget 直接当成 attacking unit 使用。
autoTrigger: if self.activeWaypointTarget != nullUnit
```

### 实际含义

- `attacking` / 当前攻击目标是一个更窄的概念。
- `activeWaypointTarget` 更接近“单位当前这项主动行动正在朝向/处理的目标”。
- 一个单位处于维修行动时，active waypoint target 也可能指向被维修单位。
- 因此做“跟随/保护/维修”状态机时，应区分“目标引用”和“当前行动状态”。

---

## 2. `customTarget1` / `customTarget2` 可以保存单位引用

**等级：DOCUMENTED + 实际使用验证**

1.15 支持把单位引用保存到 `customTarget1` 和 `customTarget2`。这非常适合把“需要保护的单位”和“当前维修目标”从行动路径状态中分离出来。

```ini
[action_setProtectedTarget]
text: 设置保护目标
# 将执行该 action 时得到的目标保存到 customTarget1。
# customTarget1 是单位引用，不是字符串 ID。
setCustomTarget1: thisActionTarget

[action_clearProtectedTarget]
text: 清除保护目标
# 将引用恢复为空单位。
setCustomTarget1: nullUnit
```

### 为什么这点重要

不要依赖 `activeWaypointTarget` 长期保存保护对象。因为维修、攻击、运输等行动都会改变当前主动路径目标。

更稳定的设计是：

```text
customTarget1 = 逻辑上的保护对象
        ↓
根据 hp / shield 状态决定下一步行动
        ↓
activeWaypointTarget = 当前实际执行的行动目标
```

这也是我们此前战斗工程师实验中反复遇到“血满后跟随消失”“维修被重新设置/终止”的关键思路之一。

---

## 3. `customTarget1` 的默认值不能被当成永远为空

**等级：DOCUMENTED**

1.15 中 `customTarget1` 默认可能指向创建该单位的单位/建筑。因此如果一个单位需要使用 `customTarget1` 作为自己的逻辑内存，创建单位的关系必须考虑进去。

推荐在初始化逻辑中明确设置：

```ini
[hiddenAction_initTarget]
# 明确清空默认的创建者引用，避免它被误当成保护目标。
setCustomTarget1: nullUnit
```

只有在你的单位确实需要利用“创建者引用”时，才不要清空它。

---

## 4. `autoTrigger` 不应无脑每帧扫描昂贵查询

**等级：DOCUMENTED + 实战重要细节**

1.15 增加了 `autoTriggerCheckRate`，支持：

```ini
# 每帧检查（默认行为）
autoTriggerCheckRate: everyFrame

# 每 4 帧检查一次
autoTriggerCheckRate: every4Frames

# 每 8 帧检查一次
autoTriggerCheckRate: every8Frames
```

复杂的 `nearestUnit(...)`、全局搜索等查询不适合在大量单位上全部每帧执行。

对于普通状态机，可以优先考虑 `every4Frames`；需要非常及时反应的逻辑才使用 `everyFrame`。

---

## 5. 1.15 动态逻辑可以直接进行数学运算

**等级：DOCUMENTED**

例如可以直接写：

```ini
[hiddenAction_example]
# 1.15 动态逻辑允许直接进行数学表达式运算。
autoTrigger: if 2*self.energy + self.hp > 500
```

因此不要为了简单比较重新堆叠大量旧式函数调用。

---

## 6. 护盾维修目前的结论

**等级：INFERRED / EXPERIMENTAL，尚未稳定 VERIFIED**

此前战斗工程师实验得到几个非常重要的否定结论：

1. **不能**因为 `hp` 已满就让维修状态机直接结束，否则会出现“血满、盾不满，但工程师停止维修”。
2. “维修目标存在”与“当前维修行动仍然有效”是两个不同状态。
3. 如果逻辑每次检测到某个状态就重新发起/切换行动，很容易把正在进行的维修强制终止并重新设置。
4. “保护目标路径点”与“维修行动”不能简单共用一个状态变量，否则一个状态覆盖另一个状态时会出现跟随消失。
5. 目前尚未把某一种最终护盾修复实现标记为 VERIFIED；后续必须以实际 1.15 游戏测试结果为准。

这部分专门保留在仓库中，是为了记录失败实验带来的有效信息，而不是制造一个看似正确但实际不能运行的模板。
