package me.dwaragesh.backend.fetcher;

import me.dwaragesh.backend.exception.PlatformFetchException;
import me.dwaragesh.backend.fetcher.dto.BadgeData;
import me.dwaragesh.backend.fetcher.dto.ContestData;
import me.dwaragesh.backend.fetcher.dto.ContributionData;
import me.dwaragesh.backend.fetcher.dto.PlatformSyncResult;
import me.dwaragesh.backend.model.enums.Platform;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.HttpHeaders;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class GitHubFetcher implements PlatformFetcher{

    private static final String GRAPHQL_URL = "https://api.github.com/graphql";

    private static final String QUERY = """
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
        """;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${github.api.token}")
    private String githubToken;

    public GitHubFetcher(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public Platform platform() {
        return Platform.GITHUB;
    }

    @Override
    public PlatformSyncResult fetch(String externalUsername) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(githubToken != null ? githubToken.trim() : "");

            String body = objectMapper.writeValueAsString(new GraphQLRequest(QUERY,
                    new Variables(externalUsername)));

            HttpEntity<String> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GRAPHQL_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode weeks = root.path("data").path("user")
                    .path("contributionsCollection").path("contributionCalendar").path("weeks");

            java.util.Map<LocalDate, Integer> dailyCounts = new java.util.HashMap<>();
            for (JsonNode week : weeks) {
                for (JsonNode day : week.path("contributionDays")) {
                    LocalDate date = LocalDate.parse(day.path("date").asText());
                    int count = day.path("contributionCount").asInt();
                    dailyCounts.merge(date, count, Integer::sum);
                }
            }
            
            List<ContributionData> contributions = dailyCounts.entrySet().stream()
                    .map(e -> new ContributionData(e.getKey(), e.getValue()))
                    .toList();

            // GitHub has no native badge/contest concept — leave empty for now,
            // revisit later if you want derived badges (streaks, stars, etc.)
            List<BadgeData> badges = List.of();
            List<ContestData> contests = List.of();

            return new PlatformSyncResult(contributions, badges, contests, null);

        } catch (Exception e) {
            log.error("Failed to fetch GitHub data for {}", externalUsername, e);
            throw new PlatformFetchException("Failed to fetch GitHub data for " + externalUsername, e);
        }
    }

    private record GraphQLRequest(String query, Variables variables) {}
    private record Variables(String username) {}

}
