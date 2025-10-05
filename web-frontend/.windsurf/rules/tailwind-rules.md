---
trigger: always_on
---

# Tailwind CSS Rules

## Core Principles

1. **Custom Utilities First**
   - Always use custom utility classes from `global.css` whenever possible
   - These utilities are designed to enforce consistency across the codebase

2. **Arbitrary Values**
   - When using arbitrary values, never include units unless explicitly required by Tailwind
   - Correct: `p-[20]`, `w-[50]`, `gap-[10]`
   - Incorrect: `p-[20px]`, `w-[50px]`, `gap-[10px]`

3. **Utility Categories**
   - Padding: `p-`, `px-`, `py-`, `pl-`, `pr-`, `pt-`, `pb-`
   - Margin: `m-`, `mx-`, `my-`, `ml-`, `mr-`, `mt-`, `mb-`
   - Gap: `gap-`, `gap-x-`, `gap-y-`
   - Inset: `inset-`, `inset-x-`, `inset-y-`, `top-`, `right-`, `bottom-`, `left-`
   - Dimensions: `w-`, `h-`, `min-w-`, `min-h-`, `max-w-`, `max-h-`
   - Flex & Grid: `flex-`, `grid-`
   - Typography: `text-`, `font-`, `leading-`, `tracking-`
   - Borders: `border-`, `rounded-`
   - Transforms: `translate-`, `rotate-`, `scale-`, `skew-`

## Best Practices

- Use custom utilities from `global.css` whenever possible
- When using arbitrary values, always omit units (e.g., use `p-[20]` instead of `p-[20px]`)
- Use descriptive class names that indicate purpose
- Avoid using arbitrary values when a standard Tailwind class exists
- For precise measurements not covered by standard classes, use the custom utility approach

## Examples

```tsx
// Correct
<div className="container mx-auto p-[20]">
  <div className="flex gap-[10]">
    <div className="w-[50] h-[50]">
      Content
    </div>
  </div>
</div>

// Incorrect
<div className="container mx-auto p-[20px]">
  <div className="flex gap-[10px]">
    <div className="w-[50px] h-[50px]">
      Content
    </div>
  </div>
</div>