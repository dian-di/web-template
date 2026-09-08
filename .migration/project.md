# project

2026-09-09 — 全项目 radix → Base UI 迁移（whole-project 模式）。结论：完成，**0 个 wrapper 残留在 Radix 上**；最终 `pnpm build`（tsc -b + vite build）零错误。

## 范围与策略

- `components.json` style 为 `new-york`（legacy 无前缀样式）。注册表探测：`base-new-york` 返回 404，确认无 base 对应物 → 按规则走 transformation engine，不 replay、不改样式。
- 分类时发现：官方 `new-york` golden 是旧版（forwardRef 时代），而项目里的 button.tsx 实为 **new-york-v4 世代** + `shadow-xs` 微调（current shadcn CLI 写 style: "new-york" 但产出 v4 组件）。分类必须两个 golden 都比对，否则会把 pristine 误判成重度定制。
- 项目只有一个 radix wrapper：`src/components/ui/button.tsx`（经 `@radix-ui/react-slot`）。

## 依赖交换

| 操作 | 项 |
|---|---|
| + dependencies | `@base-ui/react ^1.8.0` |
| − devDependencies | `@radix-ui/react-slot ^1.3.3` |
| 锁文件 | `pnpm-lock.yaml` 重新生成并核对（pnpm 12.3.4，由 pnpm-lock.yaml 判定包管理器） |

## 应用代码清扫

- 全 src/ 扫描 `asChild` 及 consumer-props 清单（accordion/tabs/select/tooltip 等全部 token）：零命中。唯一消费者 `src/pages/home/index.tsx` 只用 `onClick`/`className`。

## 环境事故（已恢复，需知晓）

1. `pnpm add @base-ui/react` 首次失败（`ERR_PNPM_PACKAGE_MANAGER_REMOVE_MODULES_DIR`，os error 5），并**删除了半个 node_modules**。恢复路径：清空 node_modules → `pnpm install`（在最后一个 graceful-fs 软链上报错，但依赖树实际完整）→ 用 `pnpm install --lockfile-only` 单独修锁文件。tsc 与 vite build 双验证通过。
2. `node_modules/@radix-ui/react-slot` 目录仍是残留（本次 install 未走完整 prune 路径）。无害——源码已无引用；下次成功执行 `pnpm install` 会自动清掉。
3. **迁移前仓库没有任何 commit**（main 为 unborn 分支）。已在 `migrate/base-ui` 分支补两个 commit：① 全量基线（迁移前状态）② 本次迁移。main 仍无历史，需要的话 `git branch -f main migrate/base-ui` 或在 main 上 fast-forward。

## 样式标记（待决策，未改动）

`components.json` 仍写 `"style": "new-york"`。shadcn CLI 没有 base-new-york，因此**未来 `shadcn add <新组件>` 会继续投递 radix 变体**，每次都需要手工再迁。选项：(a) 接受，逐个手迁；(b) 切到 base-* 样式（会整体换肤，本项目样式会变）；(c) 维持现状。未替用户决定。

## 最终构建

- `pnpm build`：通过，0 错误。产物 `index.js 276.22 kB (gzip 89.17)` vs 迁移前基线 `271.71 kB (gzip 87.55)`（+4.5 kB raw / +1.6 kB gzip，Base UI Button 原语的代价，正常）。
- 各阶段校验：wrapper 迁移后 tsc 通过 → 消费者扫描零改动 → 依赖摘除后全量 build 通过。

**0 wrappers remain on Radix.**
