import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../Select'
import { Badge } from '../Badge'
import { CheckIcon } from '@/lib/icons'

export interface ModelOption {
  value: string
  /** Display name. */
  name: string
  /** Group heading in the list, e.g. "Reasoning". */
  group?: string
  /** Second line in the list only. */
  description?: string
  /** Short hint shown in the list and next to the trigger, e.g. "128K". */
  badge?: string
}

export interface ModelSelectorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Select>, 'children'> {
  models: ModelOption[]
  placeholder?: string
  className?: string
}

type ModelGroup = { label?: string; items: ModelOption[] }

function groupModels(models: ModelOption[]): ModelGroup[] {
  return models.reduce<ModelGroup[]>((groups, model) => {
    const group = groups.find((candidate) => candidate.label === model.group)
    if (group) group.items.push(model)
    else groups.push({ label: model.group, items: [model] })
    return groups
  }, [])
}

/**
 * A `SelectItem` renders every child inside `ItemText`, which Radix clones into
 * the trigger — so the description would leak into the closed state. This item
 * keeps only the name in `ItemText`.
 */
function ModelSelectorItem({ model }: { model: ModelOption }) {
  return (
    <SelectPrimitive.Item
      value={model.value}
      className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SelectPrimitive.ItemText>{model.name}</SelectPrimitive.ItemText>
        {model.description && (
          <span className="text-xs text-muted-foreground">
            {model.description}
          </span>
        )}
      </span>

      {model.badge && (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {model.badge}
        </span>
      )}
    </SelectPrimitive.Item>
  )
}

/**
 * Model picker for a chat toolbar: grouped models, one-line descriptions and a
 * capability hint on the trigger.
 */
const ModelSelector = React.forwardRef<HTMLButtonElement, ModelSelectorProps>(
  (
    {
      className,
      models,
      placeholder = 'Select a model',
      value,
      defaultValue,
      onValueChange,
      ...props
    },
    ref
  ) => {
    // Mirrors the value so the trigger's badge also works uncontrolled.
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const currentValue = value ?? internalValue
    const currentModel = models.find((model) => model.value === currentValue)
    const groups = React.useMemo(() => groupModels(models), [models])

    return (
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          setInternalValue(next)
          onValueChange?.(next)
        }}
        {...props}
      >
        <SelectTrigger ref={ref} aria-label="Model" className={cn('gap-2', className)}>
          <span className="flex min-w-0 items-center gap-2">
            <SelectValue placeholder={placeholder} />
            {currentModel?.badge && (
              <Badge variant="secondary" className="shrink-0">
                {currentModel.badge}
              </Badge>
            )}
          </span>
        </SelectTrigger>

        <SelectContent>
          {groups.map((group) => (
            <SelectGroup key={group.label ?? 'models'}>
              {group.label && <SelectLabel>{group.label}</SelectLabel>}
              {group.items.map((model) => (
                <ModelSelectorItem key={model.value} model={model} />
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    )
  }
)
ModelSelector.displayName = 'ModelSelector'

export { ModelSelector }
