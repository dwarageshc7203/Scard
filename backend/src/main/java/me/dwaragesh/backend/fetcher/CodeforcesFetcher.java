package me.dwaragesh.backend.fetcher;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.fetcher.dto.BadgeData;
import me.dwaragesh.backend.fetcher.dto.ContestData;
import me.dwaragesh.backend.fetcher.dto.ContributionData;
import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.fetcher.dto.ProblemStatsData;
import me.dwaragesh.backend.model.enums.Platform;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Component
public class CodeforcesFetcher implements PlatformFetcher {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CodeforcesFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Platform platform() {
        return Platform.CODEFORCES;
    }

    @Override
    public PlatformSyncResult fetch(String externalUsername) {
        try {
            // 1. Fetch User Info (for badges/rank)
            String userInfoUrl = "https://codeforces.com/api/user.info?handles=" + externalUsername;
            ResponseEntity<String> userResp = restTemplate.getForEntity(userInfoUrl, String.class);
            JsonNode userRoot = objectMapper.readTree(userResp.getBody());
            if (!"OK".equals(userRoot.path("status").asText())) {
                throw new PlatformFetchException("Codeforces user not found: " + externalUsername, null);
            }
            JsonNode userNode = userRoot.path("result").get(0);
            
            List<BadgeData> badges = new ArrayList<>();
            if (userNode.has("rank")) {
                String rank = userNode.path("rank").asText();
                badges.add(new BadgeData(
                        rank.substring(0, 1).toUpperCase() + rank.substring(1),
                        "https://codeforces.com/favicon.ico",
                        LocalDate.now()
                ));
            }

            // 2. Fetch User Rating History (for contests)
            String ratingUrl = "https://codeforces.com/api/user.rating?handle=" + externalUsername;
            ResponseEntity<String> ratingResp = restTemplate.getForEntity(ratingUrl, String.class);
            JsonNode ratingRoot = objectMapper.readTree(ratingResp.getBody());
            
            List<ContestData> contests = new ArrayList<>();
            if ("OK".equals(ratingRoot.path("status").asText())) {
                JsonNode history = ratingRoot.path("result");
                for (JsonNode c : history) {
                    String title = c.path("contestName").asText();
                    long rating = c.path("newRating").asLong();
                    long timeSeconds = c.path("ratingUpdateTimeSeconds").asLong();
                    LocalDate contestDate = Instant.ofEpochSecond(timeSeconds)
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                    contests.add(new ContestData(title, contestDate, rating));
                }
            }
            
            // Reverse so newest contests are first, then limit to latest 10
            Collections.reverse(contests);
            if (contests.size() > 10) {
                contests = contests.subList(0, 10);
            }

            // 3. Fetch User Status (for problems and heatmap)
            String statusUrl = "https://codeforces.com/api/user.status?handle=" + externalUsername;
            ResponseEntity<String> statusResp = restTemplate.getForEntity(statusUrl, String.class);
            JsonNode statusRoot = objectMapper.readTree(statusResp.getBody());
            
            Map<LocalDate, Integer> heatmapMap = new HashMap<>();
            Set<String> solvedProblems = new HashSet<>();
            int easy = 0, medium = 0, hard = 0;

            if ("OK".equals(statusRoot.path("status").asText())) {
                JsonNode submissions = statusRoot.path("result");
                for (JsonNode sub : submissions) {
                    if ("OK".equals(sub.path("verdict").asText())) {
                        // Heatmap
                        long timeSeconds = sub.path("creationTimeSeconds").asLong();
                        LocalDate date = Instant.ofEpochSecond(timeSeconds)
                                .atZone(ZoneId.systemDefault()).toLocalDate();
                        heatmapMap.put(date, heatmapMap.getOrDefault(date, 0) + 1);

                        // Problems
                        JsonNode problem = sub.path("problem");
                        String problemId = problem.path("contestId").asText() + problem.path("index").asText();
                        if (!solvedProblems.contains(problemId)) {
                            solvedProblems.add(problemId);
                            int rating = problem.path("rating").asInt(0);
                            if (rating > 0) {
                                if (rating < 1200) easy++;
                                else if (rating <= 1600) medium++;
                                else hard++;
                            } else {
                                // Default unrated to medium
                                medium++;
                            }
                        }
                    }
                }
            }

            List<ContributionData> contributions = heatmapMap.entrySet().stream()
                    .map(e -> new ContributionData(e.getKey(), e.getValue()))
                    .toList();
            
            ProblemStatsData problemStats = new ProblemStatsData(solvedProblems.size(), easy, medium, hard);

            return new PlatformSyncResult(contributions, badges, contests, problemStats);

        } catch (PlatformFetchException e) {
            throw e;
        } catch (Exception e) {
            throw new PlatformFetchException("Failed to fetch Codeforces data for " + externalUsername + ": " + e.getMessage(), e);
        }
    }
}
