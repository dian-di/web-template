# button

2026-09-09 — transformation engine（components.json 为 legacy 样式 `new-york`，注册表无 `base-new-york`，按规则不做 golden-pair replay，直接改造用户自己的文件、class 字符串逐字节保留）。结论：迁移完成，typecheck 与 build 均通过。

## Changed

- `src/components/ui/button.tsx`
  - 第 1-2 行：`import { Slot } from "@radix-ui/react-slot"` + `import * as React` → `import { Button as ButtonPrimitive } from "@base-ui/react/button"`（真实 Button 原语，非手写 useRender 包装）。
  - 第 37-50 行：组件签名 `React.ComponentProps<"button"> & VariantProps & { asChild?: boolean }` → `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`；删除 `asChild` 分支与 `const Comp = asChild ? Slot : "button"`，直接渲染 `<ButtonPrimitive>`。
  - `buttonVariants` 的 cva 基串与全部 variant/size 字符串**逐字节未动**（对比过 new-york 与 new-york-v4 两个官方 golden：该文件等价于 new-york-v4 stock + `shadow-xs` 微调，样式归用户所有，不重排）。
  - 残留扫描干净：`grep -n "radix-ui|@radix-ui|Slot|asChild"` 在该文件返回 0 条。
- `package.json` — dependencies 新增 `@base-ui/react: ^1.8.0`；devDependencies 移除 `@radix-ui/react-slot`。
- `pnpm-lock.yaml` — 重新生成；importers 段确认 `@base-ui/react 1.8.0`，全文 0 处 radix。

## Left alone

- `src/pages/home/index.tsx` — 唯一消费者，只传 `onClick` + `className`，无 `asChild`、无受影响 prop，零改动。
- `src/components/tab-bar.tsx` — 与 radix 无关（纯 Tailwind 手写组件），未触碰。
- 项目无 cmdk/vaul/sonner/input-otp/react-day-picker/recharts 包装（skill 硬规则的不动名单在此项目为空集）。

## Behavior changes

- **`asChild` prop 从 wrapper 公开 API 中移除**，替换为 Base UI 原生 `render` prop：`<Button asChild><a/></Button>` → `<Button render={<a/>}>`。当前无任何调用方使用，零破坏；未来若用 `render` 渲染非 `<button>` 元素，需同时传 `nativeButton={false}`，否则开发环境会收到 Base UI 的 console 警告。
- 新增能力（非破坏）：`focusableWhenDisabled`、`nativeButton` 两个 Base UI Button 专有 prop 现在可用。
- 渲染为原生 `<button>`（默认路径）时行为与迁移前一致：disabled 处理、焦点、键盘激活均由 Base UI `useButton` 接管，等价于原生语义。

## Verify by hand

1. 打开 `/`（home 页），点击计数按钮 —— `onClick` 正常触发、计数递增。
2. Tab 聚焦按钮 → 出现 `focus-visible:ring-[3px]` 焦点环；Space/Enter 均能激活。
3. 检查 DOM：button 元素带 `data-slot="button"`，class 合并顺序正常（`text-red-500` 覆盖生效，tailwind-merge 语义不变）。
4. （未来用到多态时）`<Button render={<a href="/x"/>}>链接</Button>` 样式正常合并；渲染非 button 元素时加 `nativeButton={false}` 消除开发警告。
