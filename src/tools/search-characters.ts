import { bangumi } from "@/api/bangumi"
import { withAccessToken } from "@raycast/utils"
import { bangumiAuth } from "@/api/oauth"

type Input = {
  /**
   * The keyword to search for characters.
   */
  keyword: string

  /** Limit of items to return, default 10, max to 20 */
  limit?: number

  /** Offset, default 0 */
  offset?: number
}

const tool = async (input: Input) => {
  const result = await bangumi.searchCharacters(input.keyword, input.limit || 10, input.offset || 0)

  return result
}

export default withAccessToken(bangumiAuth)(tool)
