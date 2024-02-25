export enum ErrorCode {
      follow_self,
      max_friends,
      follow_failed,
      unfollow_failed,
      block_add_failed,
      block_delete_failed,
      block_already,
      block_self,
      max_blocks,
      user_unfound,
      user_find_failed,
      user_save_failed,
      user_delete_failed,
      token_failed,
      board_delete_failed,
      board_update_failed,
      board_update_bad_request,
      board_insert_failed,
      board_find_failed,
      comment_find_failed,
      comment_insert_failed,
      comment_update_failed,
      comment_update_bad_request,
      comment_delete_failed,
      hashtag_failed,
      user_hashtag_failed,
      url_find_failed,
      follow_find_failed,
      follow_recommend_find_failed,
      api_failed,
      refreshToken_create_failed,
      verify_token_failed
}

export enum BOARD_CATEGORY {
      myBoards,
      myUpBoards,
      urlBoards,
      feed,
      searchBoards,
      userBoards
}