import { useCallback } from 'react'
import useSWRImmutable from 'swr/immutable'

export const useSuspicion = () => {
  const { data: suspicion, mutate } = useSWRImmutable<number>(
    `suspicion`,
    () => 0,
  )

  const setSuspicion = useCallback(
    (amount: number) => {
      mutate(
        (s) => {
          const newValue = (s ?? 0) + amount
          return Math.max(newValue, 0)
        },
        { revalidate: false },
      )
    },
    [mutate],
  )

  return { suspicion: suspicion ?? 0, setSuspicion }
}
