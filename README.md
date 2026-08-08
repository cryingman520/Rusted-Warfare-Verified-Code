# Rusted Warfare Verified Code

> 《铁锈战争》1.15 Modding 实测记录库

本仓库用于保存 **Rusted Warfare 1.15** 单位 `.ini` / 动态逻辑代码中，官方文档没有充分说明、但经过实际测试或源码/现有资料交叉验证后值得记录的细节。

## 证据等级

- **VERIFIED**：我们在实际 Mod 测试中确认可工作的行为。
- **DOCUMENTED**：官方/版本参考中明确存在，但这里补充了实际使用时容易踩坑的细节。
- **INFERRED**：根据实测现象推断，尚未作为独立机制完全验证。
- **EXPERIMENTAL**：代码结构已整理，但还不能宣称稳定可用。

## 当前重点

1. `activeWaypointTarget` 与单位当前主动路径目标之间的关系。
2. `customTarget1/customTarget2` 作为单位引用变量保存目标。
3. 维修/跟随/攻击等行动都可能影响当前 `activeWaypointTarget`，因此不能把“有目标引用”简单等同于“单位正在跟随目标”。
4. `autoTrigger` 的检查频率会影响复杂逻辑的性能；1.15 支持 `everyFrame`、`every4Frames`、`every8Frames`。
5. 1.15 动态逻辑可以直接进行数值比较和数学运算，因此很多状态判断不需要旧式函数写法。

## 重要说明

本库不会把“看起来合理”的代码标成已验证。尤其是 **护盾修复**：我们之前的战斗工程师实验已经证明普通生命维修逻辑与护盾维修之间存在实际的状态/行动切换问题，但在没有得到稳定的最终测试结果前，本库不会把失败方案包装成成功方案。

## 目录

```text
README.md
VERIFIED_DETAILS.md
examples/
  target-memory.ini
  repair-state-gate.experimental.ini
```

## 参考

- Rusted Warfare 1.15 Unit Modding Reference
- Rusted Warfare 1.15 版本动态逻辑/Action 变化
- NaomiUGR 的 Rusted Warfare Graphics Repository（其中包含 1.15 Modding Reference 与大量单位资源）
