/*
    * Logic manager for user support history — does NOT store data directly
    * All reads/writes to user_history.csv go through DataManager exclusively
    *
    * Responsibilities:
    *   - Add a new history entry (titleId, timestamp, voteStatus, tags) via DataManager
    *   - Query history entries by voteStatus (liked / disliked) for samplers
    *   - Remove or update an entry via DataManager
    *
    * Entry shape (passed to/from DataManager):
    *   titleId (String), timestamp (ISO-8601), voteStatus (String), tags (List<String>)
*/