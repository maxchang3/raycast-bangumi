import { ActionPanel, List, Action, Icon, Color, getPreferenceValues, showToast, Toast } from "@raycast/api"
import { usePromise } from "@raycast/utils"
import { useRef } from "react"
import { bangumi, SubjectCollectionType, SubjectType, SubjectVerb } from "@/bangumi"
import ViewProgress from "./ViewProgress"
import SubjectDetail from "./SubjectDetail"

const preferences = getPreferenceValues<Preferences>()

const enabledTypes = new Set<SubjectType>(
  [
    preferences.showBook && SubjectType.Book,
    preferences.showAnime && SubjectType.Anime,
    preferences.showMusic && SubjectType.Music,
    preferences.showGame && SubjectType.Game,
    preferences.showReal && SubjectType.Real,
  ].filter(Boolean) as SubjectType[]
)

const PAGE_SIZE = 20

type CollectionTag = {
  value: string
  color: Color.ColorLike
}

const SubjectCollectionColor: Record<SubjectCollectionType, Color.ColorLike> = {
  [SubjectCollectionType.Wish]: Color.Blue,
  [SubjectCollectionType.Collect]: Color.SecondaryText,
  [SubjectCollectionType.Doing]: Color.Green,
  [SubjectCollectionType.OnHold]: "#8E9DAE",
  [SubjectCollectionType.Dropped]: "#B87A7A",
}

const getCollectionTag = (collectionType: SubjectCollectionType, subjectType: SubjectType): CollectionTag => {
  const verb = SubjectVerb[subjectType]
  const color = SubjectCollectionColor[collectionType]

  switch (collectionType) {
    case SubjectCollectionType.Wish:
      return { value: `想${verb}`, color }
    case SubjectCollectionType.Collect:
      return { value: `${verb}过`, color }
    case SubjectCollectionType.Doing:
      return { value: `在${verb}`, color }
    case SubjectCollectionType.OnHold:
      return { value: "搁置", color }
    case SubjectCollectionType.Dropped:
      return { value: "抛弃", color }
    default:
      return { value: "未知", color }
  }
}

interface CollectionListProps {
  filterType?: SubjectCollectionType
}

export default function CollectionList({ filterType }: CollectionListProps) {
  const abortControllerRef = useRef<AbortController>(null)

  const { data, isLoading, pagination, mutate } = usePromise(
    () => async (options: { page: number }) => {
      const offset = options.page * PAGE_SIZE
      const { data, total } = await bangumi.getMyCollections(
        { limit: PAGE_SIZE, offset, type: filterType },
        abortControllerRef.current?.signal
      )
      return {
        data,
        hasMore: offset + PAGE_SIZE < total,
      }
    },
    [],
    { abortable: abortControllerRef }
  )

  const handleUpdateStatus = async (subjectId: number, status: SubjectCollectionType) => {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Updating status..." })
    try {
      await mutate(bangumi.updateSubjectCollection(subjectId, status), {
        optimisticUpdate: (currentData) => {
          if (!currentData) return currentData!
          return currentData.map((item) => (item.subject_id === subjectId ? { ...item, type: status } : item))
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

  const safePagination = pagination
    ? {
        ...pagination,
        onLoadMore: () => {
          if (!pagination.hasMore) return
          pagination.onLoadMore()
        },
      }
    : undefined

  return (
    <List isLoading={isLoading} pagination={safePagination}>
      {data
        ?.filter((item) => enabledTypes.has(item.subject_type))
        .map((item) => (
          <List.Item
            key={item.subject_id}
            icon={item.subject?.images.common || Icon.Bird}
            title={item.subject?.name_cn || item.subject?.name || `Subject ${item.subject_id}`}
            subtitle={item.subject?.name_cn ? item.subject?.name || "" : ""}
            accessories={[{ tag: getCollectionTag(item.type, item.subject_type) }]}
            actions={
              <ActionPanel title={`${item.subject?.name_cn || item.subject?.name}`}>
                <ActionPanel.Section>
                  {item.subject_type === SubjectType.Anime && (
                    <Action.Push
                      title="View Progress"
                      icon={Icon.BarChart}
                      target={
                        <ViewProgress
                          subjectId={item.subject_id}
                          subjectName={item.subject?.name}
                          subjectNameCn={item.subject?.name_cn}
                          epStatus={item.ep_status}
                          totalEps={item.subject?.eps || 0}
                        />
                      }
                    />
                  )}
                  <Action.Push
                    title="Show Details"
                    icon={Icon.Sidebar}
                    target={<SubjectDetail subjectId={item.subject_id} />}
                  />
                  <Action.OpenInBrowser
                    url={`https://bgm.tv/subject/${item.subject_id}`}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                  />
                </ActionPanel.Section>
                <ActionPanel.Section title="Change Status">
                  {[
                    SubjectCollectionType.Wish,
                    SubjectCollectionType.Doing,
                    SubjectCollectionType.Collect,
                    SubjectCollectionType.OnHold,
                    SubjectCollectionType.Dropped,
                  ].map((statusType) => {
                    if (statusType === item.type) return null
                    return (
                      <Action
                        key={statusType}
                        title={`Mark as ${getCollectionTag(statusType, item.subject_type).value}`}
                        icon={Icon.Pencil}
                        onAction={() => handleUpdateStatus(item.subject_id, statusType)}
                      />
                    )
                  })}
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))}
    </List>
  )
}
