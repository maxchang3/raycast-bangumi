import { ActionPanel, Action, Grid } from "@raycast/api"
import { usePromise } from "@raycast/utils"
import { useState } from "react"
import { bangumi, EpisodeCollectionType, EpisodeType } from "@/bangumi"
import type { components } from "@/types/generated"

interface ViewProgressProps {
  subjectId: number
  subjectName?: string
  subjectNameCn?: string
  epStatus: number
  totalEps: number
}

const EPISODE_COLLECTION_COLOR: Record<EpisodeCollectionType, string> = {
  [EpisodeCollectionType.NotCollected]: "#8E8E93",
  [EpisodeCollectionType.Watched]: "#34C759",
  [EpisodeCollectionType.Wish]: "#007AFF",
  [EpisodeCollectionType.Dropped]: "#FF3B30",
}

const EP_TYPE_PREFIX: Record<number, string> = {
  [EpisodeType.Main]: "EP",
  [EpisodeType.SP]: "SP",
  [EpisodeType.OP]: "OP",
  [EpisodeType.ED]: "ED",
  [EpisodeType.Trailer]: "PV",
  [EpisodeType.MAD]: "MAD",
  [EpisodeType.Other]: "Other",
}

type Episode = components["schemas"]["Episode"]

const getEpisodeLabel = (ep: Episode) => `${EP_TYPE_PREFIX[ep.type] ?? "EP"}.${ep.sort}`

const buildEpisodeIcon = (text: string, type: EpisodeCollectionType): string => {
  const colorHex = EPISODE_COLLECTION_COLOR[type]
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">`,
    `<rect x="0" y="0" width="64" height="64" rx="10" fill="${colorHex}"/>`,
    `<text x="32" y="32" text-anchor="middle" dominant-baseline="central"`,
    `  font-family="system-ui,-apple-system,sans-serif" font-size="${text.length > 3 ? "13" : "22"}" font-weight="700" fill="white">`,
    `  ${text}`,
    `</text>`,
    `</svg>`,
  ].join("")

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export default function ViewProgress({ subjectId, subjectName, subjectNameCn, epStatus, totalEps }: ViewProgressProps) {
  const { data, isLoading } = usePromise(() => bangumi.getUserSubjectEpisodeCollection(subjectId, {}), [])

  const episodes = data?.data ?? []

  const title = subjectNameCn || subjectName
  const percent = totalEps > 0 ? Math.round((epStatus / totalEps) * 100) : 0

  const sortedEps = [...episodes].sort((a, b) => {
    if (a.episode.type !== b.episode.type) {
      return a.episode.type - b.episode.type
    }
    return (a.episode.sort ?? 0) - (b.episode.sort ?? 0)
  })

  const [selectedId, setSelectedId] = useState<string>()

  const selectedEp = selectedId ? sortedEps.find((ep) => String(ep.episode.id) === selectedId) : undefined

  const currentEp = selectedEp ?? sortedEps[0]
  const searchPlaceholder = currentEp
    ? `${getEpisodeLabel(currentEp.episode)} — ${currentEp.episode.name_cn || currentEp.episode.name}`
    : "Loading…"

  return (
    <Grid
      isLoading={isLoading}
      navigationTitle={`${title} · ${epStatus}/${totalEps} (${percent}%)`}
      columns={8}
      onSelectionChange={(id) => setSelectedId(id ?? undefined)}
      searchBarPlaceholder={searchPlaceholder}
    >
      {sortedEps.map((ep) => {
        const epTitle = ep.episode.name_cn || ep.episode.name || ""
        const epLabel = getEpisodeLabel(ep.episode)
        const epNum = String(ep.episode.sort)
        const statusType = ep.type
        return (
          <Grid.Item
            id={String(ep.episode.id)}
            key={ep.episode.id}
            content={{ source: buildEpisodeIcon(epNum, statusType) }}
            title={epLabel}
            keywords={[epLabel, epTitle]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open Episode" url={`https://bgm.tv/ep/${ep.episode.id}`} />
              </ActionPanel>
            }
          />
        )
      })}
    </Grid>
  )
}
