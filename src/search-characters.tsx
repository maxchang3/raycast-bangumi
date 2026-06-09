import { Action, ActionPanel, Icon, LaunchProps, Grid } from "@raycast/api"
import { usePromise, withAccessToken } from "@raycast/utils"
import { useRef, useState } from "react"
import { bangumi, InfoboxItem } from "@/api/bangumi"
import { bangumiAuth } from "@/api/oauth"
import { OpenInBgmBrowser } from "@/components/actions"
import CharacterDetail from "@/components/CharacterDetail"

// Max to 20
const PAGE_SIZE = 20

const SearchCharacters = (props: LaunchProps<{ arguments: Arguments.SearchCharacters }>) => {
  const [searchText, setSearchText] = useState(props.arguments.keyword || "")
  const abortable = useRef<AbortController>(null)

  const { data, isLoading, pagination } = usePromise(
    (text: string) => async (options: { page: number }) => {
      if (!text) {
        return { data: [], hasMore: false }
      }
      const baseOffset = options.page * PAGE_SIZE * 2
      const [res1, res2] = await Promise.all([
        bangumi.searchCharacters(text, PAGE_SIZE, baseOffset, abortable.current?.signal),
        bangumi.searchCharacters(text, PAGE_SIZE, baseOffset + PAGE_SIZE, abortable.current?.signal),
      ])
      return {
        data: [...res1.data, ...res2.data],
        hasMore: baseOffset + PAGE_SIZE * 2 < res1.total,
      }
    },
    [searchText],
    { abortable }
  )

  return (
    <Grid
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search characters by keyword..."
      throttle
      columns={8}
      pagination={pagination}
    >
      {searchText === "" ? (
        <Grid.EmptyView icon={Icon.MagnifyingGlass} title="Type something to search Characters" />
      ) : (
        data?.map((character) => {
          const infobox = character.infobox as InfoboxItem[] | undefined
          const nameCnItem = infobox?.find((box) => box.key === "简体中文名")
          const nameCn = nameCnItem && typeof nameCnItem.value === "string" ? nameCnItem.value : ""

          const titleName = nameCn || character.name
          const subtitleName = character.name !== titleName ? character.name : ""

          return (
            <Grid.Item
              key={character.id}
              title={titleName || "Unknown"}
              subtitle={subtitleName}
              content={character.images?.grid || Icon.Person}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Show Details"
                    icon={Icon.Sidebar}
                    target={<CharacterDetail characterId={character.id} />}
                  />
                  <OpenInBgmBrowser path={`character/${character.id}`} />
                </ActionPanel>
              }
            />
          )
        })
      )}
    </Grid>
  )
}

export default withAccessToken(bangumiAuth)(SearchCharacters)
