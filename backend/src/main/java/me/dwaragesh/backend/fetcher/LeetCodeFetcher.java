package me.dwaragesh.backend.fetcher;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.fetcher.dto.BadgeData;
import me.dwaragesh.backend.fetcher.dto.ContestData;
import me.dwaragesh.backend.fetcher.dto.ContributionData;
import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.fetcher.dto.ProblemStatsData;
import me.dwaragesh.backend.model.enums.Platform;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fetches LeetCode data using the public LeetCode GraphQL endpoint.
 * No authentication required for public profiles.
 */
@Component
public class LeetCodeFetcher implements PlatformFetcher {

    private static final String GRAPHQL_URL = "https://leetcode.com/graphql";

    // Keep the query minimal — only fields that are reliably available on public profiles
    private static final String QUERY = """
        query userProfile($username: String!) {
          matchedUser(username: $username) {
            submissionCalendar
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            badges {
              displayName
              icon
              creationDate
            }
          }
          userContestRankingHistory(username: $username) {
            contest {
              title
              startTime
            }
            rating
          }
        }
        """;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LeetCodeFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Platform platform() {
        return Platform.LEETCODE;
    }

    @Override
    public PlatformSyncResult fetch(String externalUsername) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // LeetCode needs these headers to accept requests from non-browser clients
            headers.set("Referer", "https://leetcode.com");
            headers.set("User-Agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");
            headers.set("Origin", "https://leetcode.com");

            // Variables as a plain Map so Jackson serialises the field name correctly
            Map<String, Object> variables = Map.of("username", externalUsername);
            Map<String, Object> requestBody = Map.of("query", QUERY, "variables", variables);
            String body = objectMapper.writeValueAsString(requestBody);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GRAPHQL_URL, entity, String.class);

            if (response.getBody() == null) {
                throw new PlatformFetchException("LeetCode returned empty response for: " + externalUsername, null);
            }

            JsonNode root = objectMapper.readTree(response.getBody());

            // Surface any GraphQL errors before proceeding
            if (root.has("errors") && !root.path("errors").isEmpty()) {
                String errorMsg = root.path("errors").get(0).path("message").asText("Unknown GraphQL error");
                throw new PlatformFetchException("LeetCode GraphQL error for " + externalUsername + ": " + errorMsg, null);
            }

            JsonNode matchedUser = root.path("data").path("matchedUser");

            if (matchedUser.isMissingNode() || matchedUser.isNull()) {
                throw new PlatformFetchException("LeetCode user not found: " + externalUsername, null);
            }

            // --- Contributions ---
            Map<LocalDate, Integer> dailyCounts = new HashMap<>();
            String calendarJson = matchedUser.path("submissionCalendar").asText("{}");
            JsonNode calendar = objectMapper.readTree(calendarJson);
            // Jackson 3.x: properties() returns Set<Map.Entry<String, JsonNode>>
            for (Map.Entry<String, JsonNode> entry : calendar.properties()) {
                try {
                    long epochSeconds = Long.parseLong(entry.getKey());
                    int count = entry.getValue().asInt();
                    LocalDate date = Instant.ofEpochSecond(epochSeconds)
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    dailyCounts.merge(date, count, Integer::sum);
                } catch (NumberFormatException ignored) {
                    // skip malformed entries
                }
            }
            
            List<ContributionData> contributions = dailyCounts.entrySet().stream()
                    .map(e -> new ContributionData(e.getKey(), e.getValue()))
                    .collect(Collectors.toList());

            // --- Badges ---
            List<BadgeData> badges = new ArrayList<>();
            JsonNode badgesNode = matchedUser.path("badges");
            for (JsonNode b : badgesNode) {
                String name = b.path("displayName").asText();
                String icon = b.path("icon").asText("");
                String creationStr = b.path("creationDate").asText("");
                LocalDate date;
                try {
                    date = creationStr.length() >= 10
                            ? LocalDate.parse(creationStr.substring(0, 10))
                            : LocalDate.now();
                } catch (Exception e) {
                    date = LocalDate.now();
                }
                // icon can be a relative path or full URL
                String iconUrl = icon.startsWith("http") ? icon : "https://leetcode.com" + icon;
                badges.add(new BadgeData(name, iconUrl, date));
            }

            // --- Contest history ---
            List<ContestData> contests = new ArrayList<>();
            JsonNode historyNode = root.path("data").path("userContestRankingHistory");
            if (!historyNode.isMissingNode() && historyNode.isArray()) {
                for (JsonNode c : historyNode) {
                    try {
                        String title = c.path("contest").path("title").asText();
                        long startTime = c.path("contest").path("startTime").asLong();
                        long rating = Math.round(c.path("rating").asDouble());
                        LocalDate contestDate = Instant.ofEpochSecond(startTime)
                                .atZone(ZoneId.systemDefault()).toLocalDate();
                        contests.add(new ContestData(title, contestDate, rating));
                    } catch (Exception ignored) {
                        // skip malformed contest entry
                    }
                }
            }

            // --- Problems Solved ---
            ProblemStatsData problemsSolved = null;
            JsonNode submitStats = matchedUser.path("submitStatsGlobal").path("acSubmissionNum");
            if (submitStats.isArray() && submitStats.size() > 0) {
                int total = 0, easy = 0, medium = 0, hard = 0;
                for (JsonNode stat : submitStats) {
                    String diff = stat.path("difficulty").asText("");
                    int count = stat.path("count").asInt(0);
                    if ("All".equalsIgnoreCase(diff)) total = count;
                    else if ("Easy".equalsIgnoreCase(diff)) easy = count;
                    else if ("Medium".equalsIgnoreCase(diff)) medium = count;
                    else if ("Hard".equalsIgnoreCase(diff)) hard = count;
                }
                problemsSolved = new ProblemStatsData(total, easy, medium, hard);
            }

            return new PlatformSyncResult(contributions, badges, contests, problemsSolved);

        } catch (PlatformFetchException e) {
            throw e;
        } catch (Exception e) {
            throw new PlatformFetchException("Failed to fetch LeetCode data for " + externalUsername + ": " + e.getMessage(), e);
        }
    }
}
