import { ActionPanel, Action, Grid, showToast, Toast, Icon } from "@raycast/api"
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

const EPISODE_COLLECTION_NAME: Record<EpisodeCollectionType, string> = {
  [EpisodeCollectionType.NotCollected]: "未看",
  [EpisodeCollectionType.Watched]: "已看",
  [EpisodeCollectionType.Wish]: "想看",
  [EpisodeCollectionType.Dropped]: "抛弃",
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

interface EpAppearance {
  bg: string
  color: string
  textDeco: string
}

const getEpisodeAppearance = (ep: Episode, collectionType: EpisodeCollectionType): EpAppearance => {
  if (collectionType === EpisodeCollectionType.Dropped) {
    return { bg: "#555555", color: "#FFFFFF", textDeco: "line-through" }
  }
  if (collectionType === EpisodeCollectionType.Watched) {
    return { bg: "#4997FF", color: "#FFFFFF", textDeco: "none" }
  }
  if (collectionType === EpisodeCollectionType.Wish) {
    return { bg: "#C7E2BD", color: "#3A7D22", textDeco: "none" }
  }

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const isToday = ep.airdate === todayStr

  if (isToday) {
    return { bg: "#C7E2BD", color: "#3A7D22", textDeco: "none" }
  }

  const isAired = ep.airdate ? ep.airdate <= todayStr : false

  if (isAired) {
    return { bg: "#DAEBFF", color: "#4997FF", textDeco: "none" }
  } else {
    return { bg: "#E0E0E0", color: "#666666", textDeco: "none" }
  }
}

const buildEpisodeIcon = (text: string, appearance: EpAppearance): string => {
  const { bg, color, textDeco } = appearance
  const lineStr =
    textDeco === "line-through" ? `<line x1="12" y1="32" x2="52" y2="32" stroke="${color}" stroke-width="2" />` : ""
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">`,
    `<rect x="0" y="0" width="64" height="64" rx="10" fill="${bg}"/>`,
    `<text x="32" y="32" text-anchor="middle" dominant-baseline="central" text-decoration="${textDeco}"`,
    `  font-family="system-ui,-apple-system,sans-serif" font-size="${text.length > 3 ? "13" : "22"}" font-weight="700" fill="${color}">`,
    `  ${text}`,
    `</text>`,
    lineStr,
    `</svg>`,
  ].join("")

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export default function ViewProgress({ subjectId, subjectName, subjectNameCn, epStatus, totalEps }: ViewProgressProps) {
  const { data, isLoading, mutate } = usePromise(() => bangumi.getUserSubjectEpisodeCollection(subjectId, {}), [])

  const handleUpdateStatus = async (episodeId: number, status: EpisodeCollectionType) => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Updating status..." })
    try {
      await mutate(bangumi.updateEpisodeCollection(episodeId, status), {
        optimisticUpdate: (currentData) => {
          if (!currentData) return currentData!
          return {
            ...currentData,
            data: currentData.data?.map((item) => (item.episode.id === episodeId ? { ...item, type: status } : item)),
          }
        },
      })
      toast.style = Toast.Style.Success
      toast.title = "Updated successfully"
    } catch (e) {
      toast.style = Toast.Style.Failure
      toast.title = "Failed to update"
      toast.message = String(e)
    }
  }

  const episodes = data?.data ?? []

  const title = subjectNameCn || subjectName
  const displayEpStatus = data
    ? episodes.filter((ep) => ep.episode.type === EpisodeType.Main && ep.type === EpisodeCollectionType.Watched).length
    : epStatus

  const percent = totalEps > 0 ? Math.round((displayEpStatus / totalEps) * 100) : 0

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
      navigationTitle={`${title} · ${displayEpStatus}/${totalEps} (${percent}%)`}
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
            content={{
              source: buildEpisodeIcon(epNum, getEpisodeAppearance(ep.episode, statusType)),
              tooltip: EPISODE_COLLECTION_NAME[statusType],
            }}
            title={epLabel}
            keywords={[epLabel, epTitle]}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  {statusType !== EpisodeCollectionType.Watched && (
                    <Action
                      title="Mark as 看过"
                      icon={Icon.Checkmark}
                      onAction={() => handleUpdateStatus(ep.episode.id, EpisodeCollectionType.Watched)}
                    />
                  )}
                  {statusType !== EpisodeCollectionType.Wish && (
                    <Action
                      title="Mark as 想看"
                      icon={Icon.Star}
                      onAction={() => handleUpdateStatus(ep.episode.id, EpisodeCollectionType.Wish)}
                    />
                  )}
                  {statusType !== EpisodeCollectionType.Dropped && (
                    <Action
                      title="Mark as 抛弃"
                      icon={Icon.Trash}
                      onAction={() => handleUpdateStatus(ep.episode.id, EpisodeCollectionType.Dropped)}
                    />
                  )}
                  {statusType !== EpisodeCollectionType.NotCollected && (
                    <Action
                      title="Reset to 未看"
                      icon={Icon.XMarkCircle}
                      onAction={() => handleUpdateStatus(ep.episode.id, EpisodeCollectionType.NotCollected)}
                    />
                  )}
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action.OpenInBrowser title="Open Episode in Browser" url={`https://bgm.tv/ep/${ep.episode.id}`} />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        )
      })}
    </Grid>
  )
}
