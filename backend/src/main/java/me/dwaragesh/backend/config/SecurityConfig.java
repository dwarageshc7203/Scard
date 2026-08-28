package me.dwaragesh.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public org.springframework.session.web.http.CookieSerializer cookieSerializer() {
        org.springframework.session.web.http.DefaultCookieSerializer serializer = new org.springframework.session.web.http.DefaultCookieSerializer();
        serializer.setCookieName("JSESSIONID");
        serializer.setUseSecureCookie(true);
        serializer.setSameSite("Lax");
        serializer.setUseHttpOnlyCookie(true);
        return serializer;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        CookieCsrfTokenRepository csrfRepo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrfRepo.setCookieCustomizer(c -> c.sameSite("Lax"));

        http
                .authorizeHttpRequests(auth -> auth

                        // ── AUTHENTICATED-ONLY profile sub-paths ────────────────────────────
                        // These MUST be declared BEFORE the public {userName} wildcard below,
                        // otherwise Spring Security will match e.g. GET /api/profile/analytics
                        // as a public profile view where {userName} = "analytics".
                        .requestMatchers("/api/profile/analytics").authenticated()
                        .requestMatchers("/api/profile/check-username").permitAll()
                        .requestMatchers("/api/profile/check-linkedin").permitAll()
                        .requestMatchers("/api/profile/check-github").permitAll()
                        .requestMatchers("/api/profile/check-leetcode").permitAll()
                        .requestMatchers("/api/profile/check-mail").permitAll()
                        .requestMatchers("/api/profile/pfp").authenticated()
                        .requestMatchers("/api/profile/pfp/**").authenticated()
                        .requestMatchers("/api/profile/platforms").authenticated()
                        .requestMatchers("/api/profile/platforms/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/profile").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/profile").authenticated()

                        // ── PUBLIC profile endpoints ─────────────────────────────────────────
                        // Only GET on /api/profile/{userName} and its /export sub-path are public.
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}/export").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profile/{userName}/contributions").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/profiles").permitAll()

                        // ── PUBLIC static/asset endpoints ────────────────────────────────────
                        .requestMatchers("/api/banners").permitAll()
                        .requestMatchers("/api/images/**").permitAll()
                        .requestMatchers("/api/og/**").permitAll()

                        // ── EVERYTHING ELSE under /api requires authentication ────────────────
                        .requestMatchers("/api/**").authenticated()

                        // ── ACTUATOR endpoints ───────────────────────────────────────────────
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/actuator/**").denyAll()

                        // Allow non-API routes (OAuth redirects, static files, etc.)
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl(frontendUrl + "/?login=success", true)
                        .failureUrl(frontendUrl + "/?error=oauth_failure")
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl(frontendUrl + "/?logout=success")
                        .permitAll()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"error\": \"Unauthorized\"}");
                        })
                )
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepo)
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                )
                .addFilterAfter(
                        new CsrfCookieFilter(),
                        org.springframework.security.web.authentication.AnonymousAuthenticationFilter.class
                );

        return http.build();
    }
}
