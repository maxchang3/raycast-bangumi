import { Action, ActionPanel, Detail, Icon } from "@raycast/api"
import { usePromise, withAccessToken } from "@raycast/utils"
import { useRef } from "react"
import { bangumi } from "@/bangumi"
import { bangumiAuth } from "@/oauth"

interface SubjectDetailProps {
  subjectId: number
}

const SubjectDetail = ({ subjectId }: SubjectDetailProps) => {
  const abortable = useRef<AbortController>(null)
  const { data, isLoading } = usePromise(
    async (id) => {
      return bangumi.getSubjectById(id, abortable.current?.signal)
    },
    [subjectId],
    { abortable }
  )

  const coverUrl = data?.images?.large
  const markdown = data
    ? `
${coverUrl ? `<img src="${coverUrl}" width="120%" />` : ""}

# ${data.name_cn || data.name}${
        data.name_cn && data.name && data.name !== data.name_cn ? `\n<sup>${data.name}</sup>` : ""
      }


${data.summary || "No summary available."}
`
    : ""

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      metadata={
        data ? (
          <Detail.Metadata>
            <Detail.Metadata.Label
              title="Rating（评分）"
              text={data.rating.score ? `${data.rating.score.toFixed(1)} / 10` : "N/A"}
              icon={Icon.Star}
            />
            {data.rating.rank && (
              <Detail.Metadata.Label title="Rank（排名）" text={`#${data.rating.rank}`} icon={Icon.Trophy} />
            )}
            {data.date && <Detail.Metadata.Label title="Air Date（放送开始）" text={data.date} icon={Icon.Calendar} />}
            <Detail.Metadata.Label
              title="Episodes（话数）"
              text={data.eps ? data.eps.toString() : data.total_episodes ? data.total_episodes.toString() : "N/A"}
              icon={Icon.List}
            />
            {data.tags && data.tags.length > 0 && (
              <Detail.Metadata.TagList title="Tags（标签）">
                {data.tags.slice(0, 5).map((tag) => (
                  <Detail.Metadata.TagList.Item key={tag.name} text={tag.name} />
                ))}
              </Detail.Metadata.TagList>
            )}
            <Detail.Metadata.Separator />
            <Detail.Metadata.Label title="Doing（在看）" text={data.collection.doing.toString()} icon={Icon.Play} />
            <Detail.Metadata.Label title="Wish（想看）" text={data.collection.wish.toString()} icon={Icon.Heart} />
            <Detail.Metadata.Label
              title="Collected（已看）"
              text={data.collection.collect.toString()}
              icon={Icon.Check}
            />
          </Detail.Metadata>
        ) : null
      }
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={`https://bgm.tv/subject/${subjectId}`} />
        </ActionPanel>
      }
    />
  )
}

export default withAccessToken(bangumiAuth)(SubjectDetail)
